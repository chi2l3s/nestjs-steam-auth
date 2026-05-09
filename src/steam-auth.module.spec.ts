import { Test } from '@nestjs/testing'

import { SteamAuthModule } from './steam-auth.module'
import { SteamAuthService } from './steam-auth.service'

describe('SteamAuthModule', () => {
	it('should compile with forRoot()', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				SteamAuthModule.forRoot({
					apiKey: 'test-api-key',
					realm: 'http://localhost:4000',
					returnUrl: 'http://localhost:4000/auth/steam/callback'
				})
			]
		}).compile()

		expect(moduleRef.get(SteamAuthService)).toBeInstanceOf(SteamAuthService)
	})

	it('should compile with forRootAsync()', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				SteamAuthModule.forRootAsync({
					useFactory: () => ({
						apiKey: 'test-api-key',
						realm: 'http://localhost:3000',
						returnUrl: 'http://localhost:3000/auth/steam/callback'
					})
				})
			]
		}).compile()

		expect(moduleRef.get(SteamAuthService)).toBeInstanceOf(SteamAuthService)
	})
})
