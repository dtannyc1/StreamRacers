import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; 

const CodeEditor = Editor.default || Editor;

const CustomCodeEditor = ({ asset, onSave, onClose }) => {
  const [drawText, setDrawText] = useState(asset.drawCode || CUSTOM_TEMPLATES.draw);
  const [updateText, setUpdateText] = useState(asset.updateCode || CUSTOM_TEMPLATES.update);

  const editorStyles = {
    fontFamily: '"Fira code", monospace',
    fontSize: 14,
    minHeight: '100%',
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
      onPointerDown={(e) => { 
        e.stopPropagation(); 
      }}
    >
      <div className="bg-slate-900 border border-slate-700 w-full h-full max-w-6xl rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-white font-black uppercase tracking-widest">Custom Asset Logic Editor</h2>
          <div className="flex gap-4">
            <button onClick={() => { if(confirm("Reset?")) { setDrawText(CUSTOM_TEMPLATES.draw); setUpdateText(CUSTOM_TEMPLATES.update); }}} 
                    className="text-xs text-slate-500 hover:text-white uppercase font-bold">Reset Template</button>
            <button onClick={onClose} className="text-slate-400 hover:text-white px-4">Cancel</button>
            <button onClick={() => onSave(drawText, updateText)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold">Apply Code</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-y-auto">
          {/* Left: Documentation */}
          <div className="w-64 p-6 bg-slate-950 border-r border-slate-800 text-xs overflow-y-auto">
            <h3 className="text-indigo-400 font-bold mb-4 uppercase">Variable Reference</h3>
            
            <div className="space-y-6">
              <section>
                <div className="space-y-2 text-slate-400">
                  <p><b className="text-slate-200">ctx:</b> Canvas2D Rendering Context</p>
                  <p><b className="text-slate-200">asset:</b> The asset being rendered, see below</p>
                  <p><b className="text-slate-200">drawable:</b> Actual image to be drawn</p>
                  <p><b className="text-slate-200">dt:</b> Delta time (ms)</p>
                  <p><b className="text-slate-200">speed:</b> Current vehicle velocity</p>
                </div>
              </section>

              <section>
                <h4 className="text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[10px]">Asset Object</h4>
                <div className="space-y-3 font-mono">
                  <div className="border-l border-slate-800 pl-3 space-y-2 text-slate-400">
                    <div>
                      <span className="text-indigo-300">Spatial Properties</span>
                      <ul className="pl-2">
                        <li><b className="text-slate-200">.tl:</b> [x, y] Top-Left, px</li>
                        <li><b className="text-slate-200">.dim:</b> [w, h] Image Dimensions, px</li>
                        <li><b className="text-slate-200">.cr:</b> [x, y] Center of Rotation, px</li>
                        <li><b className="text-slate-200">.theta_0:</b> Base rotation, rad</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="text-indigo-300">Physics/State</span>
                      <ul className="pl-2">
                        <li><b className="text-slate-200">.type:</b> 'static', 'rotating', 'oscillating', or 'custom'</li>
                        <li><b className="text-slate-200">.theta:</b> Current rotation, rad</li>
                        <li><b className="text-slate-200">.phase:</b> Oscillation phase, rad</li>
                        <li><b className="text-slate-200">.theta_dot:</b> Direction of rotation, +/-1</li>
                        <li><b className="text-slate-200">.radius:</b> Rotation radius, px</li>
                      </ul>
                    </div>

                    <div>
                      <span className="text-indigo-300">Asset Details</span>
                      <ul className="pl-2">
                        <li><b className="text-slate-200">.id:</b> Unique identifier</li>
                        <li><b className="text-slate-200">.name:</b> Asset label</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[10px]">Notes</h4>
                <div className="space-y-3 font-mono">
                  <p>The update and draw functions are called each frame to update and render the asset.</p>
                  <p>The listed properties of the asset object are the currently existing ones, but the values are not changed without your input.</p>
                  <p>Feel free to create your own keys within the asset object. They will persist and be accessible to use within both the update and draw functions.</p>
                  <p>ctx.save and ctx.restore are already done in the code, so there's no need to call them manually.</p>
                </div>
              </section>
            </div>
          </div>

          {/* Right: Code Input */}
          <div className="flex-1 p-6 flex flex-col gap-6 bg-[#0d1117]">
            <div className="flex-1 px-4 flex flex-col max-h-[50%] font-mono text-[14px] border border-slate-800 rounded-lg bg-black/40">
              <div className="pt-3 text-white-400 select-none">
                asset.draw = function(ctx, asset, drawable) {"{"}
              </div>
              <div className="flex-1 overflow-auto">
                <CodeEditor 
                  className="editor-scroll-container"
                  value={drawText} 
                  onValueChange={setDrawText} 
                  highlight={code => highlight(code, languages.js)} 
                  style={editorStyles} 
                />
              </div>
              <div className="py-3 text-white-400 select-none">
                {"}"}
              </div>
            </div>
            <div className="px-4 flex-1 flex flex-col max-h-[50%] font-mono text-[14px] border border-slate-800 rounded-lg bg-black/40">
              <div className="pt-3 text-white-400 select-none">
                asset.update = function(asset, dt, speed) {"{"}
              </div>
              <div className="flex-1 overflow-auto">
                <CodeEditor 
                  className="editor-scroll-container"
                  value={updateText} 
                  onValueChange={setUpdateText} 
                  highlight={code => highlight(code, languages.js)} 
                  style={editorStyles} 
                />
              </div>
              <div className="py-3 text-white-400 select-none">
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCodeEditor;

const CUSTOM_TEMPLATES = {
  draw: `// 'ctx' = canvas, 'asset' = this object, 'drawable' = resolved image/frame to draw
    const [x, y] = asset.tl
    const [w, h] = asset.dim
    let angle = (asset.theta_0 ?? 0) + (asset.theta ?? 0)
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.translate(-cx, -cy)
    ctx.drawImage(drawable, x, y, w, h)`,

  update: `// 'asset' = this object, 'dt' = delta time, 'speed' = speed of car
    // Example: asset.y += Math.sin(dt * 0.005) * 2;`
};