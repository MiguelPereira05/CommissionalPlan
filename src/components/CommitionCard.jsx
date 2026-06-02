export default function CommitionCard({
	title,
	defaultRatePerFile,
	rateRulesByMonth,
	selectedDate,
	commissions,
	onDateChange,
	onIncrement,
	onDecrement,
}) {
	const filesSubmitted = commissions[selectedDate] || 0
	const selectedMonthKey = selectedDate.slice(0, 7)

	const filesInSelectedMonth = Object.entries(commissions).reduce((total, [date, files]) => {
		return date.startsWith(selectedMonthKey) ? total + files : total
	}, 0)

	const monthRules = rateRulesByMonth?.[selectedMonthKey] || []
	const matchedRule = monthRules.find(
		(rule) => filesInSelectedMonth >= rule.minFiles && filesInSelectedMonth <= rule.maxFiles,
	)
	const activeRatePerFile = matchedRule ? matchedRule.rate : defaultRatePerFile
	const payout = filesSubmitted * activeRatePerFile

	const monthLabel = new Intl.DateTimeFormat('en-US', {
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

			<div className="mb-5">
				<label htmlFor={`commission-date-${title}`} className="text-sm text-gray-500 block mb-2">
					Select day
				</label>
				<input
					id={`commission-date-${title}`}
					type="date"
					value={selectedDate}
					onChange={(event) => onDateChange(event.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
			</div>

			<div className="space-y-3 mb-6">
				<div>
					<p className="text-sm text-gray-500">Submitted files</p>
					<p className="text-3xl font-bold text-gray-900">{filesSubmitted}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Rate per file</p>
					<p className="text-lg font-semibold text-gray-700">${activeRatePerFile.toFixed(2)}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Total payout</p>
					<p className="text-4xl font-bold text-gray-800">${payout.toFixed(2)}</p>
				</div>

				<div>
					<p className="text-sm text-gray-500">Month total ({monthLabel})</p>
					<p className="text-lg font-semibold text-gray-700">
						{filesInSelectedMonth} files · ${monthlyPayout.toFixed(2)}
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
