const SECTION_LABELS = {
  backgroundAssets: 'Background Assets',
  foregroundAssets: 'Foreground Assets',
}

const TrackAssetList = ({ track, selectedAssetId, selectedListKey, onSelect, onAdd, onRemove }) => {
  return (
    <div className="flex flex-col gap-6">
      {['backgroundAssets', 'foregroundAssets'].map(listKey => (
        <div key={listKey} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {SECTION_LABELS[listKey]}
            </h3>
            <button
              onClick={() => onAdd(listKey)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              + Add
            </button>
          </div>

          {track[listKey].length === 0 && (
            <p className="text-xs text-gray-500">No assets yet.</p>
          )}

          <div className="flex flex-col gap-1">
            {track[listKey].map((asset, index) => (
              <div
                key={asset.id}
                onClick={() => onSelect(asset.id, listKey)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  asset.id === selectedAssetId && selectedListKey === listKey
                    ? 'bg-purple-900/40 border border-purple-600'
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div>
                  <p className="text-sm text-white">{asset.name || `Asset ${index + 1}`}</p>
                  <p className="text-xs text-gray-400">{asset.url ? new URL(asset.url).hostname : 'No URL'}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(listKey, asset.id) }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrackAssetList