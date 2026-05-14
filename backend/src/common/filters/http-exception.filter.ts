import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

import { AppLoggerService } from "../logger/app-logger.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger?: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const parsed = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};

    this.logger?.error(
      `Request failed ${request?.method || "UNKNOWN"} ${request?.originalUrl || ""}`,
      exception instanceof Error ? exception.stack : undefined,
      HttpExceptionFilter.name,
      {
        statusCode: status,
        errorCode: (parsed.code as string) || defaultCode(status)
      }
    );

    response.status(status).json({
      success: false,
      message: (parsed.message as string) || (exception instanceof Error ? exception.message : "Internal server error"),
      error: {
        code: (parsed.code as string) || defaultCode(status),
        details: parsed.details || null
      }
    });
  }
}

function defaultCode(status: number) {
  if (status === 400) return "VALIDATION_ERROR";
  if (status === 401) return "AUTH_UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "RESOURCE_NOT_FOUND";
  return "INTERNAL_SERVER_ERROR";
}
