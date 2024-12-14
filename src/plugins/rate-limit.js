'use strict';
import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';

const getRateLimitTTLStr = (rateLimitTTL) => {
  if (rateLimitTTL >= 1000 * 60 * 60 * 24) {
    return `${rateLimitTTL / (1000 * 60 * 60 * 24)} days`;
  }
  if (rateLimitTTL >= 1000 * 60 * 60) {
    return `${rateLimitTTL / (1000 * 60 * 60)} hours`;
  }
  if (rateLimitTTL >= 1000 * 60) {
    return `${rateLimitTTL / (1000 * 60)} minutes`;
  }
  if (rateLimitTTL >= 1000) {
    return `${rateLimitTTL / 1000} seconds`;
  }
  return `${rateLimitTTL} milliseconds`;
};

export default fp(
  async function (fastify, opts) {
    await fastify.register(fastifyRateLimit, {
      max: fastify.config.RATE_LIMIT_MAX,
      timeWindow: fastify.config.RATE_LIMIT_TTL,
      redis: fastify.redis,
      nameSpace: 'fastify-rate-limit-todo-api',
    });
    fastify.after(() => {
      fastify.log.info(`Rate limit set to ${fastify.config.RATE_LIMIT_MAX} requests per ${getRateLimitTTLStr(fastify.config.RATE_LIMIT_TTL)}`);
      fastify.log.info(`Rate limit connected to Redis!`);
    });
  },
  {
    name: 'rate-limit',
    dependencies: ['config', 'redis'],
  }
);
