'use client'

import React, { FC, useState, useRef, useEffect } from 'react'
import { TokenInfo } from '@/services/tokenList'

interface TokenSelectorProps {
  tokens: TokenInfo[]
  selected: TokenInfo
  onChange: (token: TokenInfo) => void
}

export const TokenSelector: FC<TokenSelectorProps> = ({ tokens, selected, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search
    ? tokens.filter(t =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : tokens

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label className="text-[11px] text-gray-400 uppercase tracking-wider">Token</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 pl-3 pr-3 py-2 text-base rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.logoURI} alt={selected.symbol} className="w-5 h-5 rounded-full flex-shrink-0" />
          <span className="flex-1 truncate">{selected.symbol} — {selected.name}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400 text-center">No tokens found</li>
              )}
              {filtered.map(t => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(t); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-50 transition-colors text-left ${t.id === selected.id ? 'bg-emerald-50 font-medium' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.logoURI} alt={t.symbol} className="w-5 h-5 rounded-full flex-shrink-0" />
                    <span className="font-medium">{t.symbol}</span>
                    <span className="text-gray-400 truncate">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
