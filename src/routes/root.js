'use strict';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const querystringSchema = z.object({ name: z.string() });
const responseSchema = z.object({ hello: z.string(), memory: z.number() });

export default async function (fastify, opts) {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: zodToJsonSchema(querystringSchema),
      response: {
        200: zodToJsonSchema(responseSchema),
      },
    },
    // this function is executed for every request before the handler is executed
    preHandler: async (request, reply) => {
      // E.g. check authentication
    },
    handler: async (request, reply) => {
      // throw reply.notFound();
      console.log(fastify.memoryUsage());
      return { hello: 'world', memory: 1 };
    },
  });
}
