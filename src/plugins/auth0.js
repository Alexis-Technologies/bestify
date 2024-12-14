'use strict';
import fp from 'fastify-plugin';
import fastifyAuth0Verify from 'fastify-auth0-verify';

export default fp(async function (fastify, opts) {
  await fastify.register(fastifyAuth0Verify, { domain: fastify.config.AUTH0_DOMAIN });
  fastify.after(() => fastify.log.info(`Auth0 connected to ${fastify.config.AUTH0_DOMAIN}`));
}, {
  name: 'auth0',
  dependencies: ['config'],
});
