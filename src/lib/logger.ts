const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  error: (...args: any[]) => {
    console.error(...args);
    // TODO: Integrar con servicio de logging (Sentry, LogRocket, etc.)
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};
