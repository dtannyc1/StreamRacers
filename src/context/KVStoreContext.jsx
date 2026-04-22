import { createContext, useContext, useState, useEffect } from 'react'
import { getRacersAndTracks, setJWTToken, setRacers, setTracks, getRaceHistory,
  getRaceSettings, setRaceSettings, checkSEOVerlay, createSEOverlay } from '../lib/streamelements'
import { useAuth } from './AuthContext'

const KVStoreContext = createContext(null)

export const KVStoreProvider = ({ children }) => {
  const { token, channel } = useAuth()
  const channelId = channel?._id

  const [racers, setRacersState] = useState(null)
  const [tracks, setTracksState] = useState(null)
  const [raceSettings, setRaceSettingsState] = useState(null)
  const [validOverlayId, setValidOverlayId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token || !channelId) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { racers, tracks } = await getRacersAndTracks(token, channelId)
        let settings
        try {
          settings = await getRaceSettings(token, channelId)
          if (Object.keys(settings).length === 0) throw new Error('Empty settings')
        } catch {
          settings = DEFAULT_RACE_SETTINGS
          await setRaceSettings(token, channelId, DEFAULT_RACE_SETTINGS)
        }
        if (racers && tracks && token && channelId) {
          setJWTToken(token, channelId, token) // ensure the token is saved in KV for tester.js to access
        } 
        if (settings.lastOverlayId) {
          setValidOverlayId(await checkSEOVerlay(token, channelId, settings.lastOverlayId))
        }
        setRacersState(racers)
        setTracksState(tracks)
        setRaceSettingsState(settings ?? DEFAULT_RACE_SETTINGS)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, channelId])

  const updateRacers = async (value) => {
    setError(null)
    try {
      await setRacers(token, channelId, value)
      setRacersState(value)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateTracks = async (value) => {
    setError(null)
    try {
      await setTracks(token, channelId, value)
      setTracksState(value)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateRaceSettings = async (value) => {
    setError(null)
    try {
      await setRaceSettings(token, channelId, value)
      setRaceSettingsState(value)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const createOverlay = async () => {
    try { 
      let output = await createSEOverlay(token, channelId)
      setRaceSettings(token, channelId, {...raceSettings, 'lastOverlayId': output?._id})
      setRaceSettingsState({...raceSettings, 'lastOverlayId': output?._id})
      setValidOverlayId(output?._id)
      return output?._id
    } catch (err) {
      throw err
    }
  }

  const hardResetKVStore = async () => {
    setLoading(true)
    setError(null)
    try {
      const { racers, tracks } = await getRacersAndTracks(token, channelId, true) // hard reset
      let settings
      try {
        settings = await getRaceSettings(token, channelId)
        if (Object.keys(settings).length === 0) throw new Error('Empty settings')
      } catch {
        settings = DEFAULT_RACE_SETTINGS
        await setRaceSettings(token, channelId, DEFAULT_RACE_SETTINGS)
      }
      if (racers && tracks && token && channelId) {
        setJWTToken(token, channelId, token) // ensure the token is saved in KV for tester.js to access
      } 
      setRacersState(racers)
      setTracksState(tracks)
      setRaceSettingsState(settings ?? DEFAULT_RACE_SETTINGS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRaceHistory = async () => {
    return await getRaceHistory(token, channelId)
  }

  return (
    <KVStoreContext.Provider value={{ 
                                      racers, tracks, raceSettings, 
                                      loading, error, validOverlayId, 
                                      updateRacers, updateTracks, updateRaceSettings, 
                                      hardResetKVStore, createOverlay, fetchRaceHistory
    }}>
      {children}
    </KVStoreContext.Provider>
  )
}

export const useKVStore = () => {
  const ctx = useContext(KVStoreContext)
  if (!ctx) throw new Error('useKVStore must be used within a KVStoreProvider')
  return ctx
}

export const DEFAULT_RACE_SETTINGS = {
  testing: true,
  joinCommands: ['!join', '!start'],
  goCommands: ['!go', '!potato'],
  resetCommands: ['!reset'],
  enableBoostWords: false,
  testRacers: [
    'pencils45', 'MamzelleRylo', 'TheComplements', 'AndyTheFrenchy', 'JoPlaysViolin', 'andrewcore', 
  ],
  messages: {
    raceStarted: 'Race started!',
    boostFound: 'YES! {username} FOUND IT!',
    wordClue: "Guess the word I'm thinking of for a boost! The category is: {category}",
    winner: 'And the winner was {username}! You get nothing for that...',
  },
  wordBank: {
    food: ['pizza', 'chocolate', 'sushi', 'ice cream', 'burger', 'pasta', 'salad', 'potato', 'taco', 'steak'],
    'video game titles': ['Zelda', 'Mario', 'Fortnite', 'Minecraft', 'Call of Duty', 'Overwatch'],
    colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray'],
    animals: ['dog', 'cat', 'elephant', 'lion', 'tiger', 'giraffe', 'zebra', 'monkey', 'bear', 'fox'],
    fruits: ['apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'kiwi', 'pineapple'],
  },
  defaultTrack: null,
  defaultRacer: {
    assets: [
      {
        dim: [80, 80],
        id: 'ee1e1b96-0c0e-426a-92af-980f9c77f8b7',
        name: 'Avatar',
        spriteUrl: '',
        theta: 0,
        tl: [-134, -130.403],
        type: 'avatar',
      },
      {
        dim: [200, 200],
        id: '3959c472-b18e-483d-952e-63b9cd1d3ace',
        name: 'Vehicle',
        spriteUrl: 'https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&st=mnd2bytw&dl=0',
        theta: 0,
        tl: [-183, -160.403],
        type: 'static',
        colorRemap: { enabled: false, sourceColor: '#FF001A' },
      },
      {
        cr: [-135, -22.403],
        dim: [192.4, 120.4],
        handleAngle: 0,
        id: '6759f5a3-e0a6-4e13-85bf-448fa086189c',
        name: 'Left Wheel',
        radius: 20,
        spriteUrl: 'https://www.dropbox.com/scl/fi/h40xha1db6oqsa7n5nibi/default_wheel1.png?rlkey=xtolfaiwu6fsj3w7f23jyt6h8&st=4cr3dmmu&dl=0',
        theta: 0,
        tl: [-185, -120.403],
        type: 'rotating',
        colorRemap: { enabled: false, sourceColor: '#FF001A' },
      },
      {
        cr: [-40, -22.403],
        dim: [192.4, 120.4],
        handleAngle: 0,
        id: '42f0ccd1-79aa-43d9-9dd3-82fdef73f8cd',
        name: 'Right Wheel',
        radius: 20,
        spriteUrl: 'https://www.dropbox.com/scl/fi/avrdy5jpr2ky0xfo5h6bz/default_wheel2.png?rlkey=msdi1tkjhoot006z1n0cuic5u&st=2ess0iq9&dl=0',
        theta: 0,
        tl: [-178, -120.403],
        type: 'rotating',
        colorRemap: { enabled: false, sourceColor: '#FF001A' },
      },
    ],
    name: 'Default Car',
  },
  raceDuration: 30,
}