import { useState, useEffect } from 'react'

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

const Row = ({ children }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
)

const AssetForm = ({ asset, onUpdate }) => {
  if (!asset) return (
    <p className="text-xs text-gray-500 text-center py-4">Select an asset to edit it.</p>
  )

  const u = (patch) => onUpdate(asset.id, patch)

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
          onChange={(v) => u({ spriteUrl: v })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Type</span>
        <select
          value={asset.type}
          onChange={(e) => {
            const newType = e.target.value
            const patch = { type: newType }

            if ((newType === 'rotating' || newType === 'oscillating') && !asset.cr) {
              // initialize CR to center of the asset
              patch.cr = [asset.tl[0] + asset.dim[0] / 2, asset.tl[1] + asset.dim[1] / 2]
              patch.theta = 0
              patch.radius = Math.min(asset.dim[0], asset.dim[1]) / 4
            }

            if (newType === 'oscillating' && asset.minTheta == null) {
              patch.minTheta = -Math.PI / 6
              patch.maxTheta = Math.PI / 6
            }

            u(patch)
          }}
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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</p>
        <Row>
          <NumInput label="W" value={asset.dim[0]} onChange={(v) => u({ dim: [v, asset.dim[1]] })} />
          <NumInput label="H" value={asset.dim[1]} onChange={(v) => u({ dim: [asset.dim[0], v] })} />
        </Row>
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
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rotation</p>
            <Row>
              <NumInput
                label="Initial Angle (°)"
                value={toDeg(asset.theta ?? 0)}
                step={1}
                onChange={(v) => u({ theta: toRad(v) })}
              />
              <NumInput label="Radius" value={asset.radius ?? 0} onChange={(v) => u({ radius: v })} />
            </Row>
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
        </div>
      )}

    </div>
  )
}

export default AssetForm