'use strict';
import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ENV = {
  PROD: 'production',
  DEV: 'development',
  TEST: 'test',
};

const zodSchema = z.object({
  NODE_ENV: z.nativeEnum(ENV).optional().default(ENV.PROD),
  PORT: z.string().default('3000'),
  FASTIFY_ADDRESS: z.string().min(3).optional().default('localhost'),
  DATABASE_URL: z.string().min(3),
  AUTH0_DOMAIN: z.string().min(3),
  REDIS_HOST: z.string().min(3),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().min(3),
  REDIS_USERNAME: z.string().min(3),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_TTL: z.coerce.number().default(60000), // 1 minute
  CACHE_TTL: z.coerce.number().default(86400), // 1 day
});

export const options = {
  confKey: 'config', // optional, default: 'config'
  schema: zodToJsonSchema(zodSchema),
  dotenv: true, // load .env
};

export default fp(async function (fastify, opts) {
  await fastify.register(fastifyEnv, options);
  await fastify.decorate('env', {
    isProd: fastify.config.NODE_ENV === ENV.PROD,
    isDev: fastify.config.NODE_ENV === ENV.DEV,
    isTest: fastify.config.NODE_ENV === ENV.TEST
  });
}, {
  name: 'config',
  dependencies: [],
});
