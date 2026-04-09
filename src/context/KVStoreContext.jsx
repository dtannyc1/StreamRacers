import { createContext, useContext, useState, useEffect } from 'react'
import { getRacersAndTracks, setJWTToken, setRacers, setTracks, getRaceSettings, setRaceSettings } from '../lib/streamelements'
import { useAuth } from './AuthContext'

const KVStoreContext = createContext(null)

export const KVStoreProvider = ({ children }) => {
  const { token, channel } = useAuth()
  const channelId = channel?._id

  const [racers, setRacersState] = useState(null)
  const [tracks, setTracksState] = useState(null)
  const [raceSettings, setRaceSettingsState] = useState(null)
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

  return (
    <KVStoreContext.Provider value={{ 
                                      racers, tracks, raceSettings, 
                                      loading, error, 
                                      updateRacers, updateTracks, updateRaceSettings 
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
  testRacers: [
    'apocalypse_squirrel', 'KnuthingIsReal', 'NowImABeliever',
    'albinounounou', 'Neiluj04', 'Pyobum', 'TheComplements',
    'AndyTheFrenchy', 'TheSolid7', 'pencils45'
  ],
  messages: {
    raceStarted: 'Race started!',
    boostFound: 'OUI! {username} FOUND IT!',
    wordClue: "Guess the word I'm thinking of for a boost! The category is: {category}",
    winner: '!addqwoin {username} 5',
  },
  wordBank: {
    food: ['pizza', 'chocolate', 'sushi', 'ice cream', 'burger', 'pasta', 'salad', 'potato', 'taco', 'steak'],
    'video game titles': ['Zelda', 'Mario', 'Fortnite', 'Minecraft', 'Call of Duty', 'Overwatch'],
    colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray'],
    animals: ['dog', 'cat', 'elephant', 'lion', 'tiger', 'giraffe', 'zebra', 'monkey', 'bear', 'fox'],
    fruits: ['apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'kiwi', 'pineapple'],
  },
  defaultTrack: null,
  defaultRacer: null,
}