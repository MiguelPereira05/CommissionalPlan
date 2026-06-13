import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import Disclamer from './components/Disclamer.jsx'
import CommitionCard from './components/CommitionCard.jsx'
import Navbar from './components/Navbar.jsx'
import { useAuth } from './auth/AuthProvider'
import { supabase } from './auth/supabaseClient'

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

const getCardById = (cards, cardId) => cards.find((entry) => entry.id === cardId)

const getActiveRateForCard = (card, cards, monthKey) => {
  const card15 = getCardById(cards, 15)
  const card16 = getCardById(cards, 16)
  const card17 = getCardById(cards, 17)

  const card15MonthlyFiles = card15 ? getFilesInMonth(card15.commissions, monthKey) : 0
  const card16MonthlyFiles = card16 ? getFilesInMonth(card16.commissions, monthKey) : 0
  const card17MonthlyFiles = card17 ? getFilesInMonth(card17.commissions, monthKey) : 0

  const ratio16Over15 = card15MonthlyFiles === 0 ? 0 : card16MonthlyFiles / card15MonthlyFiles
  const ratio17Over15 = card15MonthlyFiles === 0 ? 0 : card17MonthlyFiles / card15MonthlyFiles

  if (card.id === 15) {
    if (ratio17Over15 >= 0.2) {
      return 1
    }

    return ratio16Over15 >= 1 ? 0.5 : 0.25
  }

  if (card.id === 16) {
    return ratio16Over15 >= 1 ? 0.4 : 0.2
  }

  if (card.id === 17) {
    return ratio17Over15 >= 0.2 ? 5 : 3
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
    title: 'Angariações 4P',
    defaultRatePerFile: 10,
    rateRules: [
      {minFiles: 5, maxFiles: 8, rate: 20},
      {minFiles: 9, maxFiles: 12, rate: 25},
      {minFiles: 13, maxFiles: Infinity, rate: 30},
    ],
    commissions: {},
  },
    {
    id: 5,
    title: 'Renovações 4P (contratos nos ultimos 60 dias)',
    defaultRatePerFile: 5,
    rateRules: [],
    commissions: {},
  },

  {
    id: 6,
    title: 'Renovações 4P (contratos com +60 dias para termino)',
    defaultRatePerFile: 1.0,
    rateRules: [],
    commissions: {},
  },

  {
    id: 7,
    title: 'Angariações Movel Pós-Pagas',
    defaultRatePerFile: 2.5,
    rateRules: [],
    commissions: {},
  },

    {
    id: 8,
    title: 'Renovações Movel Pós-Pagas (contratos nos ultimos 60 dias)',
    defaultRatePerFile: 1,
    rateRules: [],
    commissions: {},
  },

  {
    id: 9,
    title: 'Renovações Movel Pós-Pagas (contratos com +60 dias para termino)',
    defaultRatePerFile: 0.25,
    rateRules: [],
    commissions: {},
  },

  {
    id: 10,
    title: 'Angariações Movel Pré-Pagas',
    defaultRatePerFile: 0.25,
    rateRules: [],
    commissions: {},
  },

  {
    id: 11,
    title: 'Portabilidade Movel Pós-Pagas (numero principal)',
    defaultRatePerFile: 1,
    rateRules: [],
    commissions: {},
  },

  {
    id: 12,
    title: 'Portabilidade Movel Pós-Pagas (numero adicional)',
    defaultRatePerFile: 0.5,
    rateRules: [],
    commissions: {},
  },

  {
    id: 13,
    title: 'Portabilidade Movel Pré-Pagas',
    defaultRatePerFile: 0.5,
    rateRules: [],
    commissions: {},
  },

  {
    id: 14,
    title: 'RED ALL IN',
    defaultRatePerFile: 5,
    rateRules: [],
    commissions: {},
  },

  {
    id: 15,
    title: 'Telemoveis',
    defaultRatePerFile: 0.25,
    rateRules: [],
    commissions: {},
  },

  {
    id: 16,
    title: 'Acessorios',
    defaultRatePerFile: 0.2,
    rateRules: [],
    commissions: {},
  },

  {
    id: 17,
    title: 'Seguro Telemovel',
    defaultRatePerFile: 3,
    rateRules: [],
    commissions: {},
  },

  {
    id: 18,
    title: 'Plano Saude (titular)',
    defaultRatePerFile: 6,
    rateRules: [],
    commissions: {},
  },

  {
    id: 19,
    title: 'Plano Saude (adicional)',
    defaultRatePerFile: 4,
    rateRules: [],
    commissions: {},
  },

  {
    id: 20,
    title: 'Plano Saude (familiar)',
    defaultRatePerFile: 8,
    rateRules: [],
    commissions: {},
  },

  {
    id: 21,
    title: 'Energia (Eletricidade)',
    defaultRatePerFile: 5,
    rateRules: [],
    commissions: {},
  },

  {
    id: 22,
    title: 'Energia (Dual)',
    defaultRatePerFile: 10,
    rateRules: [],
    commissions: {},
  },

  {
    id: 23,
    title: 'Energia (Serviço assistencia tecnica)',
    defaultRatePerFile: 0.5,
    rateRules: [],
    commissions: {},
  },
]

