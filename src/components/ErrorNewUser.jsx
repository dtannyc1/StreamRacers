import { useState } from "react"
import { useKVStore } from "../context/KVStoreContext"

const ErrorNewUser = ({error}) => {
  const { hardResetKVStore } = useKVStore()
	const [ showModal, setShowModal ] = useState()

  return (
    <div className="flex flex-col justify-center gap-4">
      <p className="text-md text-white-400 text-center">
				Failed to find any data in your account! Are you new here?
			</p>
			
			<div className="flex gap-2 justify-center">
				<button
					className="text-sm text-white h-fit cursor-pointer hover:text-green-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
					onClick={() => setShowModal(true)}
				>
					Setup My Account
				</button>
				<button
					className="text-sm text-white h-fit cursor-pointer hover:text-green-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
					onClick={() => window.location.reload()}
				>
					⟳ Refresh
				</button>
			</div>
			{ showModal && 
				<ConfirmationModal 
					onConfirm={async () => {
						await hardResetKVStore()
						setShowModal(false)
					}}
					onClose={() => setShowModal(false)}
				/>
			}
    </div>
  )
}

const ConfirmationModal = ({ onConfirm, onClose }) => {
	const [ confirmed, setConfirmed ] = useState(false)

	return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={(e) => {e.preventDefault(); e.stopPropagation(); onClose()}}
		>
      <div 
				className="w-full max-w-md rounded-xl bg-gray-800 border border-gray-700 p-6 flex flex-col gap-2 shadow-xl"
				onClick={(e) => {e.preventDefault(); e.stopPropagation(); }}
			>
					<h2 className="text-lg font-semibold text-white">Confirm Setup</h2>
					<form onSubmit={onConfirm} className="flex flex-col gap-2">
						<label className="text-sm font-medium text-gray-300">If you have any existing data related to StreamRacers, this may delete that data.</label>

						<div className="flex justify-end gap-4">
							<button
								type="submit"
								disabled={confirmed}
								className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
								onClick={(e) => {
									setConfirmed(true)
									onConfirm()
								}}
							>
								{confirmed ? 'Setting up...' : 'Continue'}
							</button>
							<button
								type="button"
								disabled={confirmed}
								onClick={onClose}
								className="text-sm text-white h-fit cursor-pointer hover:text-red-400 hover:bg-gray-700 transition-colors rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
						</div>
					</form>
      </div>
    </div>
  )
}

export default ErrorNewUser