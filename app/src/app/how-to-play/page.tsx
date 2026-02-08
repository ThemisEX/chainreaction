'use client'

import React from 'react'
import { NavBar } from '@/components/NavBar'

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <NavBar />
      <main className="flex-1 flex flex-col items-center w-full max-w-lg px-4 py-8 gap-5">
        <h1 className="text-2xl font-bold text-gray-900">How to Play</h1>

        <div className="w-full space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">1. Start a chain</h2>
            <p className="mt-1 text-gray-500">Pick a token, set the entry price, countdown duration, price increase, and burn rate. You become the first player.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">2. Enter the chain</h2>
            <p className="mt-1 text-gray-500">Each new player pays a higher entry fee (previous price + the % increase). Every play resets the countdown.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">3. The clock tightens</h2>
            <p className="mt-1 text-gray-500">The countdown shrinks with each player, making the game more intense. Once it reaches 1 minute, each new play resets the timer back to 1 minute instead of shrinking further.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">4. Token burning</h2>
            <p className="mt-1 text-gray-500">If a burn rate is set, a percentage of each entry fee is permanently burned (removed from circulation). The rest goes to the pot.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">5. Last player wins</h2>
            <p className="mt-1 text-gray-500">When the timer runs out, the last person who joined wins the entire pot. Anyone can trigger the payout.</p>
          </div>
          <p className="text-sm text-gray-400">You can also boost the pot at any time to make the prize more attractive without resetting the timer.</p>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Built by{' '}
          <a href="https://notrustverify.ch" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 underline">
            No Trust Verify
          </a>
        </p>
      </main>
    </div>
  )
}
