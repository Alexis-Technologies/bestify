'use strict';
import fp from 'fastify-plugin';
import redis from '@fastify/redis';

export default fp(
  async function (fastify, opts) {
    await fastify.register(redis, {
      host: fastify.config.REDIS_HOST,
      port: fastify.config.REDIS_PORT,
      username: fastify.config.REDIS_USERNAME,
      password: fastify.config.REDIS_PASSWORD,
      closeClient: true,
    });
    fastify.after(() => fastify.log.info(`Redis connected to ${fastify.redis.options.host}:${fastify.redis.options.port}`));
  },
  {
    name: 'redis',
    dependencies: ['config'],
  }
);
