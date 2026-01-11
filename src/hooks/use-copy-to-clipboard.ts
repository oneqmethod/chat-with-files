'use client'

import { useState, useCallback } from 'react'

export function useCopyToClipboard(timeout = 2000): {
  isCopied: boolean
  copy: (text: string) => Promise<void>
} {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
        return
      }
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), timeout)
    },
    [timeout],
  )

  return { isCopied, copy }
}
