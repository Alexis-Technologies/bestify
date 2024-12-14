'use strict';
import fp from 'fastify-plugin';
import fastifyCaching from '@fastify/caching';
import { stringify } from 'qs';

import { Transform, Readable } from 'node:stream';

function mapKey(inputKey, segment, encodeKey = true) {
  if (!encodeKey) return [segment, inputKey].filter(Boolean).join(':');
  const parts = [];
  if (typeof inputKey === 'string') {
    parts.push(encodeURIComponent(segment));
    parts.push(encodeURIComponent(inputKey));
  } else {
    parts.push(encodeURIComponent(inputKey.segment));
    parts.push(encodeURIComponent(inputKey.id));
  }
  return parts.join(':');
}

const proto = {
  delete: function (key) {
    const _key = mapKey(key, this._segment, this._encodeKey);
    return this._redis.del(_key);
  },

  disconnect: function () {
    return this._redis.disconnect();
  },

  get: function (key) {
    const _key = mapKey(key, this._segment, this._encodeKey);
    return this._redis.get(_key).then((result) => {
      if (!result) return Promise.resolve(result);
      const _result = JSON.parse(result);
      const now = Date.now();
      const expires = _result.ttl + _result.stored;
      const ttl = expires - now;
      return Promise.resolve({
        item: _result.item,
        stored: _result.stored,
        ttl,
      });
    });
  },

  has: function (key) {
    const _key = mapKey(key, this._segment, this._encodeKey);
    return this._redis.exists(_key).then((result) => Boolean(result));
  },

  keys: function (pattern) {
    const _key = mapKey(pattern, this._segment, this._encodeKey);
    return this._redis.keys(_key).then((result) => {
      const res = result.map((e) => e.split(':')[1]);
      return Promise.resolve(res);
    });
  },

  scan: function (cursor, matchOption, pattern, countOption, count) {
    const _key = pattern && mapKey(pattern, this._segment, this._encodeKey);
    const args = [cursor];
    matchOption && args.push(matchOption);
    _key && args.push(_key);
    countOption && args.push(countOption);
    !isNaN(count) && args.push(count);
    return this._redis.scan(...args).then(([nextCursor, result]) => Promise.resolve([nextCursor, result.map((e) => e.split(':')[1])]));
  },

  keysScan: async function (pattern = '*') {
    const keys = [];
    let cursor = 0;

    do {
      const { cursor: newCursor, keys: newKeys } = await this._redis.scan(cursor, {
        MATCH: mapKey(pattern, this._segment, this._encodeKey),
        COUNT: 1000,
      });

      cursor = newCursor;
      if (!newKeys.length) break;

      keys.push(...newKeys);
    } while (cursor !== 0);

    return keys;
  },

  scanStream: function (options) {
    const segmentTransformer = new Transform({
      readableObjectMode: true,
      writableObjectMode: true,
      transform(chunk, encoding, done) {
        this.push(chunk.map((e) => e.split(':')[1]));
        done();
      },
    });
    const stream = this._redis.scanStream(options).pipe(segmentTransformer);
    return Readable.from(stream);
  },

  quit: function () {
    return this._redis.quit();
  },

  set: function (key, value, ttl) {
    const _key = mapKey(key, this._segment, this._encodeKey);
    const payload = {
      item: value,
      stored: Date.now(),
      ttl,
    };
    return this._redis.set(_key, JSON.stringify(payload), 'PX', ttl);
  },
};

function abstractCacheRedisFactory(config) {
  const _config = config || {};
  if (!_config.client && !_config.ioredis) throw Error('abstract-cache-redis: invalid configuration');

  const instance = Object.create(proto);
  const client = _config.client;
  const segment = _config.segment || 'abstractCacheRedis';
  const encodeKey = _config.encodeKey ?? true;
  Object.defineProperties(instance, {
    await: {
      enumerable: false,
      value: true,
    },
    _redis: {
      enumerable: false,
      value: client,
    },
    _segment: {
      enumerable: false,
      value: segment,
    },
    _encodeKey: {
      enumerable: false,
      value: encodeKey,
    },
  });
  return instance;
}

export default fp(
  async function (fastify, opts) {
    await fastify.register(fastifyCaching, {
      cache: abstractCacheRedisFactory({ client: fastify.redis, segment: 'abstractCacheRedisFASTIFY', encodeKey: false }),
    });
    fastify.after(() => fastify.log.info(`Cache connected to Redis!`));

    const buildCacheKeyByQueryParams = (queryParams, prefix) => {
      if (!queryParams) return prefix || '';
      const queryStr = stringify(queryParams, {
        encode: false,
        delimiter: ':',
        allowDots: true,
        skipNulls: true,
        arrayFormat: 'comma',
      });
      if (!queryStr) return prefix || '';
      return prefix ? `${prefix}:${queryStr}` : queryStr;
    };
    const get = async (key) => {
      const result = await fastify.cache.get(key);
      return result?.item;
    };
    const set = async (key, value, ttl) => {
      await fastify.cache.set(key, value, ttl ?? fastify.config.CACHE_TTL);
    };
    const getByQueryParams = async (queryParams, prefix) => {
      return await get(buildCacheKeyByQueryParams(queryParams, prefix));
    };
    const setByQueryParams = async ({ queryParams, prefix }, value, ttl) => {
      await set(buildCacheKeyByQueryParams(queryParams, prefix), value, ttl);
    };
    const delByPrefix = async (prefix) => {
      if (!prefix) return;
      const keys = await fastify.cache.keysScan(`${prefix}*`);
      if (!keys.length) return;
      await fastify.redis.del(...keys);
    };

    fastify.decorate('aCache', {
      ...fastify.cache,
      get,
      set,
      buildCacheKeyByQueryParams,
      getByQueryParams,
      setByQueryParams,
      delByPrefix,
    });
  },
  {
    name: 'cache',
    dependencies: ['config', 'redis'],
  }
);
