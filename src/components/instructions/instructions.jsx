import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const Step = ({ number, title, children, image }) => (
  <div className="flex gap-2">
    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
      {number}
    </div>
    <div className="ml-4 flex flex-col gap-3">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{children}</p>
      {image && (
        <div className="rounded-lg border border-gray-700 overflow-hidden bg-gray-800">
          <img src={image} alt={title} className="w-full object-cover" />
        </div>
      )}
    </div>
  </div>
)

const Instructions = () => {
  const [copied, setCopied] = useState(false)

  const currentOrigin = window.location.origin;
  const scriptTag = `<script type="module" src="${currentOrigin}/StreamRacers/Game.js"></script>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      // Reset the "Copied" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="mx-auto w-full px-4 py-2 flex flex-col gap-4">

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-white">Setup Guide</h3>
        <p className="text-gray-400">
        Follow these steps to add StreamRacers as an overlay on your Twitch stream.
        The whole process takes about 5 minutes.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Prerequisites</h3>
        <div className="flex flex-col gap-2 rounded-lg bg-gray-800 border border-gray-700 p-4">
        {[
          'A Twitch account',
          'A StreamElements account linked to your Twitch',
          'OBS or a similar streaming application',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
          <span className="text-purple-400 text-sm">✓</span>
          <span className="text-sm text-gray-300">{item}</span>
          </div>
        ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 -mb-4">Steps</h3>

        <Step number={1} title="Log in to StreamElements">
          Go to{' '}
          <a href="https://streamelements.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300">
              streamelements.com
          </a>{' '}
          and log in with your Twitch account if you haven't already.
        </Step>

        <Step number={2} title="Go to Overlays">
          On the left sidebar, click <span className="text-white font-medium">Streaming Tools</span>, then click <span className="text-white font-medium">Overlays</span>.
          {/* image placeholder */}
        </Step>

        <Step number={3} title="Create a new overlay">
          Click <span className="text-white font-medium">New Overlay</span>. When prompted for a size, choose <span className="text-white font-medium">1920 × 1080</span>.
          {/* image placeholder */}
        </Step>

        <Step number={4} title="Add a Custom Widget">
          Click the <span className="text-white font-medium">+</span> icon at the bottom of the editor, then choose{' '}
          <span className="text-white font-medium">Static / Custom</span> →{' '}
          <span className="text-white font-medium">Custom Widget</span>.
          {/* image placeholder */}
        </Step>

        <Step number={5} title="Open the widget editor">
          Click <span className="text-white font-medium">Open Editor</span> on the widget that appears.
          {/* image placeholder */}
        </Step>

        <Step number={6} title="Paste the script tag">
          In the <span className="text-white font-medium">HTML</span> tab, delete any existing content and paste in the following:
          <div className="mt-2" onClick={handleCopy}>
            <code className={`relative block bg-gray-950 border cursor-pointer ${copied ? 'border-green-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-sm text-purple-300 font-mono break-all`}>
              {scriptTag}
              {copied && (
                <span className="-top-6 right-0 absolute text-green-600 text-sm">
                  Copied!
                </span>
              )}
            </code>
            
          </div>
        </Step>

        <Step number={7} title="Clear the other tabs">
          Click the <span className="text-white font-medium">JS</span> tab and delete everything. Do the same for the <span className="text-white font-medium">Fields</span> and <span className="text-white font-medium">Data</span> tabs.
          {/* image placeholder */}
        </Step>

        <Step number={8} title="Save and get your browser source link">
          Click <span className="text-white font-medium">Done</span>, then <span className="text-white font-medium">Save</span> the overlay. The browser source URL will be shown at the top of the overlay screen — copy it and add it as a Browser Source in OBS.
          {/* image placeholder */}
        </Step>
      </div>

      <div className="rounded-lg bg-purple-900/30 border border-purple-700 p-5 flex flex-col gap-3 mt-4">
        <p className="text-md font-semibold text-grey-200">You're all set!</p>
        <p className="text-sm text-gray-400">
          Once the browser source is added in OBS, use the dashboard to set up and update your racers and tracks. 
          Remember to refresh the browser source after making changes in the dashboard to see them reflected on stream.
        </p>

        <p className="text-sm text-gray-400">
          Pro tip 1: Set your browser source to <span className="text-gray-200 font-medium">Refresh browser when scene becomes active</span> in OBS. 
          This way, you won't have to manually refresh every time you make a change in the dashboard.
          Just hiding the source and unhiding it will trigger a refresh!
          Map this to a streamdeck button for even easier access.
        </p>

        <p className="text-sm text-gray-400">
          Pro tip 2: If you want to test changes without going live, you can open the browser source URL in a regular web browser. 
          You'll still need to join and start your race from your own stream chat. 
          Test mode is available within the Settings tab if you want to see users racing without needing them to actually join in your chat.
        </p>
      </div>
    </div>
  )
}

export default Instructions