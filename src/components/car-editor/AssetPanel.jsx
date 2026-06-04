import { useState } from "react";
import AssetDrawer from "../AssetDrawer"
import AssetForm from "./AssetForm"
import { hydrateAsset } from "../../shared/assetRenderer";
import CustomCodeEditor from "../CustomCodeEditor";
import { resolveImageUrl } from "../../shared/gifLoader";

const AssetPanel = ({ 
  car, 
  selectedId, 
  drawerOpen,
  onSelect, 
  onDeselect,
  onAdd, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  asset,
  onUpdate,
  onSpriteUrlChange,
  toggleAspectLock,
  isDefaultCar,
  onEyedropperActivate
}) => {
  const assets = car.assets;
  const [isLogicEditorOpen, setIsLogicEditorOpen] = useState(false);

  const u = (patch) => onUpdate(asset.id, patch)
  const handleSaveCustomLogic = (drawCode, updateCode) => {
    const updated = hydrateAsset({
      ...asset,
      type: 'custom',
      drawCode,
      updateCode
    });
    
    const patch = {
      draw: updated.draw,
      update: updated.update,
      error: updated.error,
      isBroken: updated.isBroken,
      drawCode,
      updateCode,
    }

    u(patch)
    setIsLogicEditorOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 h-full custom-scrollbar rounded-lg pr-1
                    max-h-[calc(100dvh-1rem-42px-1.5rem)]
                    sm:max-h-[calc(100dvh-2rem-42px-1.5rem)] 
                    xl:max-h-[calc(100dvh-4rem-42px-1.5rem)]
                    min-h-[calc(100dvh-1rem-42px-1.5rem)]
                    sm:min-h-[calc(100dvh-2rem-42px-1.5rem)] 
                    xl:min-h-[calc(100dvh-4rem-42px-1.5rem)]
                    ${drawerOpen ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Assets</h3>
        <button
          onClick={onAdd}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors pr-2"
        >
          + Add
        </button>
      </div>

      <p className="text-xs text-gray-500">The order of assets determines their drawing priority.</p>

      <div className="flex flex-col gap-1 pr-1">
        {[...assets].reverse().map((asset, reversedIndex) => {
          const index = assets.length - 1 - reversedIndex
          return (
            <div 
                key={asset.id}
            >
              <div
                onClick={() => onSelect(asset.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  asset.id === selectedId
                    ? 'bg-purple-900/40 border border-purple-600 rounded-b-none'
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div>
                    {
                      !!asset.spriteUrl && (
                        <img 
                          src={resolveImageUrl(asset.spriteUrl)}
                          alt={asset.name}
                          crossOrigin="anonymous"
                          className="w-8 h-8 object-contain"
                        />
                      )

                    }
                  </div>
                  <div>
                    <p className="text-sm text-white">{asset.name || `Asset ${index + 1}`}</p>
                    <p className="text-xs text-gray-400 capitalize">{asset.type}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(asset.id) }}
                    disabled={index === assets.length - 1}
                    className="text-xs text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(asset.id) }}
                    disabled={index === 0}
                    className="text-xs text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    ▼
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(asset.id) }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AssetDrawer
        isOpen={drawerOpen}
        onClose={onDeselect}
        title={asset?.name ? ('Edit ' + asset.name) : 'Edit Asset'}
      >
        <AssetForm 
          car={car}
          asset={asset} 
          onUpdate={onUpdate} 
          onSpriteUrlChange={onSpriteUrlChange}
          toggleAspectLock={toggleAspectLock}
          isDefaultCar={isDefaultCar}
          onEyedropperActivate={onEyedropperActivate}
          isLogicEditorOpen={isLogicEditorOpen}
          setIsLogicEditorOpen={setIsLogicEditorOpen}
        />
      </AssetDrawer>
      
      {isLogicEditorOpen && (
        <div
          className="select-text"
        >
          <CustomCodeEditor
            asset={asset} 
            onSave={handleSaveCustomLogic} 
            onClose={() => setIsLogicEditorOpen(false)} 
            className="h-full outline-none"
            textareaId="draw-editor-area"  
          />
        </div>
      )}
    </div>
  )
}

export default AssetPanel