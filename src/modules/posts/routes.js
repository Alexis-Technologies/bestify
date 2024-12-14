import { Crudify } from '../../crudify/index.js';

export default async function (fastify, opts) {
  await fastify.register(Crudify, { model: 'posts' });
}
