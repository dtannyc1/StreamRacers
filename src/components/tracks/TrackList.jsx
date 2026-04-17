import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import ErrorNewUser from '../ErrorNewUser'

const TrackList = () => {
  const { tracks, updateTracks, loading, error } = useKVStore()
  const navigate = useNavigate()

  if (loading) return <p className="text-sm text-gray-400">Loading tracks...</p>
  if (error === 'Failed to list kvstore keys (404)' ) return <ErrorNewUser error={error}/>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const trackNames = tracks 
    ? Object.keys(tracks).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())) 
    : []

  const handleDelete = async (name) => {
    if (!confirm(`Delete "${name}"?`)) return
    const updated = { ...tracks }
    delete updated[name]
    await updateTracks(updated)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{trackNames.length} track{trackNames.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => navigate('/track/new')}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
        >
          + Add Track
        </button>
      </div>

      {trackNames.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No tracks yet. Add one to get started.</p>
      )}

      <div className="flex flex-col gap-2">
        {trackNames.map(name => (
          <div
            key={name}
            className="flex items-center justify-between rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{name}</p>
              <p className="text-xs text-gray-400">
                {tracks[name].backgroundAssets?.length ?? 0} bg · {tracks[name].foregroundAssets?.length ?? 0} fg assets
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/track/${encodeURIComponent(name)}/edit`)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(name)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackList