'use strict';

import fp from 'fastify-plugin';
import Sensible from '@fastify/sensible';

/**
 * This plugin adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
  await fastify.register(Sensible);
});
