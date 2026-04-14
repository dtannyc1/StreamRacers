import { useAuth } from '../context/AuthContext'
import TokenInput from '../components/TokenInput'

const Step = ({ number, children }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
      {number}
    </div>
    <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
  </div>
)

const Login = () => {
  const { saveToken, loading, error } = useAuth()

  const handleSave = (token) => {
    saveToken(token)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center xl:p-8 sm:p-4 p-2">
      <div className="w-full max-w-lg flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold text-purple-400">StreamRacers Vehicle and Track Editor</h1>
          <p className="text-gray-400 mt-2">Connect your StreamElements account to get started.</p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg bg-gray-800 border border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            How to find your JWT token
          </h2>
          <div className="flex flex-col gap-4">
            <Step number={1}>
              Go to <span className="text-purple-400 font-medium">streamelements.com</span> and log in to your account.
            </Step>
            <Step number={2}>
              Click your avatar in the top right corner, click on your username, and open <span className="text-purple-400 font-medium">Channel Settings</span>.
            </Step>
            <Step number={3}>
              Find the <span className="text-purple-400 font-medium">Your Channels</span> section and click the copy icon next to your <span className="text-purple-400 font-medium">JWT token</span>.
            </Step>
            <Step number={4}>
              Paste it below.
            </Step>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <TokenInput onSave={handleSave} />
          {loading && <p className="text-sm text-gray-400">Verifying token...</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

      </div>
    </div>
  )
}

export default Login