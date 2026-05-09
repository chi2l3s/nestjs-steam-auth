import { ModuleMetadata, Type } from '@nestjs/common'

export interface SteamAuthModuleOptions {
	/** Steam Web API key */
	apiKey: string

	/** Your app base URL, for example: http://localhost:3000 */
	realm: string

	/** Callback URL, for example: http://localhost:3000/auth/steam/callback */
	returnUrl: string

	/** Whether to fetch Steam profile after successful auth */
	fetchProfile?: boolean
}

export interface SteamAuthOptionsFactory {
	createSteamAuthOptions():
		| Promise<SteamAuthModuleOptions>
		| SteamAuthModuleOptions
}

export interface SteamAuthModuleAsyncOptions extends Pick<
	ModuleMetadata,
	'imports'
> {
	inject?: any[]
	useFactory?: (
		...args: any[]
	) => Promise<SteamAuthModuleOptions> | SteamAuthModuleOptions
	useClass?: Type<SteamAuthOptionsFactory>
	useExisting?: Type<SteamAuthOptionsFactory>
}
