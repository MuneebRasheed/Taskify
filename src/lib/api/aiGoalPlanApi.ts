import { API_BASE_URL } from './config';

export type AiGoalHabit = {
  title: string;
  selectedDays?: number[];
  reminderTime?: string | null;
};

export type AiGoalTask = {
  title: string;
  dueDate?: string | null;
  reminderTime?: string | null;
};

export type AiGoalPlan = {
  goalTitle: string;
  note: string;
  habits: AiGoalHabit[];
  tasks: AiGoalTask[];
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

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });
  const text = await res.text();

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.toLowerCase().includes('application/json');
  const extractMessageFromHtml = (html: string): string | null => {
    const preMatch = html.match(/<pre>([\s\S]*?)<\/pre>/i);
    if (preMatch?.[1]) return preMatch[1].trim();
    const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped.length > 0 ? stripped : null;
  };

  let data: T | undefined;
  if (isJson && text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      return { error: 'Server returned invalid JSON' };
    }
  }

  if (!res.ok) {
    if (data && typeof data === 'object') {
      const errorFromJson = (data as { error?: string }).error;
      if (errorFromJson) {
        return { error: errorFromJson };
      }
    }

    if (res.status === 404 && path === '/ai/goal-plan') {
      return {
        error:
          'AI endpoint is not available on the server. Restart/update backend and expose POST /ai/goal-plan.',
      };
    }

    const fromHtml = text ? extractMessageFromHtml(text) : null;
    return { error: fromHtml || `Request failed (${res.status})` };
  }

  if (!data) {
    return { error: 'Server returned an empty response' };
  }
  return { data };
}

export async function generateGoalPlan(
  accessToken: string,
  prompt: string
): Promise<{ data?: AiGoalPlan; error?: string }> {
  return request<AiGoalPlan>('/ai/goal-plan', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ prompt }),
  });
}

