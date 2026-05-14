import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  constructor(message: string, code: string, status = HttpStatus.BAD_REQUEST, details?: unknown) {
    super(
      {
        message,
        code,
        details: details || null
      },
      status
    );
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(message = "Resource not found") {
    super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedAppException extends AppException {
  constructor(message = "Unauthorized") {
    super(message, "AUTH_UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
  }
}

export class ExternalProviderException extends AppException {
  constructor(message = "External provider request failed", details?: unknown) {
    super(message, "EXTERNAL_PROVIDER_ERROR", HttpStatus.BAD_GATEWAY, details);
  }
}
