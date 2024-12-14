import { StatusCodes } from 'http-status-codes';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export default async function (fastify) {
  const { entitySchema, tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'GET',
    url: `${url}/:id`,
    schema: {
      tags: [tag],
      security,
      params: zodToJsonSchema(z.object({ id: z.string() })),
      response: {
        [StatusCodes.OK]: zodToJsonSchema(entitySchema),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      const { id } = req.params;
      const cached = await fastify.aCache.getByQueryParams(req.query, `${cacheKeyPrefix}:${id}`);
      if (cached) return cached;
      const result = await fastify.prisma[model].findUnique({ where: { id } });
      await fastify.aCache.setByQueryParams({ queryParams: req.query, prefix: `${cacheKeyPrefix}:${id}` }, result);
      return result;
    },
  });
}
