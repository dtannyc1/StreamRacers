import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { KVStoreProvider } from './context/KVStoreContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CarEditor from './pages/CarEditor'
import TwitchCallback from './pages/TwitchCallback'
import Modal from './components/Modal'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  const { token, settling, authError, dismissAuthError } = useAuth()

  // always allow the Twitch callback to render so it can parse the token
  if (window.location.pathname.includes('/auth/twitch/callback')) {
    return (
      <Routes>
        <Route path="/auth/twitch/callback" element={<TwitchCallback />} />
      </Routes>
    )
  }

  if (settling) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  return (
    <>
      {authError && (
        <Modal
          title="Authentication Failed"
          message="Your JWT token appears to be invalid or your account could not be found. Please log in again with a valid token."
          confirmLabel="Back to Login"
          onConfirm={dismissAuthError}
        />
      )}
      <Routes>
        <Route path="/login" element={(token && !settling) ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/racer/new" element={<ProtectedRoute><CarEditor mode="new-user" /></ProtectedRoute>} />
        <Route path="/racer/:username/car/new" element={<ProtectedRoute><CarEditor mode="new-car" /></ProtectedRoute>} />
        <Route path="/racer/:username/car/:carIndex/edit" element={<ProtectedRoute><CarEditor mode="edit" /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter basename="/StreamRacers/">
        <KVStoreProvider>
          <AppRoutes />
        </KVStoreProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App