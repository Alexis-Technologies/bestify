export const config = {
  development: {
    name: process.env.API_NAME || 'Test API',
    level: process.env.FASTIFY_LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'SYS:standard',
        ignore: 'reqId,pid,host,service',
      },
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        ip: req.ip,
        method: req.method,
        path: req.url,
        query: req.query,
        body: req.body,
      }),
      res: (res) => ({
        status: res.statusCode,
        payload: res.payload,
      }),
    },
  },
  production: true,
  test: false,
};
