import { useState } from 'react'
import RacerList from '../components/racers/RacerList'
import TrackList from '../components/tracks/TrackList'
import SettingsPanel from '../components/settings/SettingsPanel'
import ChannelProfile from '../components/ChannelProfile'
import { useAuth } from '../context/AuthContext'
import { getTwitchAccessToken } from '../lib/twitch'

const tabs = ['Vehicles', 'Tracks', 'Settings']

const Dashboard = () => {
  const { channel, settling, clearToken } = useAuth()
  const [activeTab, setActiveTab] = useState('Vehicles')

  if (settling || !getTwitchAccessToken()) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-gray-400">Loading...</p>
      <button
        onClick={clearToken}
        className="text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Logout
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          {channel
            ? <ChannelProfile channel={channel} onClear={clearToken} />
            : <p className="text-sm text-gray-500">Could not load channel info.</p>
          }
          {!channel && (
            <button
              onClick={clearToken}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        <div className="flex gap-1 border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button> 
          ))}
        </div>

        {activeTab === 'Vehicles' && <RacerList />}
        {activeTab === 'Tracks' && <TrackList />} 
        {activeTab === 'Settings' && <SettingsPanel />}


      </div>
    </div>
  )
}

export default Dashboard