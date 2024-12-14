import { z } from 'zod';

export default async function (fastify, opts) {
  await fastify.decorate('schema', {
    ...(fastify.schema ?? {}),
    posts: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      published: z.boolean(),
      viewCount: z.number().int().min(0),
      authorId: z.string(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
    }),
  });
}
