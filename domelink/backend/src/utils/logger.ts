type LogMeta = Record<string, unknown>;

const timestamp = () => new Date().toISOString();

export const logger = {
  info(message: string, meta: LogMeta = {}) {
    console.log(JSON.stringify({ level: "info", ts: timestamp(), message, ...meta }));
  },
  warn(message: string, meta: LogMeta = {}) {
    console.warn(JSON.stringify({ level: "warn", ts: timestamp(), message, ...meta }));
  },
  error(message: string, meta: LogMeta = {}) {
    console.error(JSON.stringify({ level: "error", ts: timestamp(), message, ...meta }));
  },
};
