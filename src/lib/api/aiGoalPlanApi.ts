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

/** Gateways (Render, etc.) often return JSON errors with Content-Type text/html or text/plain. */
function tryParseJsonObject(text: string): Record<string, unknown> | undefined {
  const t = text.trim();
  if (!t.startsWith('{')) return undefined;
  try {
    const v = JSON.parse(t) as unknown;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function extractGatewayOrApiError(
  parsedBody: Record<string, unknown> | undefined,
  resStatus: number
): string | undefined {
  if (!parsedBody) return undefined;
  const err = typeof parsedBody.error === 'string' ? parsedBody.error : undefined;
  if (err) return err;
  if (parsedBody.status === 'error' && typeof parsedBody.message === 'string') {
    const code =
      typeof parsedBody.code === 'number' ? parsedBody.code : resStatus;
    const msg = parsedBody.message;
    if (code === 502 || /failed to respond|bad gateway/i.test(msg)) {
      return (
        'The API did not respond in time, or your phone never reached your computer\'s server. ' +
        'Start the Taskify server (port 3001), run ngrok http 3001, put that URL in EXPO_PUBLIC_API_URL, restart Expo (npx expo start -c), then try again.'
      );
    }
    return msg;
  }
  return undefined;
}

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

  const url = `${API_BASE_URL}${path}`;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[aiGoalPlanApi] POST', url, '(API_BASE_URL from env)');
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  const text = await res.text();

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[aiGoalPlanApi] response', {
      status: res.status,
      contentType,
      bodyPreview: text.slice(0, 280),
    });
  }
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
    const obj =
      data && typeof data === 'object'
        ? (data as Record<string, unknown>)
        : tryParseJsonObject(text);
    const fromStructured = extractGatewayOrApiError(obj, res.status);
    if (fromStructured) {
      return { error: fromStructured };
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

