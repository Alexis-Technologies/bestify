'use strict';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const bodySchema = z.object({
  email: z.string(),
  password: z.string(),
});
const responseSchema = z.object({ token: z.string() });

export default async function(fastify, opts) {
  await fastify.route({
    method: 'POST',
    url: '/sign-up',
    schema: {
      tags: ['Auth'],
      body: zodToJsonSchema(bodySchema),
      response: {
        200: zodToJsonSchema(responseSchema),
      },
    },
    handler: async (request, reply) => {
      return { hello: 'world' };
    },
  });
}
