import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  const { tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'DELETE',
    url: `${url}/:id`,
    schema: {
      tags: [tag],
      security,
      params: zodToJsonSchema(z.object({ id: z.string() })),
      response: {
        [StatusCodes.NO_CONTENT]: zodToJsonSchema(z.null()),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      const result = await fastify.prisma[model].delete({ where: { id: req.params.id } });
      await fastify.aCache.delByPrefix(cacheKeyPrefix);
      return result;
    },
  });
}
