import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import Tooltip from '../ToolTip'
import RacingLineForm from './RacingLineForm'

const SUBSECTION_TOOLTIPS = {
  'Image': 'Start/finish line image',
  'Line Segment': 'Line Segment defining the start/finish line. Yellow end point handles are drawn on the canvas for easier editing. The line segment also dictates the height of the track on stream.',
}

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

const SubSection = ({ label, modifierCollapsed, toggleModifier, children  }) => {
  const collapsed = modifierCollapsed[label] ?? true
  return (
    <div className="flex flex-col">
        <div
          onClick={() => toggleModifier(label)}
          className={`flex items-center justify-between rounded-lg px-3 py-2 
                    border cursor-pointer 
                    transition-colors select-none 
                    ${collapsed ? 
                      'bg-gray-700/50 border-gray-600 hover:border-gray-400' : 
                      'bg-purple-900/40 border border-purple-600 rounded-b-none hover:border-purple-500'}`}
        >
          <Tooltip text={SUBSECTION_TOOLTIPS[label]}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{label} <span className="ml-1 text-gray-500 text-xs">ⓘ</span></span>
          </Tooltip>
          <span className="text-xs text-gray-400">{collapsed ? '▼' : '▲'}</span>
        </div>
      {!collapsed && (
        <div className="px-3 py-3 border border-purple-600 bg-purple-950/30 rounded-t-none rounded-lg flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

const ModifierList = ({ modifiers, modifierKey, selection, onSelect, onAdd, onRemove, onUpdate, racingLine, collapsed, onToggle }) => {
  const label = modifierKey === 'startModifiers' ? 'Start Modifiers' : 'Finish Modifiers'
  const tooltipText = modifierKey === 'startModifiers'
    ? 'Images rendered when the start line is visible. Positions are locked relative to the start line image.'
    : 'Images rendered when the finish line is visible. Positions are locked relative to the finish line image.'

  const handleClick = (id) => {
    if (selection?.type === 'modifier' && selection.id === id && selection.modifierKey === modifierKey) {
      onSelect(null)
    } else {
      onSelect({ type: 'modifier', id, modifierKey })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={onToggle}
        className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-700/50 border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <Tooltip text={tooltipText}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{label}</span>
            <span className="ml-1 text-gray-500 text-xs">ⓘ</span>
          </Tooltip>
          <span className="text-xs text-gray-500">{modifiers.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(modifierKey) }}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            + Add
          </button>
          <span className="text-xs text-gray-400">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-1 pl-1">
          {modifiers.length === 0 && (
            <p className="text-xs text-gray-500 px-2 py-1">No modifiers yet.</p>
          )}
          {modifiers.map((mod, index) => {
            const isSelected = selection?.type === 'modifier' &&
              selection.id === mod.id &&
              selection.modifierKey === modifierKey
            return (
              <div key={mod.id} className="flex flex-col">
                <div
                  onClick={() => handleClick(mod.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-900/40 border border-purple-600 rounded-b-none'
                      : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div>
                    <p className="text-sm text-white">{mod.name || `Modifier ${index + 1}`}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">
                      {mod.url
                        ? (() => { try { return new URL(mod.url).hostname } catch { return mod.url } })()
                        : 'No URL'
                      }
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(modifierKey, mod.id) }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {isSelected && (
                  <div className="rounded-b-lg border border-t-0 border-purple-600 bg-purple-950/30 px-3 py-3">
                    <RacingLineForm
                      selection={selection}
                      racingLine={racingLine}
                      onUpdateRacingLine={() => {}}
                      onUpdateModifier={onUpdate}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const RacingLinePanel = ({
  racingLine,
  selection,
  onSelect,
  onUpdateRacingLine,
  onAddModifier,
  onRemoveModifier,
  onUpdateModifier,
  onVisibleModifierKeyChange,
}) => {
  const [sectionCollapsed, setSectionCollapsed] = useState(true)
  const [modifierCollapsed, setModifierCollapsed] = useState({
    startModifiers: true,
    finishModifiers: true,
    'Image': true,
    'Line Segment': true,
  })

  useEffect(() => {
    const visibleKey = Object.entries(modifierCollapsed).find(([_, v]) => !v)?.[0] ?? null
    onVisibleModifierKeyChange?.(visibleKey)
  }, [modifierCollapsed])

  const toggleModifier = (modifierKey) => {
    setModifierCollapsed(prev => ({
      startModifiers: true,
      finishModifiers: true,
      'Image': true,
      'Line Segment': true,
      [modifierKey]: !prev[modifierKey],
    }))
  }

  const handleSectionToggle = () => {
    setSectionCollapsed(prev => {
      if (!prev) {
        setModifierCollapsed({ startModifiers: true, finishModifiers: true })
      }
      return !prev
    })
  }

  const handleUrlChange = (url) => {
    onUpdateRacingLine({ url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => onUpdateRacingLine({ dim: [img.naturalWidth, img.naturalHeight] })
    img.src = resolveImageUrl(url)
  }

  /*
  const crossX = Math.round((racingLine.p1[0] + racingLine.p2[0]) / 2)
  const roadHeight = Math.round(Math.abs(racingLine.p2[1] - racingLine.p1[1]))
  */
  return (
    <div className="flex flex-col gap-1">

      {/* Section header */}
      <div
        onClick={handleSectionToggle}
        className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-700 border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors select-none"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Start/Finish Line Details</span>
        <span className="text-xs text-gray-400">{sectionCollapsed ? '▼' : '▲'}</span>
      </div>

      {!sectionCollapsed && (
        <div className="flex flex-col gap-1 pl-1">

          {/* Image subsection */}
          <SubSection label="Image" modifierCollapsed={modifierCollapsed} toggleModifier={toggleModifier}>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Image URL</span>
              <DebouncedUrlInput value={racingLine.url} onChange={handleUrlChange} />
            </label>
            <RacingLineForm
              selection={{ type: 'racingLine' }}
              racingLine={racingLine}
              onUpdateRacingLine={onUpdateRacingLine}
              onUpdateModifier={onUpdateModifier}
              section="image"
            />
          </SubSection>

          {/* Line segment subsection */}
          <SubSection label="Line Segment" modifierCollapsed={modifierCollapsed} toggleModifier={toggleModifier}>
            <RacingLineForm
              selection={{ type: 'racingLine' }}
              racingLine={racingLine}
              onUpdateRacingLine={onUpdateRacingLine}
              onUpdateModifier={onUpdateModifier}
              section="lineSegment"
            />
            
            {/* Details, just useful info for debugging. User doesnt need this
            <div className="grid grid-cols-2 gap-2 text-xs rounded-lg bg-gray-700/50 p-3 mb-1">
              <span className="text-gray-400">Crossing X</span>
              <span className="text-white font-medium">{crossX}</span>
              <span className="text-gray-400">Road Height</span>
              <span className="text-white font-medium">{roadHeight}px</span>
            </div>
            */}
          </SubSection>

          {/* Modifier lists */}
          <ModifierList
            modifiers={racingLine.startModifiers}
            modifierKey="startModifiers"
            collapsed={modifierCollapsed.startModifiers}
            onToggle={() => toggleModifier('startModifiers')}
            selection={selection}
            onSelect={onSelect}
            onAdd={onAddModifier}
            onRemove={onRemoveModifier}
            onUpdate={onUpdateModifier}
            racingLine={racingLine}
          />

          <ModifierList
            modifiers={racingLine.finishModifiers}
            modifierKey="finishModifiers"
            collapsed={modifierCollapsed.finishModifiers}
            onToggle={() => toggleModifier('finishModifiers')}
            selection={selection}
            onSelect={onSelect}
            onAdd={onAddModifier}
            onRemove={onRemoveModifier}
            onUpdate={onUpdateModifier}
            racingLine={racingLine}
          />

        </div>
      )}
    </div>
  )
}

export default RacingLinePanel