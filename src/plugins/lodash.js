'use strict';
import fp from 'fastify-plugin';

const toCapitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export default fp(async function (fastify, opts) {
  await fastify.decorate('lodash', {
    toCapitalize,
  });
});
