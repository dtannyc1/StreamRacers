import { useState } from 'react'
import TrackAssetForm from './TrackAssetForm'
import Tooltip from '../ToolTip'

const SECTION_LABELS = {
  backgroundAssets: 'Background Assets',
  foregroundAssets: 'Foreground Assets',
}

const SECTION_TOOLTIPS = {
  backgroundAssets: 'Images rendered randomly behind the road. They scroll at the same speed as the road, so they are good for adding depth and atmosphere to the track.',
  foregroundAssets: 'Images rendered randomly in front of the road. They scroll at the same speed as the road, so they are good for adding depth and atmosphere to the track.',
}

const TrackAssetList = ({ track, selectedAssetId, selectedListKey, onSelect, onAdd, onRemove, onUpdate }) => {
  const [collapsed, setCollapsed] = useState({ backgroundAssets: true, foregroundAssets: true })

  const toggleSection = (listKey) =>
    setCollapsed(prev => ({ ...prev, [listKey]: !prev[listKey] }))

  const handleAssetClick = (id, listKey) => {
    if (selectedAssetId === id && selectedListKey === listKey) {
      onSelect(null, null)
    } else {
      onSelect(id, listKey)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {['backgroundAssets', 'foregroundAssets'].map(listKey => (
        <div key={listKey} className="flex flex-col gap-1">

          {/* Section header */}
          <div
            onClick={() => toggleSection(listKey)}
            className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-700 border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors select-none"
          >
            <Tooltip text={SECTION_TOOLTIPS[listKey]}>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    {SECTION_LABELS[listKey]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {track[listKey].length}
                  </span>
              </div>
            </Tooltip>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { 
                  e.stopPropagation()
                  setCollapsed(prev => ({ ...prev, [listKey]: false }))
                  onAdd(listKey)
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                + Add
              </button>
              <span className="text-xs text-gray-400">
                {collapsed[listKey] ? '▼' : '▲'}
              </span>
            </div>
          </div>

          {/* Asset list */}
          {!collapsed[listKey] && (
            <div className="flex flex-col gap-1 pl-1">
              {track[listKey].length === 0 && (
                <p className="text-xs text-gray-500 px-2 py-1">No assets yet.</p>
              )}
              {track[listKey].map((asset, index) => {
                const isSelected = asset.id === selectedAssetId && selectedListKey === listKey
                return (
                  <div key={asset.id} className="flex flex-col">
                    <div
                      onClick={() => handleAssetClick(asset.id, listKey)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-900/40 border border-purple-600 rounded-b-none'
                          : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div>
                        <p className="text-sm text-white">{asset.name || `Asset ${index + 1}`}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">
                          {asset.url
                            ? (() => { try { return new URL(asset.url).hostname } catch { return asset.url } })()
                            : 'No URL'
                          }
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(listKey, asset.id) }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {isSelected && (
                      <div className="rounded-b-lg border border-t-0 border-purple-600 bg-purple-950/30 px-3 py-3">
                        <TrackAssetForm
                          asset={asset}
                          listKey={listKey}
                          onUpdate={onUpdate}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      ))}
    </div>
  )
}

export default TrackAssetList