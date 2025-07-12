import Redis from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const DEFAULT_EVENT_TYPES = ['pageview', 'click', 'interaction'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { domain, eventType } = req.query;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "domain" query param' });
  }

  try {
    const eventTypes = eventType
      ? [eventType]
      : DEFAULT_EVENT_TYPES;

    const stats = {};
    for (const type of eventTypes) {
      const key = `events:${domain}:${type}`;
      const count = await redis.get(key);
      stats[type] = parseInt(count || '0', 10);
    }

    const detailed = {};

    for (const type of eventTypes) {
      const listKey = `eventlist:${domain}:${type}`;

      if (type === 'pageview') {
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const result = await redis.zrangebyscore(listKey, ninetyDaysAgo, '+inf', {
          withScores: false,
          count: 500,
        });

        detailed[type] = result.map((raw) => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }).filter(Boolean);
      } else {
        const result = await redis.lrange(listKey, 0, 499);

        detailed[type] = result.map((raw) => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }).filter(Boolean);
      }
    }

    return res.status(200).json({
      domain,
      stats,
      recentEvents: detailed,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
