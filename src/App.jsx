import './App.css'
import { useState } from 'react'
import Disclamer from './components/Disclamer.jsx'
import CommitionCard from './components/CommitionCard.jsx'
import Navbar from './components/Navbar.jsx'

const today = new Date().toISOString().split('T')[0]

const formatDateForDisplay = (isoDate) => {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const getFilesInMonth = (commissions, monthKey) => {
  return Object.entries(commissions).reduce((total, [date, files]) => {
    return date.startsWith(monthKey) ? total + files : total
  }, 0)
}

const getRateFromRules = (filesInMonth, rules, fallbackRate) => {
  const matchedRule = rules.find((rule) => filesInMonth >= rule.minFiles && filesInMonth <= rule.maxFiles)
  return matchedRule ? matchedRule.rate : fallbackRate
}

const getActiveRateForCard = (card, cards, monthKey) => {
  if (card.id === 4) {
    const cardTwo = cards.find((entry) => entry.id === 4)
    const cardThree = cards.find((entry) => entry.id === 5)
    const cardTwoMonthlyFiles = cardTwo ? getFilesInMonth(cardTwo.commissions, monthKey) : 0
    const cardThreeMonthlyFiles = cardThree ? getFilesInMonth(cardThree.commissions, monthKey) : 0
    const ratio = cardTwoMonthlyFiles === 0 ? 0 : cardThreeMonthlyFiles / cardTwoMonthlyFiles

    return ratio < 0.5 ? 0.25 : 1
  }

  const filesInSelectedMonth = getFilesInMonth(card.commissions, monthKey)
  const monthRules = card.rateRules || []

  return getRateFromRules(filesInSelectedMonth, monthRules, card.defaultRatePerFile)
}

const initialCards = [
  {
    id: 1,
    title: 'Angariações 2P/3P/YORN',
    defaultRatePerFile: 2,
    rateRules: [
      { minFiles: 0, maxFiles: 4, rate: 2 },
      { minFiles: 5, maxFiles: 8, rate: 4 },
      { minFiles: 9, maxFiles: 12, rate: 5 },
      { minFiles: 13, maxFiles: Infinity, rate: 7 },
    ],
    commissions: {},
  },
  {
    id: 2,
    title: 'Renovações 2P/3P/YORN (contratos nos ultimos 60 dias)',
    defaultRatePerFile: 2,
    rateRules: [
      { minFiles: 0, maxFiles: Infinity, rate: 2 },
    ],
    commissions: {},
  },
  {
    id: 3,
    title: 'Renovações 2P/3P/YORN (contratos com +60 dias para termino)',
    defaultRatePerFile: 0.5,
    rateRules: [],
    commissions: {},
  },
  {
    id: 4,
    title: 'Commission Card #4',
    defaultRatePerFile: 0.25,
    rateRules: [],
    commissions: {},
  },
    {
    id: 5,
    title: 'Commission Card #5',
    defaultRatePerFile: 5,
    rateRules: [],
    commissions: {},
  },
]

function App() {
  const [cards, setCards] = useState(initialCards)
  const [selectedDate, setSelectedDate] = useState(today)
  const displayedSelectedDate = formatDateForDisplay(selectedDate)
  const selectedMonthKey = selectedDate.slice(0, 7)

  const updateSubmittedFiles = (cardId, direction) => {
    setCards((previousCards) =>
      previousCards.map((card) => {
        if (card.id !== cardId) {
          return card
        }

        const currentFilesForDate = card.commissions[selectedDate] || 0
        const nextFilesSubmitted =
          direction === 'increment' ? currentFilesForDate + 1 : Math.max(0, currentFilesForDate - 1)

        const nextCommissions = {
          ...card.commissions,
        }

        if (nextFilesSubmitted === 0) {
          delete nextCommissions[selectedDate]
        } else {
          nextCommissions[selectedDate] = nextFilesSubmitted
        }

        return {
          ...card,
          commissions: nextCommissions,
        }
      }),
    )
  }

  return (
    <>
      <Navbar />
      <main className="app-shell min-h-screen bg-gray-100 p-6 md:p-10">
        <section className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Monthly Commission Organizer</h2>
            <p className="text-gray-600 mt-2">
              Pick one date for all cards and track submitted files for that day. Payout is calculated
              automatically using each card rate.
            </p>
            <div className="mt-4 max-w-xs">
              <label htmlFor="global-commission-date" className="text-sm text-gray-600 block mb-2">
                Selected date for all commissions
              </label>
              <input
                id="global-commission-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <p className="mt-2 text-sm text-gray-500">Displayed format: {displayedSelectedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CommitionCard
                key={card.id}
                title={card.title}
                activeRatePerFile={getActiveRateForCard(card, cards, selectedMonthKey)}
                selectedDate={selectedDate}
                commissions={card.commissions}
                onIncrement={() => updateSubmittedFiles(card.id, 'increment')}
                onDecrement={() => updateSubmittedFiles(card.id, 'decrement')}
              />
            ))}
          </div>
        </section>
      </main>
      <Disclamer />
    </>
  )
}

export default App
