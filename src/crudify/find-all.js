import { StatusCodes } from 'http-status-codes';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export default async function (fastify) {
  const { entitySchema, tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'GET',
    url,
    schema: {
      tags: [tag],
      security,
      response: {
        [StatusCodes.OK]: zodToJsonSchema(z.array(entitySchema)),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      console.log('USER:', req.user);
      const cached = await fastify.aCache.getByQueryParams(req.query, cacheKeyPrefix);
      if (cached) return cached;
      const result = await fastify.prisma[model].findMany();
      await fastify.aCache.setByQueryParams({ queryParams: req.query, prefix: cacheKeyPrefix }, result);
      return result;
    },
  });
}
