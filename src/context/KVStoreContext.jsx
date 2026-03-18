import { createContext, useContext, useState, useEffect } from 'react'
import { getRacersAndTracks, setRacers, setTracks } from '../lib/streamelements'
import { useAuth } from './AuthContext'

const KVStoreContext = createContext(null)

export const KVStoreProvider = ({ children }) => {
  const { token, channel } = useAuth()
  const channelId = channel?._id

  const [racers, setRacersState] = useState(null)
  const [tracks, setTracksState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token || !channelId) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { racers, tracks } = await getRacersAndTracks(token, channelId)
        setRacersState(racers)
        setTracksState(tracks)
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

  return (
    <KVStoreContext.Provider value={{ racers, tracks, loading, error, updateRacers, updateTracks }}>
      {children}
    </KVStoreContext.Provider>
  )
}

export const useKVStore = () => {
  const ctx = useContext(KVStoreContext)
  if (!ctx) throw new Error('useKVStore must be used within a KVStoreProvider')
  return ctx
}