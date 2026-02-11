'use client'

import React, { useRef, useCallback } from 'react'
import { NavBar } from './NavBar'
import { GameList } from './GameList'
import { CreateGame } from './CreateGame'
import { LegacyGame } from './LegacyGame'
import { useGameList } from '@/hooks/useGameList'
import { gameConfig } from '@/services/utils'

export default function Home() {
  const connectRef = useRef<HTMLDivElement>(null)
  const { games, isLoading, error } = useGameList(gameConfig.factoryInstance)

  const openConnect = useCallback(() => {
    const btn = connectRef.current?.querySelector('button')
    btn?.click()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <NavBar ref={connectRef} />
      <main className="flex-1 flex flex-col items-center w-full max-w-lg px-4 py-8 gap-5">
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>

        {gameConfig.v1Address && (
          <LegacyGame address={gameConfig.v1Address} />
        )}

        <CreateGame
          factory={gameConfig.factoryInstance}
          onConnectRequest={openConnect}
        />

        {error && (
          <p className="w-full text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <GameList games={games} isLoading={isLoading} />

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
