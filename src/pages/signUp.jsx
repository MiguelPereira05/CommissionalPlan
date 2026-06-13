import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../auth/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function SignUp() {
	const { isAuthenticated, isLoading } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorMessage('')
		setSuccessMessage('')
		setIsSubmitting(true)

		const { error } = await supabase.auth.signUp({
			email,
			password,
		})

		if (error) {
			setErrorMessage(error.message)
			setIsSubmitting(false)
			return
		}

		setSuccessMessage('Account created. Check your email to confirm the account if required.')
		setIsSubmitting(false)
	}

	if (!isLoading && isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return (
		<main className="min-h-screen grid place-items-center bg-gray-100 p-6">
			<section className="w-full max-w-md rounded-2xl bg-white shadow-md border border-gray-100 p-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
				<p className="text-gray-600 mb-6">Sign up with email and password.</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="signup-email" className="text-sm text-gray-600 block mb-2">Email</label>
						<input
							id="signup-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
						/>
					</div>

					<div>
						<label htmlFor="signup-password" className="text-sm text-gray-600 block mb-2">Password</label>
						<input
							id="signup-password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							minLength={6}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
						/>
					</div>

					{errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
					{successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-green-600 text-white font-semibold py-3 hover:bg-green-700 transition disabled:opacity-60"
					>
						{isSubmitting ? 'Creating account...' : 'Create Account'}
					</button>
				</form>

				<p className="text-sm text-gray-600 mt-4 text-center">
					Already have an account?{' '}
					<Link to="/login" className="text-blue-700 font-semibold hover:underline">
						Go to login
					</Link>
				</p>
			</section>
		</main>
	)
}
