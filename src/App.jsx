import './App.css'
import { useState } from 'react'
import Disclamer from './components/Disclamer.jsx'
import CommitionCard from './components/CommitionCard.jsx'
import Navbar from './components/Navbar.jsx'

const today = new Date().toISOString().split('T')[0]

const initialCards = [
  {
    id: 1,
    title: 'Commission Card #1',
    defaultRatePerFile: 15,
    rateRulesByMonth: {
      '2026-06': [
        { minFiles: 0, maxFiles: 5, rate: 10 },
        { minFiles: 6, maxFiles: 9, rate: 15 },
      ],
    },
    selectedDate: today,
    commissions: {},
  },
  {
    id: 2,
    title: 'Commission Card #2',
    defaultRatePerFile: 18,
    rateRulesByMonth: {},
    selectedDate: today,
    commissions: {},
  },
  {
    id: 3,
    title: 'Commission Card #3',
    defaultRatePerFile: 25,
    rateRulesByMonth: {},
    selectedDate: today,
    commissions: {},
  },
]

function App() {
  const [cards, setCards] = useState(initialCards)

  const updateSelectedDate = (cardId, date) => {
    setCards((previousCards) =>
      previousCards.map((card) => {
        if (card.id !== cardId) {
          return card
        }

        return {
          ...card,
          selectedDate: date,
        }
      }),
    )
  }

  const updateSubmittedFiles = (cardId, direction) => {
    setCards((previousCards) =>
      previousCards.map((card) => {
        if (card.id !== cardId) {
          return card
        }

        const currentFilesForDate = card.commissions[card.selectedDate] || 0
        const nextFilesSubmitted =
          direction === 'increment' ? currentFilesForDate + 1 : Math.max(0, currentFilesForDate - 1)

        const nextCommissions = {
          ...card.commissions,
        }

        if (nextFilesSubmitted === 0) {
          delete nextCommissions[card.selectedDate]
        } else {
          nextCommissions[card.selectedDate] = nextFilesSubmitted
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
              Pick a date on each card and track submitted files for that day. Payout is calculated
              automatically using each card rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CommitionCard
                key={card.id}
                title={card.title}
                defaultRatePerFile={card.defaultRatePerFile}
                rateRulesByMonth={card.rateRulesByMonth}
                selectedDate={card.selectedDate}
                commissions={card.commissions}
                onDateChange={(date) => updateSelectedDate(card.id, date)}
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
