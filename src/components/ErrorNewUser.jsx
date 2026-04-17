import { useKVStore } from "../context/KVStoreContext"

const ErrorNewUser = ({error}) => {
  const { hardResetKVStore } = useKVStore()

  return (
    <div className="flex flex-col justify-center gap-4">
      <p className="text-lg text-red-400 text-center">
				Failed to find any data in your account! Are you new here?
			</p>
			
			<div className="flex gap-2 justify-center">
				<button
					className="text-sm text-white h-fit cursor-pointer hover:text-green-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
					onClick={async () => await hardResetKVStore()}
				>
					Create New Account
				</button>
				<button
					className="text-sm text-white h-fit cursor-pointer hover:text-green-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
					onClick={() => window.location.reload()}
				>
					⟳ Refresh
				</button>
			</div>
    </div>
  )
}

export default ErrorNewUser