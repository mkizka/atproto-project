import { env } from "./env";

type LogLevel = typeof env.LOG_LEVEL;

// https://docs.railway.app/guides/logs#structured-logs
type StructuredLog = {
  message: string;
  level: LogLevel;
  [key: string]: string | number | boolean | object | null;
};

type LogFunction = (message: string, data?: object) => void;

type Logger = {
  [level in LogLevel]: LogFunction;
};

const logLevelsOrder = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} satisfies Record<LogLevel, number>;

const isLower = (a: LogLevel, b: LogLevel) => {
  return logLevelsOrder[a] < logLevelsOrder[b];
};

const railwayLog = (log: StructuredLog) => {
  if (env.NODE_ENV === "test" || isLower(log.level, env.LOG_LEVEL)) {
    return;
  }
  // eslint-disable-next-line no-console
  console[log.level](JSON.stringify(log));
};

export const createLogger = (name: string): Logger => {
  return {
    debug(message, data) {
      railwayLog({ level: "debug", message, name, ...data });
    },
    info(message, data) {
      railwayLog({ level: "info", message, name, ...data });
    },
    warn(message, data) {
      railwayLog({ level: "warn", message, name, ...data });
    },
    error(message, data) {
      railwayLog({ level: "error", message, name, ...data });
    },
  };
};
