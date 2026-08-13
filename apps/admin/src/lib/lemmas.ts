import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api'

export const lemmaKeys = {
  all: ['lemmas'] as const,
  lists: () => [...lemmaKeys.all, 'list'] as const,
  list: (filter: string) => [...lemmaKeys.lists(), { filter }] as const,
  pending: (q: string) => [...lemmaKeys.lists(), 'pending', q] as const,
  hidden: (q: string) => [...lemmaKeys.lists(), 'hidden', q] as const,
  detail: (id: string | number) => [...lemmaKeys.all, 'detail', String(id)] as const,
}

export const lemmaApi = {
  search: async (q = '') => {
    const url = q ? `/entries/search?q=${encodeURIComponent(q)}` : '/entries/search?q='
    return authenticatedFetch(url)
  },

  getPending: async (q = '') => {
    // Moderator-only endpoint returns all entries (public search short-circuits
    // to [] on an empty query, which would hide the whole pending queue).
    const url = `/entries/moderation/search?q=${encodeURIComponent(q)}`
    const res = await authenticatedFetch(url)
    return Array.isArray(res) ? res.filter((e: any) => !e.isVerified && !e.isHidden) : []
  },

  getHidden: async (q = '') => {
    // Moderator-only endpoint: includes hidden entries.
    const url = `/entries/moderation/search?q=${encodeURIComponent(q)}`
    const res = await authenticatedFetch(url)
    return Array.isArray(res) ? res.filter((e: any) => e.isHidden) : []
  },

  getEntry: async (id: string | number) => {
    return authenticatedFetch(`/entries/${id}`)
  },

  moderate: async ({ id, action }: { id: number | string, action: 'verify' | 'hide' | 'restore' }) => {
    return authenticatedFetch(`/entries/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
  },

  bulkModerate: async ({ ids, action }: { ids: (number | string)[], action: 'verify' | 'hide' | 'restore' }) => {
    return authenticatedFetch('/entries/moderate/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ids.map(Number), action }),
    })
  },
}

export function usePendingLemmas(q = '') {
  return useQuery({
    queryKey: lemmaKeys.pending(q),
    queryFn: () => lemmaApi.getPending(q),
  })
}

export function useHiddenLemmas(q = '') {
  return useQuery({
    queryKey: lemmaKeys.hidden(q),
    queryFn: () => lemmaApi.getHidden(q),
  })
}

export function useEntryDetail(id: string | number) {
  return useQuery({
    queryKey: lemmaKeys.detail(id),
    queryFn: () => lemmaApi.getEntry(id),
    enabled: !!id,
  })
}

export function useModerateLemma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lemmaApi.moderate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lemmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: lemmaKeys.all })
    },
  })
}

export function useBulkModerateLemma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lemmaApi.bulkModerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lemmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: lemmaKeys.all })
    },
  })
}
