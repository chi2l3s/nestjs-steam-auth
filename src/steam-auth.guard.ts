import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import type { Request } from 'express'

import { SteamAuthService } from './steam-auth.service'
import { SteamAuthResult } from './interfaces'

export interface RequestWithSteamUser extends Request {
	steamUser?: SteamAuthResult
}

@Injectable()
export class SteamAuthGuard implements CanActivate {
	public constructor(private readonly steamAuthService: SteamAuthService) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context
			.switchToHttp()
			.getRequest<RequestWithSteamUser>()

		if (!request.query) {
			throw new UnauthorizedException('Missing Steam callback query.')
		}

		request.steamUser = await this.steamAuthService.validateCallback(
			request.query as Record<string, string | string[] | undefined>
		)

		return true
	}
}
