import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../../lib/utils'

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
      className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
    />
  )
}

const ModifierList = ({ modifiers, modifierKey, selection, onSelect, onAdd, onRemove }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {modifierKey === 'startModifiers' ? 'Start Modifiers' : 'Finish Modifiers'}
      </p>
      <button
        onClick={() => onAdd(modifierKey)}
        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        + Add
      </button>
    </div>

    {modifiers.length === 0 && (
      <p className="text-xs text-gray-500">No modifiers yet.</p>
    )}

    <div className="flex flex-col gap-1">
      {modifiers.map((mod, index) => (
        <div
          key={mod.id}
          onClick={() => onSelect(mod.id, modifierKey)}
          className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
            selection?.type === 'modifier' && selection.id === mod.id && selection.modifierKey === modifierKey
              ? 'bg-purple-900/40 border border-purple-600'
              : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
          }`}
        >
          <div>
            <p className="text-sm text-white">{mod.name || `Modifier ${index + 1}`}</p>
            <p className="text-xs text-gray-400 truncate max-w-[160px]">
              {mod.url ? (() => { try { return new URL(mod.url).hostname } catch { return mod.url } })() : 'No URL'}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(modifierKey, mod.id) }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)

const RacingLinePanel = ({
  racingLine,
  selection,
  onSelect,
  onUpdateRacingLine,
  onAddModifier,
  onRemoveModifier,
}) => {
  const isSelected = selection?.type === 'racingLine'

  const handleUrlChange = (url) => {
    onUpdateRacingLine({ url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => onUpdateRacingLine({ dim: [img.naturalWidth, img.naturalHeight] })
    img.src = resolveImageUrl(url)
  }

  const crossX = Math.round((racingLine.p1[0] + racingLine.p2[0]) / 2)
  const roadHeight = Math.round(Math.abs(racingLine.p2[1] - racingLine.p1[1]))

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Racing Line</h3>

      {/* Main racing line slot — click to enter editing mode */}
      <div
        onClick={() => onSelect({ type: 'racingLine' })}
        className={`flex flex-col gap-3 rounded-lg p-3 cursor-pointer border transition-colors ${
          isSelected
            ? 'border-yellow-500 bg-yellow-900/20'
            : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-yellow-400">Line Segment + Image</p>
          {isSelected && <p className="text-xs text-yellow-400/60">editing</p>}
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <DebouncedUrlInput value={racingLine.url} onChange={handleUrlChange} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <span>Crossing X: <span className="text-white">{crossX}</span></span>
          <span>Road Height: <span className="text-white">{roadHeight}px</span></span>
        </div>
      </div>

      {/* Modifier lists */}
      <ModifierList
        modifiers={racingLine.startModifiers}
        modifierKey="startModifiers"
        selection={selection}
        onSelect={(id, modifierKey) => onSelect({ type: 'modifier', id, modifierKey })}
        onAdd={onAddModifier}
        onRemove={onRemoveModifier}
      />

      <ModifierList
        modifiers={racingLine.finishModifiers}
        modifierKey="finishModifiers"
        selection={selection}
        onSelect={(id, modifierKey) => onSelect({ type: 'modifier', id, modifierKey })}
        onAdd={onAddModifier}
        onRemove={onRemoveModifier}
      />
    </div>
  )
}

export default RacingLinePanel