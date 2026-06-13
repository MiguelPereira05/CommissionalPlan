import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-100 p-6">
        <p className="text-gray-700 font-medium">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
