import { useNavigate } from 'react-router-dom'
import BuyMeACoffee from './BuyMeACoffee';

const ChannelProfile = ({ channel, onClear }) => {
  const { username, avatar, displayName } = channel;
  const navigate = useNavigate()

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onPointerDown={() => navigate('/')}
          className="text-sm text-white h-fit cursor-pointer hover:text-green-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
        >
          ← Home
        </button>
        <div className="flex items-center justify-between rounded-lg bg-gray-800 border border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
              {avatar && (
              <img
                  src={avatar}
                  alt={displayName ?? username}
                  className="w-10 h-10 rounded-full object-cover"
              />
              )}
              <div>
              <p className="text-sm font-medium text-white">{displayName ?? username}</p>
              <p className="text-xs text-gray-400">@{username}</p>
              </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <BuyMeACoffee py={3} px={4}/>
        <button
          onPointerDown={onClear}
          className="text-sm text-white h-fit cursor-pointer hover:text-red-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default ChannelProfile;