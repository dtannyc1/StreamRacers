import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useKVStore } from '../../context/KVStoreContext'

const Step = ({ number, title, children, image, link }) => (
  <div className="flex gap-2">
    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
      {number}
    </div>
    <div className="ml-4 flex flex-col gap-3">
      <h3 className="text-base font-semibold text-white">
        {title}
        {link && (
          <>
            {" from "}
            <a href={link} target="_blank" className="text-purple-400 hover:text-purple-300">StreamElements</a>
          </>
        )}
      </h3>
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
  const { validOverlayId, 
          createOverlay, 
          validLeaderboardOverlayId, 
          createLeaderboardOverlay 
        } = useKVStore()

  const currentOrigin = window.location.origin;
  const scriptTag = `<script type="module" src="${currentOrigin}/Game.js"></script>`

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
        <div className="flex gap-2">
          { !validOverlayId ? 
            <div
              className="grow w-full rounded-lg bg-purple-900/30 border border-purple-700 px-5 py-3 flex flex-col items-center gap-2"
            >
              <p className="text-white-400 text-center">
              Either walk through these steps or press this button to skip to Step 9.
              </p>
              <button
                className="w-fit rounded-lg bg-purple-600 px-4 py-2 mb-1 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                onClick={() => createOverlay()}
              >
                🪄 Create overlay
              </button>
            </div> : 
            <div
              className="grow w-full rounded-lg bg-purple-900/30 border border-purple-700 px-5 py-3 flex flex-col items-center "
            >
              <p className="text-white-400">
              You have an overlay for the game 🥳
              </p>
              <p className="text-white-400 mb-2 text-center">
              Click the button below to go to your editor and continue with Step 9.
              </p>
              <button
                className="w-fit rounded-lg bg-purple-600 px-4 py-2 mb-1 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                onClick={() => {
                  let url = `https://streamelements.com/overlay/${validOverlayId}/editor?er=1`
                  window.open(url, '_blank')
                }}
              >
                Go to Overlay Editor
              </button>
            </div>
          }

          { !validLeaderboardOverlayId ? 
            <div
              className="grow w-full rounded-lg bg-purple-900/30 border border-purple-700 px-5 py-3 flex flex-col items-center gap-2"
            >
              <p className="text-white-400 text-center">
                I haven't written instructions for the Leaderboard overlay but here's a button.
              </p>
              <button
                className="w-fit rounded-lg bg-purple-600 px-4 py-2 mb-1 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                onClick={() => createLeaderboardOverlay()}
              >
                🪄 Create Leaderboard Overlay
              </button>
            </div> : 
            <div
              className="grow w-full rounded-lg bg-purple-900/30 border border-purple-700 px-5 py-3 flex flex-col items-center "
            >
              <p className="text-white-400">
              You have an overlay for the Leaderboard 🥳
              </p>
              <p className="text-white-400 mb-2 text-center">
              Click the button below to go to your editor and continue with Step 9.
              </p>
              <button
                className="w-fit rounded-lg bg-purple-600 px-4 py-2 mb-1 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
                onClick={() => {
                  let url = `https://streamelements.com/overlay/${validLeaderboardOverlayId}/editor?er=1`
                  window.open(url, '_blank')
                }}
              >
                Go to Leaderboard Overlay Editor
              </button>
            </div>
          }
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
          Click <span className="text-white font-medium">New Overlay</span>. When prompted for a resolution, choose <span className="text-white font-medium">1080p</span>, then press <span className="text-white font-medium">Start</span>.
          {/* image placeholder */}
        </Step>

        <Step number={4} title="Add a Custom Widget">
          Click the <span className="text-white font-medium">+</span> icon at the bottom of the editor, then choose{' '}
          <span className="text-white font-medium">Static / Custom</span> →{' '}
          <span className="text-white font-medium">Custom Widget</span>.
          {/* image placeholder */}
        </Step>

        <Step number={5} title="Open the widget editor">
          Click <span className="text-white font-medium">Open Editor</span> on the menu on the left.
          {/* image placeholder */}
        </Step>

        <Step number={6} title="Copy and paste the script tag">
          In the <span className="text-white font-medium">HTML</span> tab, <span className="text-white font-medium">delete any existing content</span> and <span className="text-white font-medium">paste</span> in the following:
          <span onClick={handleCopy}>
            <code className={`relative mt-2 block bg-gray-950 border cursor-pointer ${copied ? 'border-green-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-sm text-purple-300 font-mono break-all`}>
              {scriptTag}
              {copied && (
                <span className="-top-6 right-0 absolute text-green-600 text-sm">
                  Copied!
                </span>
              )}
            </code>
            
          </span>
        </Step>

        <Step number={7} title="Clear the other tabs">
          Click the <span className="text-white font-medium">CSS</span> tab and <span className="text-white font-medium">delete everything</span>. 
          Do the same for the <span className="text-white font-medium">JS</span> and <span className="text-white font-medium">Fields</span> tabs.
          Leave the Data tab as it is.
          Press <span className="text-white font-medium">Done</span>.
          {/* image placeholder */}
        </Step>

        <Step number={8} title="Resize the widget and Save">
          Go to <span className="text-white font-medium">Position, size and style</span> for the widget and make the overlay <span className="text-white font-medium">1920 x 1080px</span>.
          Press <span className="text-white font-medium"> Save</span> on the top right. 
          {/* image placeholder */}
        </Step>

        <Step number={9} 
          title={`Get your browser source link`}
          link={validOverlayId ? `https://streamelements.com/overlay/${validOverlayId}/editor?er=1` : ''}
        >
          <span className="text-white font-medium">Copy</span> the overlay URL by clicking the <span className="text-white font-medium">🔗</span> icon at top of the overlay screen.  
          {/* image placeholder */}
        </Step>

        <Step number={10} title="Add the browser source link to OBS">
          Add the link as a <span className="text-white font-medium">Browser Source</span> in OBS.
          Ensure that the browser source is also <span className="text-white font-medium">1920 x 1080px</span>.
          {/* image placeholder */}
        </Step>
      </div>

      <div className="rounded-lg bg-purple-900/30 border border-purple-700 p-5 flex flex-col gap-3 mt-4">
        <p className="text-md font-semibold text-grey-200">You're all set!</p>
        <p className="text-sm text-gray-400">
          Once the browser source is added in OBS, use the dashboard on this website to set up and update your racers and tracks. 
          Remember to refresh the browser source after making changes in the dashboard to see them reflected on stream.
        </p>

        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-medium">Note:</span> All streamers start off with Test mode enabled! Go into your Settings to turn off the test racers when you're ready.
        </p>

        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-medium">Pro tip 1:</span> Set your browser source to <span className="text-gray-200 font-medium">Refresh browser when scene becomes active</span> in OBS. 
          This way, you won't have to manually refresh every time you make a change in the dashboard.
          Just hiding the source and unhiding it will trigger a refresh!
          Map this to a streamdeck button for even easier access.
        </p>

        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-medium">Pro tip 2:</span> If you want to test changes without going live, you can open the browser source URL in a regular web browser. 
          You'll still need to join and start your race from your own stream chat. 
          Test mode is available within the Settings tab if you want to see users racing without needing them to actually join in your chat.
        </p>
      </div>
    </div>
  )
}

export default Instructions