import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import UploadButton from '../UploadButton'

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

const ImageSection = ({ racingLine, onUpdateRacingLine }) => (
  <div className="flex flex-col gap-3">
    <Row>
      <NumInput label="X" value={racingLine.x} onChange={(v) => onUpdateRacingLine({ x: v })} />
      <NumInput label="Y" value={racingLine.y} onChange={(v) => onUpdateRacingLine({ y: v })} />
    </Row>
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Scale</span>
        <span className="text-xs text-gray-500">{Math.round(racingLine.scale * 100)}%</span>
      </div>
      <input
        type="range" min={0.05} max={3} step={0.05}
        value={racingLine.scale}
        onChange={(e) => onUpdateRacingLine({ scale: parseFloat(e.target.value) })}
        className="w-full accent-purple-500"
      />
    </label>
  </div>
)

const LineSegmentSection = ({ racingLine, onUpdateRacingLine }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400">P1 (Bottom)</p>
      <Row>
        <NumInput label="X" value={racingLine.p1[0]}
          onChange={(v) => onUpdateRacingLine({ p1: [v, racingLine.p1[1]] })} />
        <NumInput label="Y" value={racingLine.p1[1]}
          onChange={(v) => onUpdateRacingLine({ p1: [racingLine.p1[0], v] })} />
      </Row>
    </div>
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400">P2 (Top)</p>
      <Row>
        <NumInput label="X" value={racingLine.p2[0]}
          onChange={(v) => onUpdateRacingLine({ p2: [v, racingLine.p2[1]] })} />
        <NumInput label="Y" value={racingLine.p2[1]}
          onChange={(v) => onUpdateRacingLine({ p2: [racingLine.p2[0], v] })} />
      </Row>
    </div>
  </div>
)

const ModifierSection = ({ selection, racingLine, onUpdateModifier }) => {
  const mod = racingLine[selection.modifierKey]?.find(m => m.id === selection.id)
  if (!mod) return null

  const u = (patch) => onUpdateModifier(selection.modifierKey, selection.id, patch)

  const handleUrlChange = (url) => {
    u({ url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => u({ dim: [img.naturalWidth, img.naturalHeight] })
    img.src = resolveImageUrl(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Name</span>
        <input
          type="text"
          value={mod.name ?? ''}
          onChange={(e) => u({ name: e.target.value })}
          className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Image URL</span>
        <DebouncedUrlInput value={mod.url} onChange={handleUrlChange} />

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Or upload an image</span>
          <UploadButton
            onUploaded={(url) => handleUrlChange(url)}
          />
        </label>
      </label>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</p>
        <Row>
          <NumInput label="X" value={mod.x} onChange={(v) => u({ x: v })} />
          <NumInput label="Y" value={mod.y} onChange={(v) => u({ y: v })} />
        </Row>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</p>
        <Row>
          <NumInput label="W" value={mod.dim[0]} onChange={(v) => u({ dim: [v, mod.dim[1]] })} />
          <NumInput label="H" value={mod.dim[1]} onChange={(v) => u({ dim: [mod.dim[0], v] })} />
        </Row>
      </div>
      <label className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Scale</span>
          <span className="text-xs text-gray-500">{Math.round(mod.scale * 100)}%</span>
        </div>
        <input
          type="range" min={0.05} max={3} step={0.05}
          value={mod.scale}
          onChange={(e) => u({ scale: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </label>
    </div>
  )
}

const RacingLineForm = ({ selection, racingLine, onUpdateRacingLine, onUpdateModifier, section }) => {
  if (!selection) return (
    <p className="text-xs text-gray-500 text-center py-4">Select the racing line or a modifier to edit it.</p>
  )

  if (selection.type === 'racingLine') {
    if (section === 'image') return <ImageSection racingLine={racingLine} onUpdateRacingLine={onUpdateRacingLine} />
    if (section === 'lineSegment') return <LineSegmentSection racingLine={racingLine} onUpdateRacingLine={onUpdateRacingLine} />
    return null
  }

  if (selection.type === 'modifier') {
    return <ModifierSection selection={selection} racingLine={racingLine} onUpdateModifier={onUpdateModifier} />
  }

  return null
}

export default RacingLineForm