import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api'
import type { UserRole } from '@kamusi/core'

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export const usersApi = {
  list: async () => {
    return authenticatedFetch('/users')
  },
  updateRole: async ({ id, role }: { id: number | string, role: UserRole }) => {
    return authenticatedFetch(`/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
  },
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: usersApi.list,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
    },
  })
}
