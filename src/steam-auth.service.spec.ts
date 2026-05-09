import { UnauthorizedException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { STEAM_AUTH_OPTIONS } from './constants'
import { SteamAuthService } from './steam-auth.service'

describe('SteamAuthService', () => {
	let service: SteamAuthService

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				SteamAuthService,
				{
					provide: STEAM_AUTH_OPTIONS,
					useValue: {
						apiKey: 'test-api-key',
						realm: 'http://localhost:4000',
						returnUrl: 'http://localhost:4000/auth/steam/callback',
						fetchProfile: true
					}
				}
			]
		}).compile()

		service = moduleRef.get(SteamAuthService)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should generate Steam redirect URL', () => {
		const url = service.getRedirectUrl()

		expect(url).toContain('https://steamcommunity.com/openid/login')
		expect(url).toContain('openid.mode=checkid_setup')
		expect(url).toContain('openid.return_to=')
		expect(url).toContain('openid.realm')
	})

	it('should extract Steam ID from claimed_id', () => {
		const steamId = service.extractSteamId(
			'https://steamcommunity.com/openid/id/76561198000000000'
		)

		expect(steamId).toBe('76561198000000000')
	})

	it('should throw error for invalid claimed_id', () => {
		expect(() => service.extractSteamId('dilduck')).toThrow(
			UnauthorizedException
		)
	})

	it('should verify valid OpenID response', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: async () =>
				'ns:http://specs.openid.net/auth/2.0\nis_valid:true'
		}) as jest.Mock

		const result = await service.verifyResponse({
			'openid.mode': 'id_res',
			'openid.claimed_id':
				'https://steamcommunity.com/openid/id/76561198000000000'
		})

		expect(result).toBe(true)
	})

	it('should reject invalid OpenID response', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: async () => 'is_valid:false'
		}) as jest.Mock

		const result = await service.verifyResponse({
			'openid.mode': 'id_res'
		})

		expect(result).toBe(false)
	})

	it('should fetch Steam player summary', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				response: {
					players: [
						{
							steamid: '76561198000000000',
							personaname: 'TestUser',
							profileurl: 'https://steamcommunity.com/id/test',
							avatar: 'avatar.jpg',
							avatarmedium: 'avatar_medium.jpg',
							avatarfull: 'avatar_full.jpg'
						}
					]
				}
			})
		}) as jest.Mock

		const profile = await service.getPlayerSummary('76561198000000000')

		expect(profile).toEqual({
			steamid: '76561198000000000',
			personaname: 'TestUser',
			profileurl: 'https://steamcommunity.com/id/test',
			avatar: 'avatar.jpg',
			avatarmedium: 'avatar_medium.jpg',
			avatarfull: 'avatar_full.jpg'
		})
	})
})
