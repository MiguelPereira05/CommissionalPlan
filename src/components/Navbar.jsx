export default function Navbar() {
  return (
    <nav className="navbar bg-gray-800 text-white p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Commissional Plan</h1>
        <div>
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-700">LogIn</a>
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-700">SignUp</a>
        </div>

    </nav>
  )
}