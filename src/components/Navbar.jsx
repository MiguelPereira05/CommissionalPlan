import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth()

  return (
    <nav className="navbar bg-red-600 text-white p-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold">Commissional Plan</Link>
      <div className="flex items-center gap-2">
        {!isAuthenticated && (
          <>
            <Link to="/login" className="px-3 py-2 rounded hover:bg-gray-700">LogIn</Link>
            <Link to="/signup" className="px-3 py-2 rounded hover:bg-gray-700">SignUp</Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <span className="hidden md:inline text-lg text-white">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              LogOut
            </button>
          </>
        )}
      </div>

    </nav>
  )
}