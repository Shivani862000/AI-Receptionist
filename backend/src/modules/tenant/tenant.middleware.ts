import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(request: Request & { tenant?: Record<string, unknown> }, _response: Response, next: NextFunction) {
    const headerBusinessId = request.headers["x-business-id"];
    const queryBusinessId = typeof request.query.businessId === "string" ? request.query.businessId : undefined;

    request.tenant = {
      requestedBusinessId:
        typeof headerBusinessId === "string" ? headerBusinessId : queryBusinessId,
    };

    next();
  }
}
