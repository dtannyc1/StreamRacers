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
    height: '100%',
    maxHeight: '100%',
    overflow: 'auto',
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
          <h2 className="text-white font-black uppercase italic tracking-widest">Custom Logic Editor</h2>
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
            <h3 className="text-indigo-400 font-bold mb-4 uppercase">Reference</h3>
            <div className="space-y-4 text-slate-400">
              <p><b className="text-slate-200">asset:</b> Access x, y, w, h, theta, and customData.</p>
              <p><b className="text-slate-200">ctx:</b> Standard Canvas2D context.</p>
              <p><b className="text-slate-200">dt:</b> Frame delta time for smooth movement.</p>
              <p><b className="text-slate-200">speed:</b> Speed of the asset.</p>
            </div>
          </div>

          {/* Right: Code Input */}
          <div className="flex-1 p-6 flex flex-col gap-6 bg-[#0d1117]">
            <div className="flex-1 flex flex-col max-h-[50%]">
              <span className="text-[10px] text-slate-500 font-mono mb-2">
                ASSET.DRAW(ctx, asset, drawable)
              </span>
              <div className="flex-1 border border-slate-800 rounded-lg bg-black/40">
                <CodeEditor 
                  value={drawText} 
                  onValueChange={setDrawText} 
                  highlight={code => highlight(code, languages.js)} 
                  padding={10} 
                  style={editorStyles} 
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col  max-h-[50%]">
              <span className="text-[10px] text-slate-500 font-mono mb-2">
                ASSET.UPDATE(asset, dt, speed)
              </span>
              <div className="flex-1 border border-slate-800 rounded-lg bg-black/40">
                <CodeEditor 
                  value={updateText} 
                  onValueChange={setUpdateText} 
                  highlight={code => highlight(code, languages.js)} 
                  padding={10} 
                  style={editorStyles} 
                />
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
    let angle = asset.theta ?? 0
    angle = (asset.cur_theta ?? 0) + angle
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.translate(-cx, -cy)
    ctx.drawImage(drawable, x, y, w, h)`,

  update: `// 'asset' = this object, 'dt' = delta time, 'speed' = speed of car
    // Example: asset.y += Math.sin(dt * 0.005) * 2;`
};