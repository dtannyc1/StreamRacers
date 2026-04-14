import { useState, useEffect } from 'react'
import UploadButton from '../UploadButton'

const DebouncedUrlInput = ({ value, onChange, disabled }) => {
  const [local, setLocal] = useState(value)

  // sync if parent value changes (e.g. switching selected asset)
  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), 600)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <input
      type="text"
      value={disabled ? "User's Twitch profile picture" : local}
      onChange={(e) => setLocal(e.target.value)}
      disabled={disabled}
      placeholder="https://..."
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed w-full"
    />
  )
}

const toDeg = (rad) => Math.round((rad * 180 / Math.PI) * 100) / 100
const toRad = (deg) => deg * Math.PI / 180

const NumInput = ({ label, value, onChange, step = 1 }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <input
      type="number"
      step={step}
      value={Math.round(value * 100) / 100}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
    />
  </label>
)

const SliderInput = ({ label, value, onChange, min = 0, max = 360, step = 1, unit = "" }) => (
  <label className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-500">{Math.round(value*100)/100}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-purple-500"
    />
  </label>
)

const Row = ({ children }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
)

const AssetForm = ({ asset, onUpdate, onSpriteUrlChange, toggleAspectLock, isDefaultCar, onEyedropperActivate }) => {
  if (!asset) return (
    <p className="text-xs text-gray-500 text-center py-4">Select an asset to edit it.</p>
  )

  const u = (patch) => onUpdate(asset.id, patch)
  const aspectLocked = asset.aspectLocked ?? false
  const aspect = asset.dim[0] / asset.dim[1]

  const handleWidthChange = (w) => {
    if (w < 1) w = 1
    if (aspectLocked) {
      u({ dim: [w, w / aspect] })
    } else {
      u({ dim: [w, asset.dim[1]] })
    }
  }

  const handleHeightChange = (h) => {
    if (h < 1) h = 1
    if (aspectLocked) {
      u({ dim: [h * aspect, h] })
    } else {
      u({ dim: [asset.dim[0], h] })
    }
  }

  const handleTypeChange = (e) => {
    const newType = e.target.value
    const patch = { type: newType }

    if ((newType === 'rotating' || newType === 'oscillating') && !asset.cr) {
      // initialize CR to center of the asset
      patch.cr = [asset.tl[0] + asset.dim[0] / 2, asset.tl[1] + asset.dim[1] / 2]
      patch.radius = Math.min(asset.dim[0], asset.dim[1]) / 4
      patch.theta = 0
      patch.handleAngle = 0
    }

    if (newType === 'oscillating' && asset.minTheta == null) {
      patch.minTheta = -Math.PI / 6
      patch.maxTheta = Math.PI / 6
      patch.phase = 0
      patch.theta_dot = 1
    }

    u(patch)
  }

  // base dimensions for scale reference (100% = current dim)
  const baseW = asset.baseDim?.[0] ?? asset.dim[0]
  const baseH = asset.baseDim?.[1] ?? asset.dim[1]

  const handleScaleX = (pct) => {
    const w = baseW * (pct / 100)
    if (aspectLocked) {
      u({ dim: [w, w / aspect] })
    } else {
      u({ dim: [w, asset.dim[1]] })
    }
  }

  const handleScaleY = (pct) => {
    const h = baseH * (pct / 100)
    if (aspectLocked) {
      u({ dim: [h * aspect, h] })
    } else {
      u({ dim: [asset.dim[0], h] })
    }
  }

  return (
    <div className="flex flex-col gap-4">

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Name</span>
        <input
          type="text"
          value={asset.name}
          onChange={(e) => u({ name: e.target.value })}
          className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Sprite URL</span>
        <DebouncedUrlInput
          value={asset.spriteUrl}
          disabled={asset.type === 'avatar'}
          onChange={(v) => onSpriteUrlChange(asset.id, v)}
        />
        {asset.type !== 'avatar' && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Or upload an image</span>
            <UploadButton
              onUploaded={(url) => onSpriteUrlChange(asset.id, url)}
            />
          </label>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Type</span>
        <select
          value={asset.type}
          onChange={handleTypeChange}
          className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
        >
          <option value="avatar">Avatar</option>
          <option value="static">Static</option>
          <option value="rotating">Rotating</option>
          <option value="oscillating">Oscillating</option>
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</p>
        <Row>
          <NumInput
            label="X"
            value={asset.tl[0]}
            onChange={(v) => u({ tl: [v, asset.tl[1]] })}
          />
          <NumInput
            label="Y"
            value={-asset.tl[1]}
            onChange={(v) => u({ tl: [asset.tl[0], -v] })}
          />
        </Row>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</p>
          <button
            onClick={() => toggleAspectLock(asset.id)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              aspectLocked
                ? 'border-purple-500 text-purple-400 bg-purple-900/30'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {aspectLocked ? '🔒 Locked' : '🔓 Free'}
          </button>
        </div>
        <Row>
          <NumInput label="W" value={asset.dim[0]} onChange={handleWidthChange} />
          <NumInput label="H" value={asset.dim[1]} onChange={handleHeightChange} />
        </Row>
        <Row>
          <SliderInput
            label="Scale X (%)"
            value={(asset.dim[0] / baseW) * 100}
            min={10}
            max={300}
            step={1}
            onChange={handleScaleX}
          />
          <SliderInput
            label="Scale Y (%)"
            value={(asset.dim[1] / baseH) * 100}
            min={10}
            max={300}
            step={1}
            onChange={handleScaleY}
          />
        </Row>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rotation</p>
        <SliderInput
          label="Tilt (θ)"
          value={toDeg(asset.theta ?? 0)}
          min={-180}
          max={180}
          onChange={(v) => u({ theta: toRad(v) })}
        />
      </div>

      {(asset.type === 'rotating' || asset.type === 'oscillating') && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Center of Rotation</p>
            <Row>
              <NumInput
                label="CX"
                value={asset.cr?.[0] ?? 0}
                onChange={(v) => u({ cr: [v, asset.cr?.[1] ?? 0] })}
              />
              <NumInput
                label="CY"
                value={-(asset.cr?.[1] ?? 0)}
                onChange={(v) => u({ cr: [asset.cr?.[0] ?? 0, -v] })}
              />
            </Row>
            <NumInput label="Radius" value={asset.radius ?? 0} onChange={(v) => u({ radius: v })} />
          </div>
        </>
      )}

      {asset.type === 'oscillating' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Oscillation Range (°)</p>
          <Row>
            <NumInput
              label="Min θ (°)"
              value={toDeg(asset.minTheta ?? -Math.PI / 6)}
              step={1}
              onChange={(v) => u({ minTheta: toRad(v) })}
            />
            <NumInput
              label="Max θ (°)"
              value={toDeg(asset.maxTheta ?? Math.PI / 6)}
              step={1}
              onChange={(v) => u({ maxTheta: toRad(v) })}
            />
          </Row>
          <SliderInput
            label="Phase"
            value={toDeg(asset.phase ?? 0)}
            onChange={(v) => u({ phase: toRad(v) })}
          />
        </div>
      )}

      {isDefaultCar && asset.type !== 'avatar' && (
        <div className="flex flex-col gap-3 border-t border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Color Remapping</p>
          <p className="text-xs text-gray-500">
            Replaces a specific color in this image with each racer's display color at runtime.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={asset.colorRemap?.enabled ?? false}
              onChange={(e) => u({ colorRemap: { ...asset.colorRemap, enabled: e.target.checked } })}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-sm text-white">Enable color remapping</span>
          </label>
          {asset.colorRemap?.enabled && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-400">Source color to replace</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: asset.colorRemap?.sourceColor ?? '#FF001A' }}
                />
                <button
                  onClick={() => onEyedropperActivate(asset.id)}
                  className="flex items-center gap-2 rounded-lg bg-gray-700 border border-gray-600 px-3 py-1.5 text-xs text-white hover:border-purple-500 transition-colors"
                >
                  <span>Pick color from canvas</span>
                </button>
                <span className="text-xs text-gray-500 font-mono">
                  {asset.colorRemap?.sourceColor ?? '#FF001A'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default AssetForm