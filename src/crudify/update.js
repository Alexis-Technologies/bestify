import { StatusCodes } from 'http-status-codes';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export default async function (fastify) {
  const { entitySchema, tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'PATCH',
    url: `${url}/:id`,
    schema: {
      tags: [tag],
      security,
      params: zodToJsonSchema(z.object({ id: z.string() })),
      body: zodToJsonSchema(entitySchema.omit({ id: true }).partial()),
      response: {
        [StatusCodes.OK]: zodToJsonSchema(entitySchema),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      const result = await fastify.prisma[model].update({ where: { id: req.params.id }, data: req.body });
      await fastify.aCache.delByPrefix(cacheKeyPrefix);
      return result;
    },
  });
}
