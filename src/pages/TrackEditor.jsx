import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKVStore } from '../context/KVStoreContext'
import { useTrackEditor } from '../components/track-editor/useTrackEditor'
import TrackCanvas from '../components/track-editor/TrackCanvas'
import TrackAssetList from '../components/track-editor/TrackAssetList'
import RacingLinePanel from '../components/track-editor/RacingLinePanel'
import { sanitizeDeep, isValidHttpUrl } from '../lib/sanitize'
import { spawnRacer, updateRacers, isRacerDone, sortRacersByY } from '../lib/racerSimulation'
import { preloadCarImages } from '../lib/racerRenderer'
import { getTwitchUser } from '../lib/twitch'
import RoadDetailsPanel from '../components/track-editor/RoadDetailsPanel'
import Tooltip from '../components/ToolTip'

const TrackEditor = ({ mode }) => {
  const { trackName } = useParams()
  const { tracks, updateTracks, racers: customRacers } = useKVStore()
  const navigate = useNavigate()

  const [selection, setSelection] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [visibleModifierKey, setVisibleModifierKey] = useState(null)
  const [activeRacers, setActiveRacers] = useState([])
  const [racerAvatars, setRacerAvatars] = useState({})
  const activeRacersRef = useRef(activeRacers)
  const lastTimeRef = useRef(null)
  const animRef = useRef(null)
  const racerImageCache = useRef({})

  const initialTrack = mode === 'edit'
    ? tracks?.[decodeURIComponent(trackName)]
    : null

  const {
    track,
    setName,
    setRoad,
    setSlot,
    clearSlot,
    updateRacingLine,
    addModifier,
    updateModifier,
    removeModifier,
    addAsset,
    updateAsset,
    removeAsset,
  } = useTrackEditor(initialTrack)

  useEffect(() => { activeRacersRef.current = activeRacers }, [activeRacers])

  useEffect(() => {
    if (activeRacers.length === 0) {
      lastTimeRef.current = null
      return
    }

    const tick = (timestamp) => {
      const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = timestamp

      setActiveRacers(prev => {
        const updated = updateRacers(prev, dt)
        return updated.filter(r => !isRacerDone(r))
      })

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [activeRacers.length > 0])

  const handleSelectAsset = (id, listKey) => {
    if (id === null) {
      setSelection(null)
      return
    }
    setSelection({ type: 'asset', id, listKey })
  }

  const handleAddAsset = (listKey) => {
    const id = addAsset(listKey)
    setSelection({ type: 'asset', id, listKey })
  }

  const handleRemoveAsset = (listKey, id) => {
    removeAsset(listKey, id)
    if (selection?.type === 'asset' && selection.id === id) setSelection(null)
  }

  const handleAddModifier = (modifierKey) => {
    const id = addModifier(modifierKey)
    setSelection({ type: 'modifier', id, modifierKey })
  }

  const handleRemoveModifier = (modifierKey, id) => {
    removeModifier(modifierKey, id)
    if (selection?.type === 'modifier' && selection.id === id) setSelection(null)
  }

  const handleAddRacer = async () => {
    if (!customRacers) return

    const activeUsernames = new Set(activeRacers.map(r => r.username))
    const available = Object.entries(customRacers)
      .filter(([username, cars]) =>
        Array.isArray(cars) && cars.length > 0 && !activeUsernames.has(username)
      )
      .map(([username]) => username)

    if (available.length === 0) return

    const username = available[Math.floor(Math.random() * available.length)]
    const racer = spawnRacer(username, customRacers, track.racingLine)
    if (!racer) return

    if (!racerAvatars[username]) {
      try {
        const twitchUser = await getTwitchUser(username)
        setRacerAvatars(prev => ({ ...prev, [username]: twitchUser.profile_image_url }))
        preloadCarImages(racer.car, twitchUser.profile_image_url, racerImageCache.current)
      } catch {
        // proceed without avatar
      }
    } else {
      preloadCarImages(racer.car, racerAvatars[username], racerImageCache.current)
    }

    setActiveRacers(prev => sortRacersByY([...prev, racer]))
  }

  const validateTrack = () => {
    if (!track.name.trim()) return 'Track must have a name.'
    if (track.name.trim() === 'New Track') return 'Please give your track a unique name.'

    const existingNames = Object.keys(tracks ?? {})
    const isDuplicate = existingNames.some(name =>
      name === track.name && (mode !== 'edit' || name !== decodeURIComponent(trackName))
    )
    if (isDuplicate) return `A track named "${track.name}" already exists.`

    if (!track.racingLine?.url?.trim()) return 'A racing line image is required.'

    const allAssets = [...track.backgroundAssets, ...track.foregroundAssets,
      ...track.racingLine.startModifiers, ...track.racingLine.finishModifiers]
    for (const asset of allAssets) {
      if (asset.url && !isValidHttpUrl(asset.url)) {
        return `Asset "${asset.name || 'unnamed'}" has an invalid URL.`
      }
    }

    const slots = ['overlayBackground', 'overlayForeground', 'scrollingImage']
    for (const key of slots) {
      if (track[key]?.url && !isValidHttpUrl(track[key].url)) {
        return `${key} has an invalid URL.`
      }
    }

    return null
  }

  const handleSave = async () => {
    const error = validateTrack()
    if (error) { setSaveError(error); return }
    setSaveError(null)

    const cleaned = {
      ...track,
      backgroundAssets: track.backgroundAssets.filter(a => a.url?.trim()),
      foregroundAssets: track.foregroundAssets.filter(a => a.url?.trim()),
      racingLine: {
        ...track.racingLine,
        startModifiers: track.racingLine.startModifiers.filter(m => m.url?.trim()),
        finishModifiers: track.racingLine.finishModifiers.filter(m => m.url?.trim()),
      },
    }

    const sanitized = sanitizeDeep(cleaned)
    const updated = { ...(tracks ?? {}) }

    if (mode === 'edit' && decodeURIComponent(trackName) !== track.name) {
      delete updated[decodeURIComponent(trackName)]
    }

    updated[track.name] = sanitized
    await updateTracks(updated)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white xl:p-8 sm:p-4 p-2">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <input
              type="text"
              value={track.name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-lg font-semibold text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          {saved ? (
            <div className="flex items-center gap-4">
              <p className="text-sm text-green-400">Saved! Remember to refresh your browser source in OBS.</p>
              <button
                onClick={() => navigate('/')}
                className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {saveError && <p className="text-sm text-red-400">{saveError}</p>}
              <Tooltip
                text="Render one of the custom racers you've created"
                options={{translation: "translate(-50%, 100%)"}}
              >
                <button
                  onClick={handleAddRacer}
                  disabled={!customRacers || Object.keys(customRacers).length === 0}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  + Add Racer
                </button>
              </Tooltip>
              <button
                onClick={handleSave}
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                Save Track
              </button>
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-[1fr_320px] gap-6">

          {/* Left — canvas + road */}
          <div className="flex flex-col gap-4">
            <TrackCanvas
              track={track}
              selection={selection}
              onUpdateRacingLine={updateRacingLine}
              onUpdateModifier={updateModifier}
              onSelectAsset={handleSelectAsset}
              activeRacers={activeRacers}
              racerAvatars={racerAvatars}
              visibleModifierKey={visibleModifierKey}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-3 pr-1">

            <RoadDetailsPanel
              track={track}
              setRoad={setRoad}
              setSlot={setSlot}
              clearSlot={clearSlot}
            />

            {/* Racing line */}
            <RacingLinePanel
              racingLine={track.racingLine}
              selection={selection}
              onSelect={setSelection}
              onUpdateRacingLine={updateRacingLine}
              onAddModifier={handleAddModifier}
              onRemoveModifier={handleRemoveModifier}
              onUpdateModifier={updateModifier}
              onVisibleModifierKeyChange={setVisibleModifierKey}
            />

            {/* Asset lists */}
            <TrackAssetList
              track={track}
              selectedAssetId={selection?.type === 'asset' ? selection.id : null}
              selectedListKey={selection?.type === 'asset' ? selection.listKey : null}
              onSelect={handleSelectAsset}
              onAdd={handleAddAsset}
              onRemove={handleRemoveAsset}
              onUpdate={updateAsset}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackEditor