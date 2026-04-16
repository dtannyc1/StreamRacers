import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import UploadButton from '../UploadButton'

const NumInput = ({ label, value, onChange, step = 1, min }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <input
      type="number"
      step={step}
      min={min}
      value={Math.round(value * 100) / 100}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
    />
  </label>
)

const DebouncedUrlInput = ({ value, onChange }) => {
  const [local, setLocal] = useState(value)

  useEffect(() => { setLocal(value) }, [value])

  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), 600)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder="https://..."
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full"
    />
  )
}

const TrackAssetForm = ({ asset, listKey, onUpdate }) => {
  if (!asset) return (
    <p className="text-xs text-gray-500 text-center py-4">Select an asset to edit it.</p>
  )

  const u = (patch) => onUpdate(listKey, asset.id, patch)

  const handleUrlChange = (url) => {
    u({ url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      u({ dim: [img.naturalWidth, img.naturalHeight] })
    }
    img.src = resolveImageUrl(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Name</span>
        <input
          type="text"
          value={asset.name ?? ''}
          onChange={(e) => u({ name: e.target.value })}
          className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Image URL</span>
        <DebouncedUrlInput value={asset.url} onChange={handleUrlChange} />
        
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Or upload an image</span>
          <UploadButton
            onUploaded={(url) => handleUrlChange(url)}
          />
        </label>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumInput
          label="Width"
          value={asset.dim[0]}
          onChange={(v) => u({ dim: [v, asset.dim[1]] })}
        />
        <NumInput
          label="Height"
          value={asset.dim[1]}
          onChange={(v) => u({ dim: [asset.dim[0], v] })}
        />
      </div>

      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Scale</span>
          <span className="text-xs text-gray-500">{Math.round(asset.scale * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.05}
          max={2}
          step={0.05}
          value={asset.scale}
          onChange={(e) => u({ scale: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </label>

      <div className="flex gap-3 justify-between">
        <label className="flex flex-col gap-1 grow-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Min Depth</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.05}
            value={asset.depthRange?.[0] ?? 0}
            onChange={(e) => {
              let curVal = asset.depthRange ?? [0, 10]
              if (parseFloat(e.target.value) > curVal[1]) curVal[1] = parseFloat(e.target.value)
              u({ depthRange: [parseFloat(e.target.value), curVal[1]] })
            }}
            className="accent-purple-500"
          />
        </label>

        <label className="flex flex-col gap-1 grow-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Max Depth</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.05}
            value={asset.depthRange?.[1] ?? 10}
            onChange={(e) => {
              let curVal = asset.depthRange ?? [0, 10]
              if (parseFloat(e.target.value) < curVal[0]) curVal[0] = parseFloat(e.target.value)
              u({ depthRange: [curVal[0], parseFloat(e.target.value)] })
            }}
            className="accent-purple-500"
          />
        </label>
      </div>
    </div>
  )
}

export default TrackAssetForm