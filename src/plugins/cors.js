'use strict';
import fp from 'fastify-plugin';
import Cors from '@fastify/cors';

export default fp(async function (fastify, opts) {
  await fastify.register(Cors, { origin: false });
});
