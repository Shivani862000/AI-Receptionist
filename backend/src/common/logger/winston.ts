import * as fs from "fs";
import * as path from "path";

import { createLogger, format, transports } from "winston";

const logsDir = path.join(process.cwd(), "logs");
fs.mkdirSync(logsDir, { recursive: true });

const sharedFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    const contextString = context ? ` [${String(context)}]` : "";
    const stackString = stack ? `\n${stack}` : "";

    return `${timestamp} ${level.toUpperCase()}${contextString} ${message}${metaString}${stackString}`;
  })
);

export const appWinstonLogger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: sharedFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), sharedFormat)
    }),
    new transports.File({
      filename: path.join(logsDir, "app.log")
    }),
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error"
    })
  ]
});
