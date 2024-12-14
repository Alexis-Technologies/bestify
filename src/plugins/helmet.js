'use strict';
import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async function (fastify, opts) {
  await fastify.register(helmet);
  await fastify.after(() => fastify.log.info(`Important security headers added by Helmet!`));
});
