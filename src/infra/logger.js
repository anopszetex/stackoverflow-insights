import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const rootLogger = pino({
  name: 'example-app',
  messageKey: 'message',
  level: isDev ? 'debug' : 'info',
  base: {
    version: process.env.APP_VERSION ?? 'unknown',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
  transport: isDev ? { target: 'pino-pretty' } : undefined,
});

export { rootLogger };
