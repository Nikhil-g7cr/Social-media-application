import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AppConfig } from "src/config/AppConfig";
import { JwtPayload } from "../models/jwt-payload.model";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly appConfig: AppConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.get("jwt").appAXTSecret,
    });
  }

  /**
   * This method is called automatically after the JWT is successfully verified.
   * Whatever is returned here will be attached to req.user.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}