'use client'

import React, { forwardRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlephiumConnectButton } from '@alephium/web3-react'

export const NavBar = forwardRef<HTMLDivElement>((_, ref) => {
  const pathname = usePathname()

  return (
    <nav className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3 sm:gap-6">
        <Link href="/" className="text-lg font-bold text-gray-900 whitespace-nowrap">
          Chain Reaction
        </Link>
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/"
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === '/' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Game
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === '/leaderboard' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/how-to-play"
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === '/how-to-play' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Rules
          </Link>
        </div>
      </div>
      <div ref={ref} className="ml-auto">
        <AlephiumConnectButton />
      </div>
    </nav>
  )
})

NavBar.displayName = 'NavBar'
