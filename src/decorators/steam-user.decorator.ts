import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SteamAuthResult } from "../interfaces/steam-auth-result.interface";
import { RequestWithSteamUser } from "../steam-auth.guard";

export const SteamUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): SteamAuthResult | undefined => {
        const request = ctx.switchToHttp().getRequest<RequestWithSteamUser>()
        return request.steamUser
    }
)