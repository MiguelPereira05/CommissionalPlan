export default function CommitionCard({
	title,
	activeRatePerFile,
	selectedDate,
	commissions,
	onIncrement,
	onDecrement,
}) {
	const filesSubmitted = commissions[selectedDate] || 0
	const selectedMonthKey = selectedDate.slice(0, 7)

	const filesInSelectedMonth = Object.entries(commissions).reduce((total, [date, files]) => {
		return date.startsWith(selectedMonthKey) ? total + files : total
	}, 0)

	const payout = filesSubmitted * activeRatePerFile
	const currencyFormatter = new Intl.NumberFormat('en-IE', {
		style: 'currency',
		currency: 'EUR',
	})

	const monthLabel = new Intl.DateTimeFormat('en-GB', {
		month: 'long',
		year: 'numeric',
	}).format(new Date(`${selectedMonthKey}-01T00:00:00`))

	const monthlyPayout = filesInSelectedMonth * activeRatePerFile

	return (
		<article className="rounded-2xl bg-white shadow-md p-6 border border-gray-100 w-full max-w-sm">
			<header className="mb-5">
				<h3 className="text-xl font-semibold text-gray-900">{title}</h3>
				<p className="text-sm text-gray-500">{monthLabel}</p>
			</header>

			<div className="space-y-3 mb-6">
				<div>
					<p className="text-sm text-gray-500">Submitted files</p>
					<p className="text-3xl font-bold text-gray-900">{filesSubmitted}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Rate per file</p>
					<p className="text-lg font-semibold text-gray-700">{currencyFormatter.format(activeRatePerFile)}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Total payout</p>
					<p className="text-4xl font-bold text-gray-800">{currencyFormatter.format(payout)}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Month total ({monthLabel})</p>
					<p className="text-lg font-semibold text-gray-700">
						{filesInSelectedMonth} files · {currencyFormatter.format(monthlyPayout)}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onDecrement}
					className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition"
				>
					- 1 file
				</button>

				<button
					type="button"
					onClick={onIncrement}
					className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium hover:bg-green-200 transition"
				>
					+ 1 file
				</button>
			</div>
		</article>
	)
}
