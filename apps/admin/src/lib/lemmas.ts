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
  getPending: async (q = '') => {
    return authenticatedFetch(`/entries/search?q=${q}`)
  },
  moderate: async ({ id, action }: { id: string, action: 'verify' | 'hide' | 'restore' }) => {
    return authenticatedFetch(`/entries/${id}/moderate`, {
      method: 'POST',
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
