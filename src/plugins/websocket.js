'use strict';
import fp from 'fastify-plugin';
import ws from '@fastify/websocket';

export default fp(async function (fastify, opts) {
  await fastify.decorate(ws);
});
