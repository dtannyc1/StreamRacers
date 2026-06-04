import { useState } from 'react'
import { getTwitchUser } from '../../lib/twitch'
import { useKVStore } from '../../context/KVStoreContext'
import { useNavigate } from 'react-router-dom'

const STEPS = { INPUT: 'input', CONFIRM: 'confirm', DUPLICATE: 'duplicate' }

const AddRacerModal = ({ onClose, carData = null }) => {
  const { racers, updateRacers } = useKVStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(carData ? STEPS.DUPLICATE : STEPS.INPUT)
  const [username, setUsername] = useState('')
  const [twitchUser, setTwitchUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLookup = async (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    try {
      const user = await getTwitchUser(trimmed)
      setTwitchUser(user)
      setStep(STEPS.CONFIRM)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    const updatedRacers = {  [twitchUser.display_name]: [], ...racers }
    await updateRacers(updatedRacers)
    onClose()
    if (carData?.assets?.length) {
      carData.assets.find(a => a.type === 'avatar').spriteUrl = twitchUser.profile_image_url
      carData.assets.forEach(asset => {
        asset.id = crypto.randomUUID()
      })
    }
    navigate(`/racer/${twitchUser.display_name}/car/new`, { state: { carData } })
  }

  const handleBack = () => {
    setTwitchUser(null)
    setStep(STEPS.INPUT)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-800 border border-gray-700 p-6 flex flex-col gap-5 shadow-xl">

        {(step === STEPS.INPUT || step === STEPS.DUPLICATE) && (
          <>
            <div
              className="flex gap-1 flex-col"
            >
            <h2 className="text-lg font-semibold text-white">
              {carData ? 'Duplicate Car for User' : 'Add Racer'}
            </h2>
            <p className="text-sm text-gray-400">
              {carData 
                ? `You're about to duplicate a car - ${carData.name}. Please enter the Twitch username of the racer you want to duplicate the car for.`
                : `To add a new racer, please enter their Twitch username. This will allow us to fetch their profile picture as the avatar for their car.`
              }
            </p>
            </div>
            <form onSubmit={handleLookup} className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-300">Twitch Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Twitch username"
                autoFocus
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-purple-500"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!username.trim() || loading}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Looking up...' : 'Look Up'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === STEPS.CONFIRM && twitchUser && (
          <>
            <h2 className="text-lg font-semibold text-white">Is this the right user?</h2>
            <div className="flex items-center gap-4 rounded-lg bg-gray-700 border border-gray-600 px-4 py-3">
              <img
                src={twitchUser.profile_image_url}
                alt={twitchUser.display_name}
                crossOrigin="anonymous"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">{twitchUser.display_name}</p>
                <p className="text-xs text-gray-400">@{twitchUser.login}</p>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleBack}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Not the right user
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                {carData ? 'Yes, duplicate car' : 'Yes, create car'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default AddRacerModal