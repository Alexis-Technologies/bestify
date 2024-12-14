import { z } from 'zod';

export default async function (fastify, opts) {
  await fastify.decorate('schema', {
    ...(fastify.schema ?? {}),
    users: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
  });
}
