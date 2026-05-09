export interface SteamPlayerSummary {
	steamid: string
	communityvisibilitystate?: number
	profilestate?: number
	personaname: string
	commentpermission?: number
	profileurl: string
	avatar: string
	avatarmedium: string
	avatarfull: string
	avatarhash?: string
	lastlogoff?: number
	personastate?: number
	realname?: string
	primaryclanid?: string
	timecreated?: number
	personastateflags?: number
	loccountrycode?: string
	locstatecode?: string
	loccityid?: number
}

export interface SteamPlayerSummariesResponse {
	response: {
		players: SteamPlayerSummary[]
	}
}
