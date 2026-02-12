'use client'

import { useEffect } from 'react'

/** Message type the game posts to the parent when embedded so the top frame can resize the iframe. */
export const EMBED_RESIZE_MESSAGE_TYPE = 'chainreaction-embed-resize' as const

export interface EmbedResizeMessage {
  type: typeof EMBED_RESIZE_MESSAGE_TYPE
  width: number
  height: number
}

function isEmbedded(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}

function sendResize(width: number, height: number) {
  try {
    const msg: EmbedResizeMessage = { type: EMBED_RESIZE_MESSAGE_TYPE, width, height }
    window.parent.postMessage(msg, '*')
  } catch {
    // cross-origin or closed parent
  }
}

/**
 * When the game is in an iframe:
 * - Sets data-embedded="true" on <html> so CSS can hide scrollbars.
 * - Observes body size and posts { type: 'chainreaction-embed-resize', width, height } to the parent
 *   so the top frame can set the iframe dimensions.
 */
export function useEmbedResize() {
  useEffect(() => {
    if (!isEmbedded()) return

    const el = document.documentElement
    el.dataset.embedded = 'true'

    const report = () => {
      const width = document.documentElement.scrollWidth
      const height = document.documentElement.scrollHeight
      sendResize(width, height)
    }

    report()

    const ro = new ResizeObserver(() => {
      report()
    })
    ro.observe(document.body)

    return () => {
      delete el.dataset.embedded
      ro.disconnect()
    }
  }, [])
}
