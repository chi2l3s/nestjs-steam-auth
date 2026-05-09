import { SteamPlayerSummary } from './steam-profile.interface'

export interface SteamAuthResult {
	steamId: string
	claimedId: string
	profile: SteamPlayerSummary | null
}
