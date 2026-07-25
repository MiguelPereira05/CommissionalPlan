import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import Disclamer from './components/Disclamer.jsx'
import CommitionCard from './components/CommitionCard.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
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

const parseCommissionDateKey = (dateKey) => {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null
  }

  const [yearText, monthText, dayText] = dateKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const parsedDate = new Date(Date.UTC(year, month - 1, day))
  const isValidDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day

  if (!isValidDate) {
    return null
  }

  return {
    year,
    monthIndex: month - 1,
  }
}

const aggregateMonthlyCommissionCents = (cards, year) => {
  const monthlyTotalsCents = new Array(12).fill(0)

  cards.forEach((card) => {
    Object.entries(card.commissions || {}).forEach(([dateKey, filesRaw]) => {
      const parsedDate = parseCommissionDateKey(dateKey)

      if (!parsedDate || parsedDate.year !== year) {
        return
      }

      const files = Number(filesRaw)

      if (!Number.isFinite(files) || files <= 0) {
        return
      }

      const monthKey = `${parsedDate.year}-${String(parsedDate.monthIndex + 1).padStart(2, '0')}`
      const activeRatePerFile = getActiveRateForCard(card, cards, monthKey)

      if (!Number.isFinite(activeRatePerFile)) {
        return
      }

      monthlyTotalsCents[parsedDate.monthIndex] += Math.round(files * activeRatePerFile * 100)
    })
  })

  return {
    monthlyTotalsCents,
    annualTotalCents: monthlyTotalsCents.reduce((sum, monthTotalCents) => sum + monthTotalCents, 0),
  }
}

const monthLabels = Array.from({ length: 12 }, (_, monthIndex) => {
  const label = new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(
    new Date(Date.UTC(2026, monthIndex, 1)),
  )

  return label.charAt(0).toUpperCase() + label.slice(1)
})

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
  const selectedYear = parseCommissionDateKey(selectedDate)?.year || new Date().getFullYear()
  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${selectedMonthKey}-01T00:00:00`))
  const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  })
  const sidebarCurrencyFormatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  })
  const userId = useMemo(() => user?.id || null, [user])
  const { monthlyTotalsCents, annualTotalCents } = useMemo(
    () => aggregateMonthlyCommissionCents(cards, selectedYear),
    [cards, selectedYear],
  )

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
      <main className="app-shell min-h-screen bg-gray-300 p-6 md:p-10">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <aside className="w-full lg:w-80 lg:sticky lg:top-6">
              <article className="rounded-2xl bg-white shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Comissões ganhas ({selectedYear})</h3>
                <p className="text-sm text-gray-500 mt-1">Total ganho por mês com base nos registos guardados.</p>
                <ul className="mt-4 space-y-2">
                  {monthLabels.map((monthName, monthIndex) => (
                    <li
                      key={monthName}
                      className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm text-gray-700"
                    >
                      <span>{monthName}</span>
                      <span className="font-semibold text-gray-900">
                        {sidebarCurrencyFormatter.format(monthlyTotalsCents[monthIndex] / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total anual</span>
                  <span className="text-lg font-bold text-gray-900">
                    {sidebarCurrencyFormatter.format(annualTotalCents / 100)}
                  </span>
                </div>
              </article>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Organizador de Comissões Mensal</h2>
                <p className="text-gray-600 mt-2">
                  Selecione uma data para todos os cartões e acompanhe os arquivos enviados nesse dia. O pagamento é calculado automaticamente usando a taxa de cada cartão.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-amber-700 mt-2">
                    Você está em modo de visualização no modo somente leitura. Faça login para editar as comissões.
                  </p>
                )}
                <div className="mt-4 max-w-xs">
                  <label htmlFor="global-commission-date" className="text-sm text-gray-600 block mb-2">
                    Data selecionada para todas as comissões
                  </label>
                  <input
                    id="global-commission-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <p className="mt-2 text-sm text-gray-500">Formato exibido: {displayedSelectedDate}</p>
                </div>
              </div>

              <article className="mb-8 rounded-2xl bg-white shadow-md p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Comissão Total ({monthLabel})</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">
                  {currencyFormatter.format(totalMonthlyCommission)}
                </p>
              </article>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            </div>
          </div>
        </section>
      </main>
      <Disclamer />
      <Footer />
    </>
  )
}

export default App
