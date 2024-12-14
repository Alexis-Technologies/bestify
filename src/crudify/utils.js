'use strict';
import fp from 'fastify-plugin';

export default fp(async function (fastify, opts) {
  const model = opts.model;
  const entitySchema = opts.schema ?? fastify.schema[model];
  const tag = fastify.lodash.toCapitalize(model);
  const url = opts.url ?? '';
  const security = opts.security ?? [{ Bearer: [] }];

  await fastify.decorate('crudifyUtils', {
    entitySchema,
    tag,
    url,
    model,
    security,
    cacheKeyPrefix: `crudify:${model}`,
  });
});
