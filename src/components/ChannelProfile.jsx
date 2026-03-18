const ChannelProfile = ({ channel, onClear }) => {
  const { username, avatar, displayName } = channel;

  return (
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
      <button
        onClick={onClear}
        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
      >
        Logout
      </button>
    </div>
  )
}

export default ChannelProfile;