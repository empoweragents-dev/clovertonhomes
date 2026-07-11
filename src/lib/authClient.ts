'use client'

import { createAuthClient } from 'better-auth/react'

// Same-origin: the unified Express+Next server mounts better-auth at /api/auth.
// baseURL defaults to the current origin in the browser.
export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
})

export const { signIn, signOut, useSession, getSession } = authClient
