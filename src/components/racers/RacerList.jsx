import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import RacerRow from './RacerRow'
import AddRacerModal from './AddRacerModal'

const RacerList = () => {
  const { racers, loading, error } = useKVStore()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  if (loading) return <p className="text-sm text-gray-400">Loading racers...</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const usernames = racers ? Object.keys(racers) : []

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{usernames.length} racer{usernames.length !== 1 ? 's' : ''}</p>
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