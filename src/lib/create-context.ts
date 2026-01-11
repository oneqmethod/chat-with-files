'use client'

import { createContext, useContext, type Context } from 'react'

export function createContextWithHook<T>(name: string): [Context<T | null>, () => T] {
  const Ctx = createContext<T | null>(null)

  const useCtx = () => {
    const context = useContext(Ctx)
    if (!context) {
      throw new Error(`${name} components must be used within ${name}`)
    }
    return context
  }

  return [Ctx, useCtx]
}
