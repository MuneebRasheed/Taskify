// import { API_BASE_URL } from './config';

// export type AiGoalHabit = {
//   title: string;
//   selectedDays?: number[];
//   reminderTime?: string | null;
// };

// export type AiGoalTask = {
//   title: string;
//   dueDate?: string | null;
//   reminderTime?: string | null;
// };

// export type AiGoalPlan = {
//   goalTitle: string;
//   note: string;
//   habits: AiGoalHabit[];
//   tasks: AiGoalTask[];
// };

// async function request<T>(
//   path: string,
//   options: RequestInit & { accessToken?: string } = {}
// ): Promise<{ data?: T; error?: string }> {
//   const { accessToken, ...fetchOptions } = options;
//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//     ...(fetchOptions.headers as Record<string, string>),
//   };
//   if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
//   if (API_BASE_URL.includes('ngrok')) {
//     headers['ngrok-skip-browser-warning'] = '1';
//   }

//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     ...fetchOptions,
//     headers,
//   });
//   const text = await res.text();
//   let data: T;
//   try {
//     data = (text ? JSON.parse(text) : {}) as T;
//   } catch {
//     return { error: 'Invalid response from server' };
//   }
//   if (!res.ok) {
//     return {
//       error: (data as { error?: string }).error ?? 'Request failed',
//     };
//   }
//   return { data };
// }

// export async function generateGoalPlan(
//   accessToken: string,
//   prompt: string
// ): Promise<{ data?: AiGoalPlan; error?: string }> {
//   return request<AiGoalPlan>('/ai/goal-plan', {
//     method: 'POST',
//     accessToken,
//     body: JSON.stringify({ prompt }),
//   });
// }

