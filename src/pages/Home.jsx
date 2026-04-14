import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BuyMeACoffee from '../components/BuyMeACoffee'

const Home = () => {
  const { token } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">

        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-purple-400">StreamRacers</h1>
          <div className="flex items-center gap-4">
            <BuyMeACoffee py={2} px={4} />
            <button
              onClick={() => navigate(token ? '/dashboard' : '/login')}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              {token ? 'Dashboard' : 'Login'}
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex flex-col items-center justify-center flex-1 gap-12 px-8 py-4 max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-5xl font-bold text-white">
              Race your chat.{' '}
              <span className="text-purple-400">Live.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl">
              StreamRacers is a Twitch overlay game using StreamElements that allows viewers to race to the finish line. 
              What do the winners get? Bragging rights and the glory of being the fastest in chat.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl">
              Your style. Your artwork. 
              Customize cars and tracks to create a unique experience for your community.
              Your data is hosted on your StreamElements account and is never shared with any other third parties. 
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => navigate(token ? '/dashboard' : '/login')}
                className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                {token ? 'Go to Dashboard' : 'Get Started'}
              </button>
            </div>
          </div>

          {/* Demo placeholder */}
          <div className="w-full rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-500">StreamRacers Demo</span>
            </div>
            {/* swap this div for a <video> or <img> once you have the asset */}
            <div className="aspect-video flex items-center justify-center bg-gray-950">
              <p className="text-sm text-gray-600">Demo coming soon</p>
            </div>
          </div>

          {/* Feature highlights */}
          {/* <div className="grid grid-cols-2 gap-6 w-full">
            {[
              {
                icon: '🏎️',
                title: 'Custom Cars',
                desc: 'Upload images and build fully custom cars for your viewers.',
              },
              {
                icon: '🛣️',
                title: 'Custom Tracks',
                desc: 'Design your own track for your viewers to race on.',
              },
              {
                icon: '⚡',
                title: 'Boost Words',
                desc: 'Viewers guess a hidden word to boost their racer mid-race.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 rounded-xl bg-gray-800 border border-gray-700 p-5">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div> */}
        </div>

        
      </div>

    </div>
  )
}

export default Home