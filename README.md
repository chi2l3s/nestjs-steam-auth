# nestjs-steam-auth

Современный модуль авторизации через Steam OpenID для NestJS-приложений.

`nestjs-steam-auth` берет на себя типовой поток входа через Steam: формирует URL для редиректа, проверяет callback от Steam, извлекает `steamId` и, при необходимости, загружает публичный профиль игрока через Steam Web API.

## Возможности

- Авторизация через Steam OpenID 2.0.
- Готовый `SteamAuthModule` для NestJS.
- Синхронная и асинхронная конфигурация через `forRoot()` и `forRootAsync()`.
- `SteamAuthGuard` для обработки callback-запроса.
- Декоратор `@SteamUser()` для получения результата авторизации в контроллере.
- Получение Steam-профиля через `ISteamUser/GetPlayerSummaries`.
- Полная поддержка TypeScript.

## Установка

```bash
npm install nestjs-steam-auth
```

Пакет ожидает, что в проекте уже используются NestJS и Express-платформа.

## Быстрый старт

Подключите модуль в корневом или auth-модуле приложения:

```ts
import { Module } from '@nestjs/common'
import { SteamAuthModule } from 'nestjs-steam-auth'

@Module({
	imports: [
		SteamAuthModule.forRoot({
			apiKey: process.env.STEAM_API_KEY!,
			realm: 'http://localhost:3000',
			returnUrl: 'http://localhost:3000/auth/steam/callback',
			fetchProfile: true
		})
	]
})
export class AppModule {}
```

Добавьте контроллер для начала авторизации и обработки callback:

```ts
import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import {
	SteamAuthGuard,
	SteamAuthResult,
	SteamAuthService,
	SteamUser
} from 'nestjs-steam-auth'

@Controller('auth/steam')
export class AuthSteamController {
	constructor(private readonly steamAuthService: SteamAuthService) {}

	@Get()
	public redirectToSteam(@Res() response: Response): void {
		response.redirect(this.steamAuthService.getRedirectUrl())
	}

	@Get('callback')
	@UseGuards(SteamAuthGuard)
	public handleCallback(@SteamUser() user: SteamAuthResult): SteamAuthResult {
		return user
	}
}
```

После этого пользовательский поток выглядит так:

1. Пользователь открывает `/auth/steam`.
2. Приложение перенаправляет его на Steam.
3. Steam возвращает пользователя на `/auth/steam/callback`.
4. `SteamAuthGuard` проверяет OpenID-ответ.
5. `@SteamUser()` возвращает `steamId`, `claimedId` и профиль Steam.

## Асинхронная конфигурация

Если параметры нужно брать из `ConfigService`, используйте `forRootAsync()`:

```ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SteamAuthModule } from 'nestjs-steam-auth'

@Module({
	imports: [
		ConfigModule.forRoot(),
		SteamAuthModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				apiKey: config.getOrThrow<string>('STEAM_API_KEY'),
				realm: config.getOrThrow<string>('APP_URL'),
				returnUrl: `${config.getOrThrow<string>('APP_URL')}/auth/steam/callback`,
				fetchProfile: true
			})
		})
	]
})
export class AppModule {}
```

## Настройки

| Параметр | Тип | Обязательный | Описание |
| --- | --- | --- | --- |
| `apiKey` | `string` | Да | Steam Web API key. Нужен для загрузки профиля игрока. |
| `realm` | `string` | Да | Базовый URL вашего приложения, например `https://example.com`. |
| `returnUrl` | `string` | Да | URL callback-эндпоинта, на который Steam вернет пользователя. |
| `fetchProfile` | `boolean` | Нет | Загружать ли профиль Steam после успешной авторизации. По умолчанию включено. |

Steam Web API key можно получить на странице Steam Web API: https://steamcommunity.com/dev/apikey

## Результат авторизации

`SteamAuthResult` содержит:

```ts
interface SteamAuthResult {
	steamId: string
	claimedId: string
	profile: SteamPlayerSummary | null
}
```

Если `fetchProfile` выключен, поле `profile` будет `null`.

## Использование сервиса напрямую

Можно не использовать guard и controller, а вызвать сервис самостоятельно:

```ts
const redirectUrl = steamAuthService.getRedirectUrl()
const result = await steamAuthService.validateCallback(request.query)
```

Полезные методы:

- `getRedirectUrl()` - формирует URL для входа через Steam.
- `validateCallback(query)` - проверяет callback и возвращает `SteamAuthResult`.
- `verifyResponse(query)` - проверяет OpenID-ответ Steam.
- `extractSteamId(claimedId)` - извлекает Steam ID из OpenID `claimed_id`.
- `getPlayerSummary(steamId)` - загружает публичный профиль игрока.

## Пример ответа callback

```json
{
	"steamId": "76561198000000000",
	"claimedId": "https://steamcommunity.com/openid/id/76561198000000000",
	"profile": {
		"steamid": "76561198000000000",
		"personaname": "Player",
		"profileurl": "https://steamcommunity.com/id/player",
		"avatar": "https://...",
		"avatarmedium": "https://...",
		"avatarfull": "https://..."
	}
}
```

## Разработка

```bash
npm install
npm test
npm run build
```

Доступные скрипты:

- `npm run build` - сборка TypeScript в `dist`.
- `npm test` - запуск тестов Jest.
- `npm run test:watch` - запуск тестов в watch-режиме.
- `npm run test:cov` - отчет покрытия тестами.
- `npm run format` - форматирование исходников.

## Лицензия

MIT. Подробности в файле [LICENSE](./LICENSE).
