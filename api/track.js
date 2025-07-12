import Redis from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RATE_LIMIT = 10; 
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  let { eventType, eventName, domain, timestamp, extra } = req.body || {};

  if (
    !eventType ||
    !domain ||
    typeof eventType !== 'string' ||
    typeof domain !== 'string' ||
    (eventName && typeof eventName !== 'string') ||
    (extra && typeof extra !== 'object')
  ) {
    return res.status(400).json({ error: 'Invalid event data' });
  }

  if (extra) {
    extra = JSON.parse(JSON.stringify(extra));
  } else {
    extra = {};
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const currentMinute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:${ip}:${currentMinute}`;

  try {
    const currentCount = await redis.get(rateKey);

    if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    await redis.incr(rateKey);
    if (!currentCount) {
      await redis.expire(rateKey, 120);
    }

    const eventCounterKey = `events:${domain}:${eventType}`;
    await redis.incr(eventCounterKey);

    const eventData = {
      eventType,
      eventName: eventName || null,
      domain,
      timestamp: timestamp || Date.now(),
      ip,
      extra,
    };

    const eventListKey = `eventlist:${domain}:${eventType}`;

    if (eventType === 'click' || eventType === 'interaction') {
      await redis.lpush(eventListKey, JSON.stringify(eventData));
      await redis.ltrim(eventListKey, 0, 999);
    } else if (eventType === 'pageview') {
      await redis.zadd(eventListKey, {
        score: eventData.timestamp,
        member: JSON.stringify(eventData),
      });

      const ninetyDaysAgo = Date.now() - NINETY_DAYS_MS;
      await redis.zremrangebyscore(eventListKey, 0, ninetyDaysAgo);
    } else {
      await redis.lpush(eventListKey, JSON.stringify(eventData));
      await redis.ltrim(eventListKey, 0, 999);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Redis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
