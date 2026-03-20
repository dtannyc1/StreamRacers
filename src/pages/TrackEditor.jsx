import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKVStore } from '../context/KVStoreContext'
import { useTrackEditor } from '../components/track-editor/useTrackEditor'
import TrackCanvas from '../components/track-editor/TrackCanvas'
import TrackAssetList from '../components/track-editor/TrackAssetList'
import TrackAssetForm from '../components/track-editor/TrackAssetForm'
import RacingLinePanel from '../components/track-editor/RacingLinePanel'
import RacingLineForm from '../components/track-editor/RacingLineForm'
import { sanitizeDeep, isValidHttpUrl } from '../lib/sanitize'
import { pickRandomRacer, spawnRacer, updateRacers, isRacerDone, sortRacersByY } from '../lib/racerSimulation'
import { preloadCarImages } from '../lib/racerRenderer'
import { getTwitchUser } from '../lib/twitch'

const SlotInput = ({ label, slot, onUpdate, onClear }) => {
  const [local, setLocal] = useState(slot?.url ?? '')

  useState(() => { setLocal(slot?.url ?? '') }, [slot?.url])

  useState(() => {
    if (local === (slot?.url ?? '')) return
    const timer = setTimeout(() => {
      if (!local) { onClear(); return }
      onUpdate({ url: local })
    }, 600)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex gap-2">
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        {slot?.url && (
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors">✕</button>
        )}
      </div>
    </label>
  )
}

const StandsForm = ({ stands, onUpdate, onClear }) => {
  const [local, setLocal] = useState(stands?.url ?? '')

  useState(() => { setLocal(stands?.url ?? '') }, [stands?.url])

  useState(() => {
    if (local === (stands?.url ?? '')) return
    const timer = setTimeout(() => {
      if (!local) { onClear(); return }
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => onUpdate({ url: local, dim: [img.naturalWidth, img.naturalHeight], scale: 0.571 })
      img.src = local
      if (!img.complete) onUpdate({ url: local, dim: stands?.dim ?? [1100, 800], scale: stands?.scale ?? 0.571 })
    }, 600)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Stands Image URL</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          {stands?.url && (
            <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors">✕</button>
          )}
        </div>
      </label>
      {stands?.url && (
        <label className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Scale</span>
            <span className="text-xs text-gray-500">{Math.round((stands.scale ?? 0.571) * 100)}%</span>
          </div>
          <input
            type="range" min={0.1} max={2} step={0.05}
            value={stands.scale ?? 0.571}
            onChange={(e) => onUpdate({ ...stands, scale: parseFloat(e.target.value) })}
            className="w-full accent-purple-500"
          />
        </label>
      )}
    </div>
  )
}

const TrackEditor = ({ mode }) => {
  const { trackName } = useParams()
  const { tracks, updateTracks, racers: customRacers } = useKVStore()
  const navigate = useNavigate()

  const [selection, setSelection] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)
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

  const selectedAsset = selection?.type === 'asset'
    ? track[selection.listKey]?.find(a => a.id === selection.id)
    : null

  const handleSelectAsset = (id, listKey) => {
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

    const username = pickRandomRacer(customRacers)
    if (!username) return

    const racer = spawnRacer(username, customRacers, track.racingLine)
    if (!racer) return

    // fetch avatar if we don't have it yet
    if (!racerAvatars[username]) {
      try {
        const twitchUser = await getTwitchUser(username)
        setRacerAvatars(prev => ({ ...prev, [username]: twitchUser.profile_image_url }))

        // preload car images
        racer.car.assets.forEach(asset => {
          const url = asset.type === 'avatar'
            ? twitchUser.profile_image_url
            : asset.spriteUrl
          preloadCarImages(racer.car, twitchUser.profile_image_url, racerImageCache.current)
        })
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
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
              <button
                onClick={handleAddRacer}
                disabled={!customRacers || Object.keys(customRacers).length === 0}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Add Racer
              </button>
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
            />

            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Road</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="roadType" value="rainbow"
                    checked={track.road.type === 'rainbow'}
                    onChange={() => setRoad({ type: 'rainbow' })}
                    className="accent-purple-500"
                  />
                  <span className="text-sm text-white">Rainbow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="roadType" value="solid"
                    checked={track.road.type === 'solid'}
                    onChange={() => setRoad({ type: 'solid' })}
                    className="accent-purple-500"
                  />
                  <span className="text-sm text-white">Solid Color</span>
                </label>
                {track.road.type === 'solid' && (
                  <input type="color" value={track.road.color ?? '#888888'}
                    onChange={(e) => setRoad({ color: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-1">

            {/* Slot images */}
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Slot Images</h3>
              <SlotInput label="Overlay Background" slot={track.overlayBackground}
                onUpdate={(v) => setSlot('overlayBackground', v)}
                onClear={() => clearSlot('overlayBackground')} />
              <SlotInput label="Overlay Foreground" slot={track.overlayForeground}
                onUpdate={(v) => setSlot('overlayForeground', v)}
                onClear={() => clearSlot('overlayForeground')} />
              <SlotInput label="Scrolling Image" slot={track.scrollingImage}
                onUpdate={(v) => setSlot('scrollingImage', v)}
                onClear={() => clearSlot('scrollingImage')} />
              <StandsForm stands={track.stands}
                onUpdate={(v) => setSlot('stands', v)}
                onClear={() => clearSlot('stands')} />
            </div>

            {/* Racing line */}
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
              <RacingLinePanel
                racingLine={track.racingLine}
                selection={selection}
                onSelect={setSelection}
                onUpdateRacingLine={updateRacingLine}
                onAddModifier={handleAddModifier}
                onRemoveModifier={handleRemoveModifier}
              />
            </div>

            {/* Racing line form */}
            {(selection?.type === 'racingLine' || selection?.type === 'modifier') && (
              <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  {selection.type === 'racingLine' ? 'Edit Racing Line' : 'Edit Modifier'}
                </h3>
                <RacingLineForm
                  selection={selection}
                  racingLine={track.racingLine}
                  onUpdateRacingLine={updateRacingLine}
                  onUpdateModifier={updateModifier}
                />
              </div>
            )}

            {/* Asset lists */}
            <TrackAssetList
              track={track}
              selectedAssetId={selection?.type === 'asset' ? selection.id : null}
              selectedListKey={selection?.type === 'asset' ? selection.listKey : null}
              onSelect={handleSelectAsset}
              onAdd={handleAddAsset}
              onRemove={handleRemoveAsset}
            />

            {/* Asset form */}
            {selectedAsset && (
              <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Edit Asset</h3>
                <TrackAssetForm
                  asset={selectedAsset}
                  listKey={selection.listKey}
                  onUpdate={updateAsset}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackEditor