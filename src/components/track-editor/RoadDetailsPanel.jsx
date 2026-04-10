import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import Tooltip from '../ToolTip'
import UploadButton from '../UploadButton'

const SUBSECTION_TOOLTIPS = {
  'Road Type': 'Choose between a colorful rainbow road, a solid color road, or a custom image road.',
  'Scrolling Image': 'An optional image that scrolls along the road to create a sense of speed. Often used for road markers.',
}

const DebouncedUrlInput = ({ value, onChange }) => {
  const [local, setLocal] = useState(value ?? '')
  useEffect(() => { setLocal(value ?? '') }, [value])
  useEffect(() => {
    if (local === (value ?? '')) return
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

const NumInput = ({ label, value, onChange, step = 1 }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <input
      type="number"
      step={step}
      value={Math.round((value ?? 0) * 100) / 100}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
    />
  </label>
)

const Row = ({ children }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
)

const SubSection = ({ label, children, defaultCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <div className="flex flex-col">
      <div
        onClick={() => setCollapsed(prev => !prev)}
        className={`flex items-center justify-between rounded-lg px-3 py-2 
                  bg-gray-700/50 border border-gray-600 cursor-pointer hover:border-gray-400 
                  transition-colors select-none 
                  ${collapsed ? '' : 'bg-purple-900/40 border border-purple-600 hover:border-purple-500 rounded-b-none'}`}
      >
        <Tooltip text={SUBSECTION_TOOLTIPS[label]}>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{label} <span className="ml-1 text-gray-500 text-xs">ⓘ</span></span>
        </Tooltip>
        <span className="text-xs text-gray-400">{collapsed ? '▼' : '▲'}</span>
      </div>
      {!collapsed && (
        <div className="px-3 py-3 border border-purple-600 bg-purple-950/30 rounded-lg rounded-t-none flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

const RoadDetailsPanel = ({ track, setRoad, setSlot, clearSlot }) => {
  const [collapsed, setCollapsed] = useState(true)
  const { road, scrollingImage } = track

  const handleRoadUrlChange = (url) => {
    setRoad({ url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setRoad({ dim: [img.naturalWidth, img.naturalHeight] })
    img.src = resolveImageUrl(url)
  }

  const handleScrollingUrlChange = (url) => {
    if (!url) { clearSlot('scrollingImage'); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setSlot('scrollingImage', {
      url,
      dim: [img.naturalWidth, img.naturalHeight],
      scale: 1,
      x: 0,
      y: 0,
    })
    img.src = resolveImageUrl(url)
    setSlot('scrollingImage', {
      url,
      dim: scrollingImage?.dim ?? [1920, 1080],
      scale: scrollingImage?.scale ?? 1,
      x: scrollingImage?.x ?? 0,
      y: scrollingImage?.y ?? 0,
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={() => setCollapsed(prev => !prev)}
        className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-700 border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors select-none"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Road Details</span>
        <span className="text-xs text-gray-400">{collapsed ? '▼' : '▲'}</span>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-1 pl-1">

          {/* Road Type */}
          <SubSection label="Road Type">
            <div className="flex flex-col gap-2">
              {['rainbow', 'solid', 'image'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="roadType"
                    value={type}
                    checked={road.type === type}
                    onChange={() => setRoad({ type })}
                    className="accent-purple-500"
                  />
                  <span className="text-sm text-white capitalize">
                    {type === 'image' ? 'Static Image' : type === 'solid' ? 'Solid Color' : 'Rainbow'}
                  </span>
                </label>
              ))}
            </div>

            {road.type === 'solid' && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">Color</span>
                <input
                  type="color"
                  value={road.color ?? '#888888'}
                  onChange={(e) => setRoad({ color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            )}

            {road.type === 'image' && (
              <div className="flex flex-col gap-3 mt-1">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Image URL</span>
                  <DebouncedUrlInput value={road.url} onChange={handleRoadUrlChange} />

                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Or upload an image</span>
                    <UploadButton
                      onUploaded={(url) => handleRoadUrlChange(url)}
                    />
                  </label>
                </label>
                <Row>
                  <NumInput label="X" value={road.x ?? 0} onChange={(v) => setRoad({ x: v })} />
                  <NumInput label="Y" value={road.y ?? 0} onChange={(v) => setRoad({ y: v })} />
                </Row>
                <Row>
                  <NumInput label="W" value={road.dim?.[0] ?? 1920} onChange={(v) => setRoad({ dim: [v, road.dim?.[1] ?? 1080] })} />
                  <NumInput label="H" value={road.dim?.[1] ?? 1080} onChange={(v) => setRoad({ dim: [road.dim?.[0] ?? 1920, v] })} />
                </Row>
                <label className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Scale</span>
                    <span className="text-xs text-gray-500">{Math.round((road.scale ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0.05} max={3} step={0.05}
                    value={road.scale ?? 1}
                    onChange={(e) => setRoad({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </label>
              </div>
            )}
          </SubSection>

          {/* Scrolling Image */}
          <SubSection label="Scrolling Image">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Image URL</span>
              <div className="flex gap-2">
                <DebouncedUrlInput
                  value={scrollingImage?.url ?? ''}
                  onChange={handleScrollingUrlChange}
                />
                {scrollingImage?.url && (
                  <button
                    onClick={() => clearSlot('scrollingImage')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Or upload an image</span>
                <UploadButton
                  onUploaded={(url) => handleScrollingUrlChange(url)}
                />
              </label>
            </label>
            {scrollingImage?.url && (
              <>
                <Row>
                  <NumInput label="X" value={scrollingImage.x ?? 0}
                    onChange={(v) => setSlot('scrollingImage', { ...scrollingImage, x: v })} />
                  <NumInput label="Y" value={scrollingImage.y ?? 0}
                    onChange={(v) => setSlot('scrollingImage', { ...scrollingImage, y: v })} />
                </Row>
                <Row>
                  <NumInput label="W" value={scrollingImage.dim?.[0] ?? 1920}
                    onChange={(v) => setSlot('scrollingImage', { ...scrollingImage, dim: [v, scrollingImage.dim?.[1] ?? 1080] })} />
                  <NumInput label="H" value={scrollingImage.dim?.[1] ?? 1080}
                    onChange={(v) => setSlot('scrollingImage', { ...scrollingImage, dim: [scrollingImage.dim?.[0] ?? 1920, v] })} />
                </Row>
                <label className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Scale</span>
                    <span className="text-xs text-gray-500">{Math.round((scrollingImage.scale ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0.05} max={3} step={0.05}
                    value={scrollingImage.scale ?? 1}
                    onChange={(e) => setSlot('scrollingImage', { ...scrollingImage, scale: parseFloat(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </label>
              </>
            )}
          </SubSection>

        </div>
      )}
    </div>
  )
}

export default RoadDetailsPanel