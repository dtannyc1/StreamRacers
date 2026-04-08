import Track from "./Track"

export default class TrackManager {
    constructor() { 
        this.defaultTrack = null;
        this.customTracks = {};
        this.track = null;
        this.load();
    }

    get currentTrack() {
        return this.track
    }

     // ── KVStore ────────────────────────────────────────────────────────────────

    static async load() {
        try {
        const [tracksData, settings] = await Promise.all([
            SE_API.store.get('customTracks'),
            SE_API.store.get('raceSettings'),
        ])

        this.defaultTrack = settings?.defaultTrack ?? null
        this.customTracks = tracksData ?? {}
        const names = Object.keys(this.customTracks)

        // use default if set and exists, otherwise pick random
        let trackData = null
        if (this.defaultTrack && this.customTracks[this.defaultTrack]) {
            trackData = this.customTracks[this.defaultTrack]
            console.log('Using default track:', this.defaultTrack)
        } else if (names.length) {
            const name = names[Math.floor(Math.random() * names.length)]
            trackData = this.customTracks[name]
            console.log('Using random track:', name)
        } else {
            throw new Error('No tracks available')
        }

        this.track = new Track(trackData)
        } catch (err) {
        console.warn('Failed to load track:', err)
        return null
        }
    }

}