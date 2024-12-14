'use strict';
import fp from 'fastify-plugin';
import { fastifySchedule } from '@fastify/schedule';

export default fp(async function (fastify, opts) {
  await fastify.register(fastifySchedule);
  fastify.after(() => fastify.log.info(`Scheduler registered!`));
});
