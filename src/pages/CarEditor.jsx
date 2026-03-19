import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useKVStore } from '../context/KVStoreContext'
import { getTwitchUser } from '../lib/twitch'
import { createDefaultCar } from '../lib/carDefaults'
import CarEditorInner from '../components/car-editor/CarEditorInner'

const CarEditor = ({ mode }) => {
  const { username, carIndex } = useParams()
  const { racers } = useKVStore()

  const [initialCar, setInitialCar] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (mode === 'edit') {
      const car = racers?.[username]?.[parseInt(carIndex)]
      const existingAvatarUrl = car?.assets?.find(a => a.type === 'avatar')?.spriteUrl ?? ''
      setAvatarUrl(existingAvatarUrl)
      setInitialCar(car ?? null)
      setReady(true)
      return
    }

    getTwitchUser(username)
      .then(user => {
        setAvatarUrl(user.profile_image_url)
        setInitialCar(createDefaultCar(user.profile_image_url))
      })
      .catch(() => setInitialCar(createDefaultCar()))
      .finally(() => setReady(true))
  }, [mode, username, carIndex])

  if (!ready) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  return <CarEditorInner mode={mode} username={username} carIndex={carIndex} initialCar={initialCar} avatarUrl={avatarUrl} />
}

export default CarEditor