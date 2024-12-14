'use strict';
import fp from 'fastify-plugin';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import fs from 'node:fs';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { join } from 'desm';

const httpCodes = JSON.parse(fs.readFileSync(join(import.meta.url, '../http-codes.json'), 'utf8'));

const getContent = (statusCode) => ({
  'application/json': {
    schema: zodToJsonSchema(
      z.object({
        statusCode: z.number().int().min(100).max(599).default(statusCode),
        code: z.string().optional(),
        error: z.string().default(getReasonPhrase(statusCode)),
        message: z.string(),
      })
    ),
  },
});

export default fp(async function (fastify, opts) {
  // Add default error responses to each route if not already defined, excluding Swagger routes
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url.startsWith('/docs')) {
      // Skip internal Swagger routes
      return;
    }

    routeOptions.schema = routeOptions.schema || {};
    routeOptions.schema.response = routeOptions.schema.response || {};

    const httpCodesEntries = httpCodes.map((httpObj) => [httpObj.code, httpObj]);

    // Add default responses only if they are not already defined in the route
    for (const [statusCode, httpObj] of httpCodesEntries) {
      if (httpObj.code < StatusCodes.BAD_REQUEST) continue;
      if (!routeOptions.schema.response[statusCode]) {
        routeOptions.schema.response[statusCode] = {
          description: httpObj.comment.description ?? httpObj.phrase,
          content: getContent(httpObj.code),
        };
      }
    }
  });
});