const cloneInitialCards = () =>
  initialCards.map((card) => ({
    ...card,
    commissions: { ...card.commissions },
  }))

const mergeCardsWithStoredCommissions = (storedCards) => {
  const storedCommissionsByCardId = new Map(
    (storedCards || []).map((card) => [card.id, card.commissions || {}]),
  )

  return cloneInitialCards().map((card) => ({
    ...card,
    commissions: storedCommissionsByCardId.get(card.id) || {},
  }))
}

function App() {
  const { user, isAuthenticated } = useAuth()
  const [cards, setCards] = useState(cloneInitialCards)
  const [selectedDate, setSelectedDate] = useState(today)
  const [isCardsLoaded, setIsCardsLoaded] = useState(false)
  const saveTimeoutRef = useRef(null)
  const displayedSelectedDate = formatDateForDisplay(selectedDate)
  const selectedMonthKey = selectedDate.slice(0, 7)
  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${selectedMonthKey}-01T00:00:00`))
  const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  })
  const userId = useMemo(() => user?.id || null, [user])

  const totalMonthlyCommission = cards.reduce((total, card) => {
    const filesInSelectedMonth = getFilesInMonth(card.commissions, selectedMonthKey)
    const activeRatePerFile = getActiveRateForCard(card, cards, selectedMonthKey)

    return total + filesInSelectedMonth * activeRatePerFile
  }, 0)

  const updateSubmittedFiles = (cardId, direction) => {
    if (!isAuthenticated) {
      return
    }

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

  useEffect(() => {
    const loadCardsFromDatabase = async () => {
      if (!userId) {
        setCards(cloneInitialCards())
        setIsCardsLoaded(false)
        return
      }

      const { data, error } = await supabase
        .from('user_commissions')
        .select('cards')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Could not load commissions from Supabase:', error.message)
        setCards(cloneInitialCards())
        setIsCardsLoaded(true)
        return
      }

      if (!data?.cards) {
        setCards(cloneInitialCards())
        setIsCardsLoaded(true)
        return
      }

      setCards(mergeCardsWithStoredCommissions(data.cards))
      setIsCardsLoaded(true)
    }

    loadCardsFromDatabase()
  }, [userId])

  useEffect(() => {
    if (!userId || !isCardsLoaded) {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const cardsForStorage = cards.map((card) => ({
        id: card.id,
        commissions: card.commissions,
      }))

      const { error } = await supabase.from('user_commissions').upsert(
        {
          user_id: userId,
          cards: cardsForStorage,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      )

      if (error) {
        console.error('Could not save commissions to Supabase:', error.message)
      }
    }, 400)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [cards, userId, isCardsLoaded])

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
            {!isAuthenticated && (
              <p className="text-sm text-amber-700 mt-2">
                You are viewing in read-only mode. Log in to edit commissions.
              </p>
            )}
            <div className="mt-4 max-w-xs">
              <label htmlFor="global-commission-date" className="text-sm text-gray-600 block mb-2">
                Selected date for all commissions
              </label>
              <input
                id="global-commission-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                disabled={!isAuthenticated}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <p className="mt-2 text-sm text-gray-500">Displayed format: {displayedSelectedDate}</p>
            </div>
          </div>

          <article className="mb-8 rounded-2xl bg-white shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Commission ({monthLabel})</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              {currencyFormatter.format(totalMonthlyCommission)}
            </p>
          </article>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CommitionCard
                key={card.id}
                title={card.title}
                activeRatePerFile={getActiveRateForCard(card, cards, selectedMonthKey)}
                selectedDate={selectedDate}
                commissions={card.commissions}
                canEdit={isAuthenticated}
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
