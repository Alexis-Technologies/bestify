import crudifyUtils from './utils.js';
import crudifyFindAll from './find-all.js';
import crudifyFindById from './find-by-id.js';
import crudifyCreate from './create.js';
import crudifyCreateMany from './create-many.js';
import crudifyReplace from './replace.js';
import crudifyUpdate from './update.js';
import crudifyDelete from './delete.js';
import crudifyDeleteMany from './delete-many.js';

export async function Crudify(fastify, opts) {
  await fastify.register(crudifyUtils, opts);
  await fastify.register(crudifyFindAll);
  await fastify.register(crudifyFindById);
  await fastify.register(crudifyCreate);
  await fastify.register(crudifyCreateMany);
  await fastify.register(crudifyReplace);
  await fastify.register(crudifyUpdate);
  await fastify.register(crudifyDelete);
  await fastify.register(crudifyDeleteMany);
}
