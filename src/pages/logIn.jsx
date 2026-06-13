import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../auth/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function LogIn() {
	const { isAuthenticated, isLoading } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorMessage('')
		setIsSubmitting(true)

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			setErrorMessage(error.message)
		}

		setIsSubmitting(false)
	}

	if (!isLoading && isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return (
		<main className="min-h-screen grid place-items-center bg-gray-100 p-6">
			<section className="w-full max-w-md rounded-2xl bg-white shadow-md border border-gray-100 p-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Log In</h1>
				<p className="text-gray-600 mb-6">Sign in with your account to continue.</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="login-email" className="text-sm text-gray-600 block mb-2">Email</label>
						<input
							id="login-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
						/>
					</div>

					<div>
						<label htmlFor="login-password" className="text-sm text-gray-600 block mb-2">Password</label>
						<input
							id="login-password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
						/>
					</div>

					{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition disabled:opacity-60"
					>
						{isSubmitting ? 'Signing in...' : 'Log In'}
					</button>
				</form>

				<p className="text-sm text-gray-600 mt-4 text-center">
					No account yet?{' '}
					<Link to="/signup" className="text-blue-700 font-semibold hover:underline">
						Create one
					</Link>
				</p>
			</section>
		</main>
	)
}
