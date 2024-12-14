import { readFileSync } from 'node:fs';
import { join } from 'desm';
import fp from 'fastify-plugin';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';

const { version } = JSON.parse(readFileSync(join(import.meta.url, '../../package.json')));

async function swaggerGenerator(fastify, opts) {
  // Swagger documentation generator for Fastify.
  // It uses the schemas you declare in your routes to generate a swagger compliant doc.
  // https://github.com/fastify/fastify-swagger
  const servers = [];
  if (fastify.env.isDev) {
    servers.push({
      url: `http://${fastify.config.FASTIFY_ADDRESS}:${fastify.config.PORT}`,
      description: 'Development server',
    });
  }
  await fastify.register(Swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Fastify Todo API',
        description: 'Testing the Fastify Todo API',
        version,
      },
      servers,
      components: {
        securitySchemes: {
          Bearer: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      // security: [
      //   {
      //     Bearer: [],
      //   },
      // ],
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
    },
    // let's expose the documentation only in development
    // it's up to you decide who should see this page,
    // but it's always better to start safe.
    exposeRoute: fastify.env.isDev,
  });

  if (fastify.env.isDev) {
    await fastify.register(SwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next(); },
        preHandler: function (request, reply, next) { next(); }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject; },
      transformSpecificationClone: true
    });
  }
}

export default fp(swaggerGenerator, {
  name: 'swaggerGenerator',
});
