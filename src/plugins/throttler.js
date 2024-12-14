'use strict';
import fp from 'fastify-plugin';
import fastifyThrottle from '@fastify/throttle';

const getBytesPerSecondStr = (bytesPerSecond) => {
  if (bytesPerSecond >= 1024 * 1024 * 1024) {
    return `${bytesPerSecond / (1024 * 1024 * 1024)} GB/s`;
  }
  if (bytesPerSecond >= 1024 * 1024) {
    return `${bytesPerSecond / (1024 * 1024)} MB/s`;
  }
  if (bytesPerSecond >= 1024) {
    return `${bytesPerSecond / 1024} KB/s`;
  }
  return `${bytesPerSecond} B/s`;
};

export default fp(
  async function (fastify, opts) {
    const bytesPerSecond = 1024 * 1024 * 100; // 100MB/s
    await fastify.register(fastifyThrottle, {
      bytesPerSecond,
      streamPayloads: true, // throttle the payload if it is a stream
      bufferPayloads: true, // throttle the payload if it is a Buffer
      stringPayloads: true // throttle the payload if it is a string
    });
    fastify.after(() => {
      fastify.log.info(`Throttler set to ${getBytesPerSecondStr(bytesPerSecond)}`);
    });
  },
  {
    name: 'throttler',
    dependencies: ['config'],
  }
);
