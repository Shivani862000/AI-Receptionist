import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Record<string, any>) {}

  get requestedBusinessId(): string | undefined {
    return this.request?.tenant?.requestedBusinessId;
  }

  get currentBusinessId(): string | undefined {
    return this.request?.user?.businessId ?? this.request?.tenant?.requestedBusinessId;
  }

  get currentRole(): string | undefined {
    return this.request?.user?.role;
  }

  get currentUserId(): string | undefined {
    return this.request?.user?.userId;
  }
}
