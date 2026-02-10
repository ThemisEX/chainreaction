'use client'

import React, { FC, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { formatTokenAmount } from '@/services/tokenList'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface PriceChartProps {
  baseEntry: bigint
  multiplierBps: bigint
  playerCount: bigint
  tokenSymbol: string
  tokenDecimals: number
}

function computePrices(baseEntry: bigint, multiplierBps: bigint, count: number): bigint[] {
  const prices: bigint[] = [baseEntry]
  for (let i = 1; i < count; i++) {
    const prev = prices[i - 1]
    prices.push(prev + (prev * multiplierBps) / 10000n)
  }
  return prices
}

export const PriceChart: FC<PriceChartProps> = ({ baseEntry, multiplierBps, playerCount, tokenSymbol, tokenDecimals }) => {
  const { labels, pastData, futureData, pointColors, pointRadii } = useMemo(() => {
    const pc = Number(playerCount)
    const totalPlayers = pc + 10
    const allPrices = computePrices(baseEntry, multiplierBps, totalPlayers)

    const startIdx = Math.max(0, pc - 10)
    const endIdx = Math.min(totalPlayers, pc + 10)
    const slice = allPrices.slice(startIdx, endIdx)

    const labels = slice.map((_, i) => `#${startIdx + i + 1}`)

    // Split into past (including "next") and future datasets
    const nextLocalIdx = pc - startIdx // index of the "next" entry in our slice
    const pastData = slice.map((p, i) => i <= nextLocalIdx ? Number(p) / 10 ** tokenDecimals : null)
    const futureData = slice.map((p, i) => i >= nextLocalIdx ? Number(p) / 10 ** tokenDecimals : null)

    const pointColors = slice.map((_, i) => {
      if (i === nextLocalIdx) return '#10b981' // emerald-500 for "next"
      if (i < nextLocalIdx) return '#9ca3af' // gray-400 for past
      return '#93c5fd' // blue-300 for future
    })

    const pointRadii = slice.map((_, i) => i === nextLocalIdx ? 6 : 3)

    return { labels, pastData, futureData, pointColors, pointRadii }
  }, [baseEntry, multiplierBps, playerCount, tokenDecimals])

  const data = {
    labels,
    datasets: [
      {
        label: 'Past',
        data: pastData,
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        pointBackgroundColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
      {
        label: 'Future',
        data: futureData,
        borderColor: '#93c5fd',
        borderDash: [4, 4],
        backgroundColor: 'rgba(147, 197, 253, 0.08)',
        pointBackgroundColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => {
            const val = ctx.raw as number | null
            if (val == null) return ''
            // Convert back to bigint for precise formatting
            const bigVal = BigInt(Math.round(val * 10 ** tokenDecimals))
            return `${formatTokenAmount(bigVal, tokenDecimals)} ${tokenSymbol}`
          },
          title: (items: { label: string }[]) => `Player ${items[0]?.label ?? ''}`,
        },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: (value: number | string) => {
            const num = typeof value === 'string' ? parseFloat(value) : value
            return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(num)
          },
        },
      },
    },
  }

  return (
    <div className="w-full aspect-[2/1] min-h-[180px] max-h-[300px]">
      <Line data={data} options={options} />
    </div>
  )
}
