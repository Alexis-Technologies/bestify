'use strict';
import fp from 'fastify-plugin';
import UnderPressure from '@fastify/under-pressure';

export default fp(async function (fastify, opts) {
  await fastify.register(UnderPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 1000000000,
    maxRssBytes: 1000000000,
    maxEventLoopUtilization: 0.98,
    exposeStatusRoute: {
      routeResponseSchemaOpts: {
        metrics: {
          type: 'object',
          properties: {
            eventLoopDelay: { type: 'number' },
            rssBytes: { type: 'number' },
            heapUsed: { type: 'number' },
            eventLoopUtilized: { type: 'number' },
          },
        },
      },
    },
    healthCheck: async (fastifyInstance) => {
      return {
        metrics: fastifyInstance.memoryUsage(),
      };
    },
  });
});
