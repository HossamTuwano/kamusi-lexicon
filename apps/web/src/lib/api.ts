import { PartOfSpeech, type CreateLemmaInput, type UserRole } from '@kamusi/core';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type ReportReason =
  | 'spam'
  | 'offensive'
  | 'wrong'
  | 'duplicate'
  | 'other';

export type AuthUser = {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ApiExample = {
  id?: number;
  sentence: string;
  note?: string | null;
};

export type ApiSense = {
  id?: number;
  definition: string;
  usageNote?: string | null;
  examples?: ApiExample[];
};

export type ApiLemma = {
  id: number;
  word: string;
  language: string;
  partOfSpeech: PartOfSpeech;
  pronunciation?: string | null;
  plural?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  derivedWords?: string[];
  dialect?: string | null;
  source?: string | null;
  isVerified: boolean;
  voteCount?: number;
  version: number;
  senses: ApiSense[];
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
      if (Array.isArray(message)) message = message.join(', ');
    } catch {
      /* ignore */
    }
    throw new Error(String(message));
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  search(q: string) {
    return request<ApiLemma[]>(`/entries/search?q=${encodeURIComponent(q)}`);
  },
  getEntry(id: string | number) {
    return request<ApiLemma>(`/entries/${id}`);
  },
  register(username: string, email: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
  login(username: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  createEntry(input: CreateLemmaInput, token: string) {
    return request<ApiLemma>(
      '/entries',
      {
        method: 'POST',
        body: JSON.stringify({
          word: input.word,
          partOfSpeech: input.partOfSpeech,
          senses: input.senses.map((s) => ({
            definition: s.definition,
            usageNote: s.usageNote,
            examples: s.examples,
          })),
          pronunciation: input.pronunciation,
          plural: input.plural,
          synonyms: input.synonyms,
          antonyms: input.antonyms,
          derivedWords: input.derivedWords,
          dialect: input.dialect,
          source: input.source,
        }),
      },
      token,
    );
  },
  vote(id: number, vote: 1 | -1, token: string) {
    return request<{ voteCount: number; isVerified: boolean }>(
      `/entries/${id}/vote`,
      { method: 'POST', body: JSON.stringify({ vote }) },
      token,
    );
  },
  report(
    id: number,
    payload: { reason: ReportReason; note?: string },
    token: string,
  ) {
    return request<{ id: number; reason: ReportReason; status: string }>(
      `/entries/${id}/report`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    );
  },
};
