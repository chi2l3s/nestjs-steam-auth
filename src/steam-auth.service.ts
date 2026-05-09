import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'

import {
	STEAM_API_PLAYER_SUMMARIES_URL,
	STEAM_AUTH_OPTIONS,
	STEAM_OPENID_IDENTIFIER_SELECT,
	STEAM_OPENID_NS,
	STEAM_OPENID_PROVIDER_URL
} from './constants'
import type {
	SteamAuthModuleOptions,
	SteamAuthResult,
	SteamPlayerSummariesResponse,
	SteamPlayerSummary
} from './interfaces'

export type SteamOpenIdCallbackQuery = Record<
	string,
	string | string[] | undefined
>

@Injectable()
export class SteamAuthService {
	public constructor(
		@Inject(STEAM_AUTH_OPTIONS)
		private readonly options: SteamAuthModuleOptions
	) {}

	public getRedirectUrl(): string {
		const params = new URLSearchParams({
			'openid.ns': STEAM_OPENID_NS,
			'openid.mode': 'checkid_setup',
			'openid.return_to': this.options.returnUrl,
			'openid.realm': this.options.realm,
			'openid.identity': STEAM_OPENID_IDENTIFIER_SELECT,
			'openid.claimed_id': STEAM_OPENID_IDENTIFIER_SELECT
		})

		return `${STEAM_OPENID_PROVIDER_URL}?${params.toString()}`
	}

	public async validateCallback(
		query: SteamOpenIdCallbackQuery
	): Promise<SteamAuthResult> {
		const isValid = await this.verifyResponse(query)

		if (!isValid) {
			throw new UnauthorizedException('Invalid Steam OpenID response.')
		}

		const claimedId = this.getRequiredParam(query, 'openid.claimed_id')
		const steamId = this.extractSteamId(claimedId)

		const fetchProfile = this.options.fetchProfile !== false
		const profile = fetchProfile
			? await this.getPlayerSummary(steamId)
			: null

		return {
			steamId,
			claimedId,
			profile
		}
	}

	public async verifyResponse(
		query: SteamOpenIdCallbackQuery
	): Promise<boolean> {
		const params = new URLSearchParams()

		for (const [key, value] of Object.entries(query)) {
			if (typeof value === 'string') {
				params.set(key, value)
			}
		}

		params.set('openid.mode', 'check_authentication')

		const res = await fetch(STEAM_OPENID_PROVIDER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		})

		if (!res.ok) {
			return false
		}

		const text = await res.text()

		return text.includes('is_valid:true')
	}

	public extractSteamId(claimedId: string): string {
		const match = claimedId.match(
			/^https:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
		)

		if (!match?.[1]) {
			throw new UnauthorizedException('Invalid Steam claimed_id.')
		}

		return match[1]
	}

	public async getPlayerSummary(
		steamId: string
	): Promise<SteamPlayerSummary | null> {
		const url = new URL(STEAM_API_PLAYER_SUMMARIES_URL)
		url.searchParams.set('key', this.options.apiKey)
		url.searchParams.set('steamids', steamId)

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Steam API error: ${res.status} ${res.statusText}`)
		}

		const data = (await res.json()) as SteamPlayerSummariesResponse

		return data.response.players[0] ?? null
	}

	private getRequiredParam(
		query: SteamOpenIdCallbackQuery,
		key: string
	): string {
		const value = query[key]

		if (typeof value !== 'string' || value.length === 0) {
			throw new UnauthorizedException(
				`Missing required query parameter: ${key}`
			)
		}

		return value
	}
}
