/**
 * Goals API client. Calls the Express backend at API_BASE_URL.
 * All methods require the user's Supabase session access_token for Authorization.
 */
import { API_BASE_URL } from './config';

export type GoalsPayload = {
  goals: Array<{
    id: string;
    title: string;
    category?: string | null;
    reminderDate?: number | null;
    reminderTime?: string | null;
    preMadeTemplateId?: string | null;
    coverIndex: number;
    coverUrl?: string | null;
    source: string;
    habitsTotal: number;
    habitsDone: number;
    tasksTotal: number;
    tasksDone: number;
    dueDate: number | null;
    achieved: boolean;
    createdAt: number;
    items?: Array<{
      id: string;
      type: string;
      title: string;
      reminderTime?: string;
      note?: string;
      selectedDays?: number[];
      dueDate?: string;
      paused?: boolean;
    }>;
  }>;
  itemCompletions: Record<string, string[]>;
};

async function request<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<{ data?: T; error?: string }> {
  const { accessToken, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (API_BASE_URL.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = '1';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });
  const text = await res.text();
  let data: T;
  try {
    data = (text ? JSON.parse(text) : {}) as T;
  } catch {
    return { error: 'Invalid response from server' };
  }
  if (!res.ok) {
    const errData = data as { error?: string; details?: unknown };
    const errorMsg = errData?.error ?? 'Request failed';
    return { error: errData?.details ? `${errorMsg}: ${String(errData.details)}` : errorMsg };
  }
  return { data };
}

export async function fetchGoals(accessToken: string): Promise<{ data?: GoalsPayload; error?: string }> {
  return request<GoalsPayload>('/goals', { method: 'GET', accessToken });
}

export async function createGoal(
  accessToken: string,
  body: {
    id?: string;
    title: string;
    category?: string | null;
    reminderDate?: number | null;
    reminderTime?: string | null;
    coverIndex: number;
    coverUrl?: string | null;
    source: string;
    preMadeTemplateId?: string | null;
    dueDate?: number | null;
    achieved?: boolean;
    createdAt?: number;
    habitsTotal?: number;
    habitsDone?: number;
    tasksTotal?: number;
    tasksDone?: number;
    items?: Array<{
      id?: string;
      type: string;
      title: string;
      reminderTime?: string;
      note?: string;
      selectedDays?: number[];
      dueDate?: string;
      paused?: boolean;
    }>;
  }
): Promise<{ data?: GoalsPayload['goals'][0]; error?: string }> {
  return request<GoalsPayload['goals'][0]>(`/goals`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  });
}

export async function updateGoal(
  accessToken: string,
  goalId: string,
  updates: {
    achieved?: boolean;
    habitsDone?: number;
    tasksDone?: number;
    title?: string;
    category?: string | null;
    reminderDate?: number | null;
    reminderTime?: string | null;
    dueDate?: number | null;
  }
): Promise<{ error?: string }> {
  const { error } = await request(`/goals/${goalId}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(updates),
  });
  return { error };
}

export async function deleteGoal(accessToken: string, goalId: string): Promise<{ error?: string }> {
  const { error } = await request(`/goals/${goalId}`, { method: 'DELETE', accessToken });
  return { error };
}

export async function toggleCompletion(
  accessToken: string,
  itemId: string,
  date: string
): Promise<{ error?: string }> {
  const { error } = await request(`/goals/complete`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ itemId, date }),
  });
  return { error };
}

export async function updateGoalItem(
  accessToken: string,
  goalId: string,
  itemId: string,
  updates: {
    title?: string;
    reminderTime?: string;
    note?: string;
    selectedDays?: number[];
    dueDate?: string;
    paused?: boolean;
  }
): Promise<{ error?: string }> {
  const { error } = await request(`/goals/${goalId}/items/${itemId}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(updates),
  });
  return { error };
}
