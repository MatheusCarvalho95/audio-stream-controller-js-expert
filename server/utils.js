import pino from "pino";

const log = pino({
  enabled: !!!process.env.DISABLE_LOG,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const logger = log;
