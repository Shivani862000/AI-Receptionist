import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<{ message?: string; data: T; meta?: Record<string, unknown> }, unknown>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<{ message?: string; data: T; meta?: Record<string, unknown> }>
  ): Observable<unknown> {
    return next.handle().pipe(
      map((value) => ({
        success: true,
        message: value?.message || "OK",
        data: value?.data ?? null,
        meta: value?.meta
      }))
    );
  }
}
