'use strict';

export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const users = await fastify.aCache.get('fastifyUsers');
    if (users) return users;
    const result = await fastify.prisma.users.findMany({ select: { id: true, name: true } });
    await fastify.cache.set('fastifyUsers', result, 1000 * 60);
    return result;
  });
}
