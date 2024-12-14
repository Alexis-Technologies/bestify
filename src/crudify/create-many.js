import { StatusCodes } from 'http-status-codes';
import { zodToJsonSchema } from 'zod-to-json-schema';
import z from 'zod';

export default async function (fastify) {
  const { entitySchema, tag, url, model, security, cacheKeyPrefix } = fastify.crudifyUtils;

  await fastify.route({
    method: 'POST',
    url: `${url}/batch`,
    schema: {
      tags: [tag],
      security,
      body: zodToJsonSchema(z.array(entitySchema.omit({ id: true }))),
      response: {
        [StatusCodes.CREATED]: zodToJsonSchema(z.array(entitySchema)),
      },
    },
    preValidation: fastify.authenticate,
    handler: async function (req, reply) {
      const result = await fastify.prisma[model].createMany({ data: req.body });
      await fastify.aCache.delByPrefix(cacheKeyPrefix);
      return result;
    },
  });
}
