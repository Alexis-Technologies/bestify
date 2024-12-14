'use strict';
import fp from 'fastify-plugin';
import fastifyPrisma from '@joggr/fastify-prisma';

export default fp(async function (fastify, opts) {
  await fastify.register(fastifyPrisma, {
    clientConfig: {
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    },
  });
  await fastify.prisma.$use(async (params, next) => {
    const before = Date.now();

    const result = await next(params);

    const after = Date.now();

    fastify.log.info(`Query ${params.model}.${params.action} took ${after - before}ms`);

    return result;
  });
  await fastify.prisma.$on('query', (e) => {
    fastify.log.debug(e);
  });
  await fastify.prisma.$on('info', (e) => {
    fastify.log.info(e);
  });
  await fastify.prisma.$on('warn', (e) => {
    fastify.log.warn(e);
  });
  await fastify.prisma.$on('error', (e) => {
    fastify.log.error(e);
  });
  fastify.after(() => fastify.log.info(`Prisma connected to DB!`));
});
