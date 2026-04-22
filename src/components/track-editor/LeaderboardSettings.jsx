import { useState, useEffect } from "react"
import Tooltip from "../ToolTip"

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

const DebouncedSliderInput = ({ label, value, onChange, min = 0, max = 1, step = 0.01, unit = "" }) => {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), 600)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <label className="flex flex-col gap-1 grow-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{Math.round(local*100)/100}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => setLocal(parseFloat(e.target.value))}
        className="w-full accent-purple-500"
      />
    </label>
  )
}

const DebouncedColorInput = ({ value, onChange}) => {
  const [local, setLocal] = useState(value)

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
      type="color"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
    />
  )
}

const CheckboxInput = ({ value, onChange}) => {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), 100)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <input
      type="checkbox"
      checked={local}
      onChange={(e) => setLocal(e.target.checked)}
    />
  )
}

const LeaderboardSettings = ({track, selection, onSelect, onUpdate}) => {

  useEffect(() => {
    if (!track) return
    if (!track.styleSheet) {
      // ensure that track has a style sheet
      onUpdate(DEFAULT_LEADERBOARD_SETTINGS) 
    }
  }, [])

  const selected = selection?.type === 'leaderboard'

  const fontOptions = ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Georgia", 
                        "Times New Roman", "Garamond", "Courier New", "Oswald", 
                        "Open Sans", "Roboto", "Comic Sans MS"
                      ]

  const u = (patch) => onUpdate(patch)

  const toggleLeaderboardSettings = () => {
    if (!selected) onSelect({type: 'leaderboard'})
    else onSelect(null)
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={toggleLeaderboardSettings}
        className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-700 border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors select-none"
      >
        <Tooltip text="Leaderboard shown while the race is running">
          <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Leaderboard Settings
              </span>
          </div>
        </Tooltip>
        <span className="text-xs text-gray-400">
          {!selected ? '▼' : '▲'}
        </span>
      </div>

      {
        selected && 
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-3 mx-0.5
                      transition-colors 
                      bg-purple-950/30 border border-purple-600`}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <NumInput
                label="X Location"
                value={track.styleSheet?.left ?? 1425}
                onChange={(v) => u({ left: v })}
              />
              <NumInput
                label="Y Location"
                value={track.styleSheet?.top ?? 320}
                onChange={(v) => u({ top: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumInput
                label="Padding X"
                value={track.styleSheet?.paddingX ?? 25}
                onChange={(v) => u({ paddingX: v })}
              />
              <NumInput
                label="Padding Y"
                value={track.styleSheet?.paddingY ?? 20}
                onChange={(v) => u({ paddingY: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Font</span>
                <select 
                  value={track.styleSheet?.font ?? 'Oswald'} 
                  onChange={(e) => u({ font: e.target.value })}
                >
                  {
                    fontOptions.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                      .map((val, id) => (
                        <option key={`${val}-${id}`} value={`${val}`} style={{fontFamily: `${val}`, color: 'black'}}>{`${val}`}</option>
                      ))
                  }
                </select>
              </label>
              <NumInput
                label="Font Size"
                value={track.styleSheet?.fontSize ?? 32}
                onChange={(v) => u({ fontSize: v })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <DebouncedSliderInput 
                label="Letter Spacing X"
                value={track.styleSheet?.letterSpacing ?? 1.5}
                onChange={(v) => u({ letterSpacing: v })}
                min={-5}
                max={5}
                step={0.5}
              />
              <DebouncedSliderInput 
                label="Line Spacing Y"
                value={track.styleSheet?.ySpacing ?? -5}
                onChange={(v) => u({ ySpacing: v })}
                min={-10}
                max={10}
                step={0.5}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <DebouncedSliderInput 
                label="Width"
                value={track.styleSheet?.width ?? 480}
                onChange={(v) => u({ width: v })}
                min={50}
                max={1080}
                step={1}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Visible during Race</span>
                <CheckboxInput
                  value={track.styleSheet?.enabled ?? true}
                  onChange={(v) => u({ enabled: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Background Color</span>
                <DebouncedColorInput
                  value={track.styleSheet?.backgroundColor ?? "#000000"}
                  onChange={(v) => u({ backgroundColor: v })}
                />
              </div>
              <DebouncedSliderInput 
                label="Background Opacity"
                value={track.styleSheet?.backgroundOpacity ?? 1}
                onChange={(v) => u({ backgroundOpacity: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 ">
                <span className="text-xs text-gray-400">Text Color</span>
                <DebouncedColorInput
                  value={track.styleSheet?.color ?? "#FFFFFF"}
                  onChange={(v) => u({ color: v })}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Finisher Text Color</span>
                <DebouncedColorInput
                  value={track.styleSheet?.winColor ?? "#00FFFF"}
                  onChange={(v) => u({ winColor: v })}
                />
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default LeaderboardSettings

const DEFAULT_LEADERBOARD_SETTINGS = {
  top: 320,
  left: 1425,
  paddingY: 20,
  paddingX: 25,
  font: 'Oswald',
  fontSize: 32,
  backgroundColor: "#000000",
  backgroundOpacity: 1,
  color: '#FFFFFF',
  winColor: '#00FFFF',
  width: 480,
  letterSpacing: 1.5,
  ySpacing: -5,
}