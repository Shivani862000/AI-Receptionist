import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { CurrentUserType } from "../../../common/types/current-user.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
      issuer: configService.get<string>("jwt.issuer"),
      audience: configService.get<string>("jwt.audience")
    });
  }

  async validate(payload: CurrentUserType) {
    return payload;
  }
}
