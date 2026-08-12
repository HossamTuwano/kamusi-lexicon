import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api'
import { Lemma } from '@kamusi/core'

// Domain-shaped query keys
export const lemmaKeys = {
  all: ['lemmas'] as const,
  lists: () => [...lemmaKeys.all, 'list'] as const,
  list: (filter: string) => [...lemmaKeys.lists(), { filter }] as const,
  detail: (id: string) => [...lemmaKeys.all, 'detail', id] as const,
}

// Colocated Query Functions
export const lemmaApi = {
  // Fetch all entries, filter client-side for unverified (isVerified = false)
  getPending: async (q = '') => {
    const url = q ? `/entries/search?q=${q}` : '/entries/search?q='
    const res = await authenticatedFetch(url)
    // Filter to only unverified entries (moderator dashboard shows pending)
    return Array.isArray(res) ? res.filter((e: any) => !e.isVerified) : []
  },
  moderate: async ({ id, action }: { id: number | string, action: 'verify' | 'hide' | 'restore' }) => {
    return authenticatedFetch(`/entries/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
  }
}

// Hooks for Domain Logic
export function usePendingLemmas(q = '') {
  return useQuery({
    queryKey: lemmaKeys.list(q),
    queryFn: () => lemmaApi.getPending(q),
  })
}

export function useModerateLemma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lemmaApi.moderate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lemmaKeys.lists() })
    },
  })
}
