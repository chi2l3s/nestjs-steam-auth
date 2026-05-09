import { type DynamicModule, Module, type Provider } from '@nestjs/common'

import { STEAM_AUTH_OPTIONS } from './constants'
import type {
	SteamAuthModuleAsyncOptions,
	SteamAuthModuleOptions,
	SteamAuthOptionsFactory
} from './interfaces'
import { SteamAuthGuard } from './steam-auth.guard'
import { SteamAuthService } from './steam-auth.service'

@Module({})
export class SteamAuthModule {
	public static forRoot(options: SteamAuthModuleOptions): DynamicModule {
		return {
			module: SteamAuthModule,
			providers: [
				SteamAuthService,
				SteamAuthGuard,
				{
					provide: STEAM_AUTH_OPTIONS,
					useValue: options
				}
			],
			exports: [SteamAuthService, SteamAuthGuard]
		}
	}

	public static forRootAsync(
		options: SteamAuthModuleAsyncOptions
	): DynamicModule {
		return {
			module: SteamAuthModule,
			imports: options.imports ?? [],
			providers: [
				...this.createAsyncProviders(options),
				SteamAuthService,
				SteamAuthGuard
			],
			exports: [SteamAuthService, SteamAuthGuard]
		}
	}

	private static createAsyncProviders(
		options: SteamAuthModuleAsyncOptions
	): Provider[] {
		if (options.useFactory) {
			return [
				{
					provide: STEAM_AUTH_OPTIONS,
					useFactory: options.useFactory,
					inject: options.inject ?? []
				}
			]
		}

		const inject = options.useExisting ?? options.useClass

		if (!inject) {
			throw new Error(
				'Invalid SteamAuthModuleAsyncOptions: useFactory, useClass or useExisting is required.'
			)
		}

		const providers: Provider[] = [
			{
				provide: STEAM_AUTH_OPTIONS,
				useFactory: async (factory: SteamAuthOptionsFactory) =>
					factory.createSteamAuthOptions(),
				inject: [inject]
			}
		]

		if (options.useClass) {
			providers.push({
				provide: options.useClass,
				useClass: options.useClass
			})
		}

		return providers
	}
}
