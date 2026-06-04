import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import { getTwitchUser } from '../../lib/twitch'
import CarCard from './CarCard'

const RacerRow = ({ username, onDuplicateCar, cars = [] }) => {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(username)
  const [twitchUser, setTwitchUser] = useState(null)
  const [looking, setLooking] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [error, setError] = useState(null)
  const { racers, updateRacers } = useKVStore()
  const navigate = useNavigate()

  const handleLookup = async () => {
    const trimmed = newUsername.trim()
    if (!trimmed || trimmed === username) {
      cancelEdit()
      return
    }
    if (racers[trimmed] && trimmed !== username) {
      setError(`"${trimmed}" already exists.`)
      return
    }

    setLooking(true)
    setError(null)
    try {
      const user = await getTwitchUser(trimmed)
      setTwitchUser(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLooking(false)
    }
  }

  const handleConfirmRename = async () => {
    if (!twitchUser) return
    setRenaming(true)
    setError(null)
    try {
      const updated = {}
      for (const [key, val] of Object.entries(racers)) {
        updated[key === username ? twitchUser.display_name : key] = val
      }
      await updateRacers(updated)
      setEditing(false)
      setTwitchUser(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setRenaming(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    setNewUsername(username)
    setTwitchUser(null)
    setError(null)
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">

      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(editing && !twitchUser) ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => { setNewUsername(e.target.value); setError(null) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLookup()
                  if (e.key === 'Escape') cancelEdit()
                }}
                autoFocus
                disabled={looking}
                placeholder="New Twitch username"
                className="flex-1 min-w-0 rounded bg-gray-700 border border-gray-600 px-2 py-0.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-40"
              />
              <button
                onClick={handleLookup}
                disabled={looking || !newUsername.trim()}
                className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                {looking ? '...' : 'Look up'}
              </button>
              <button
                onClick={cancelEdit}
                className="text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <span className="text-sm font-medium text-white truncate">{username}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {cars.length} car{cars.length !== 1 ? 's' : ''}
                </span>
              </button>
              {!twitchUser && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0 mr-2"
                >
                  ✎
                </button>
              )}
            </>
          )}
        </div>
        {!editing && !twitchUser && (
          <span
            onClick={() => setExpanded(prev => !prev)}
            className="text-gray-400 text-xs cursor-pointer ml-2 hover:text-white transition-colors"
          >
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 px-4 pb-2">{error}</p>
      )}

      {/* Twitch confirmation */}
      {twitchUser && (
        <div className="border-t border-gray-700 px-4 py-3 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Is this the right user?</p>
          <div className="flex items-center gap-3 rounded-lg bg-gray-700 border border-gray-600 px-3 py-2">
            <img
              src={twitchUser.profile_image_url}
              alt={twitchUser.display_name}
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-white">{twitchUser.display_name}</p>
              <p className="text-xs text-gray-400">@{twitchUser.login}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Not the right user
            </button>
            <button
              onClick={handleConfirmRename}
              disabled={renaming}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-40 transition-colors ml-auto"
            >
              {renaming ? 'Saving...' : 'Yes, rename'}
            </button>
          </div>
        </div>
      )}

      {/* Expanded cars */}
      {expanded && !editing && !twitchUser && (
        <div className="border-t border-gray-700 px-4 py-3 flex flex-col gap-2">
          {cars.length === 0 && (
            <p className="text-sm text-gray-500">No cars yet.</p>
          )}
          {cars.map((car, index) => (
            <CarCard key={index} car={car} index={index} username={username} onDuplicateCar={onDuplicateCar} />
          ))}
          <button
            onClick={() => navigate(`/racer/${username}/car/new`)}
            className="mt-1 text-sm text-purple-400 hover:text-purple-300 transition-colors text-left"
          >
            + Add car
          </button>
        </div>
      )}

    </div>
  )
}

export default RacerRow