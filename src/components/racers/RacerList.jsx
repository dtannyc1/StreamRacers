import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import RacerRow from './RacerRow'
import AddRacerModal from './AddRacerModal'
import ErrorNewUser from '../ErrorNewUser'

const RacerList = () => {
  const { racers, loading, error, raceSettings } = useKVStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  if (loading) return <p className="text-sm text-gray-400">Loading racers...</p>
  if (error === 'Failed to list kvstore keys (404)' ) return <ErrorNewUser error={error}/>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const usernames = racers
    ? Object.keys(racers).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    : []
  const defaultCar = raceSettings?.defaultRacer

  return (
    <>
      <div className="flex flex-col gap-3"
      >
        
        {/* Default car */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-gray-800 border border-gray-700">
            <div>
              <p className="text-sm font-medium text-white">Default Car</p>
              <p className="text-xs text-gray-400">
                {defaultCar?.assets?.length ?? 0} assets · used when no custom car is found
              </p>
            </div>
            <button
              onClick={() => navigate('/racer/default/car/edit')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{usernames.length} Custom Racer{usernames.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            + Add Racer
          </button>
        </div>

        {usernames.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No racers yet. Add one to get started.</p>
        )}

        <div className="flex flex-col gap-2">
          {usernames.map(username => (
            <RacerRow key={username} username={username} cars={racers[username]} />
          ))}
        </div>
      </div>

      {showModal && <AddRacerModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default RacerList