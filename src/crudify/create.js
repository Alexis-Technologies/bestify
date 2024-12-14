import { StatusCodes } from 'http-status-codes';
import { zodToJsonSchema } from 'zod-to-json-schema';

export default async function (fastify) {
  const { entitySchema, tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'POST',
    url,
    schema: {
      tags: [tag],
      security,
      body: zodToJsonSchema(entitySchema.omit({ id: true })),
      response: {
        [StatusCodes.CREATED]: zodToJsonSchema(entitySchema),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      const result = await fastify.prisma[model].create({ data: req.body });
      await fastify.aCache.delByPrefix(cacheKeyPrefix);
      return result;
    },
  });
}
