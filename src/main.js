'use strict';
// Import the framework and instantiate it
// import Fastify from 'fastify';
import fastifyAutoload from '@fastify/autoload';
import { join } from 'desm';

import * as logger from './logger.js';

// Pass --options via CLI arguments in command to enable these options.
const options = {
  logger: logger.config[process.env.NODE_ENV] ?? true,
};

export { options };

export default async function (fastify, opts) {
  await fastify.register(fastifyAutoload, { dir: join(import.meta.url, 'plugins'), options: Object.assign({}, opts) });
  await fastify.register(fastifyAutoload, { dir: join(import.meta.url, 'routes'), options: Object.assign({}, opts) });
  await fastify.register(fastifyAutoload, { dir: join(import.meta.url, 'modules'), options: Object.assign({}, opts), dirNameRoutePrefix: true, autoHooks: true });
}
