// /api/stats.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const DEFAULT_EVENT_TYPES = ['pageview', 'click', 'interaction'];

async function getRecentEvents(domain, eventType, limit = 1000) {
  const eventListKey = `eventlist:${domain}:${eventType}`;
  const raw = await redis.lrange(eventListKey, 0, limit - 1);
  return raw.map((r) => {
    try {
      return JSON.parse(r);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

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
    const eventTypes = eventType ? [eventType] : DEFAULT_EVENT_TYPES;

    const stats = {};
    for (const type of eventTypes) {
      if (type === 'pageview') {
        const count = await redis.get(`count:${domain}:pageviews`);
        stats[type] = parseInt(count || '0', 10);
      } else {
        const count = await redis.get(`events:${domain}:${type}`);
        stats[type] = parseInt(count || '0', 10);
      }
    }

    const pageviewAgg = eventTypes.includes('pageview')
      ? await redis.hgetall(`agg:${domain}:pageviews`)
      : {};

    const parsedAgg = {};
    for (const [key, val] of Object.entries(pageviewAgg || {})) {
      parsedAgg[key] = parseInt(val, 10);
    }

    const detailed = {};
    for (const type of eventTypes) {
      let limit = 1000;
      if (type === 'pageview') limit = 100;
      detailed[type] = await getRecentEvents(domain, type, limit);
    }

    return res.status(200).json({
      domain,
      stats,
      pageviewAggregates: parsedAgg,
      recentEvents: detailed,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
