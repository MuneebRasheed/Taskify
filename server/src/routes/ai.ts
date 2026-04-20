import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { getAuthenticatedUser } from '../lib/auth';

const router = Router();

// Prefer EXPO_PUBLIC_OPENAI_API_KEY so you can configure it once
// in the root .env, but also fall back to OPENAI_API_KEY in server/.env.
const openAiApiKey =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';

const send = (res: Response, body: object, status: number): void => {
  res.status(status).json(body);
};

const log = (msg: string, meta?: object): void => {
  // eslint-disable-next-line no-console
  console.log('[AI Goal Plan]', msg, meta && Object.keys(meta).length ? meta : '');
};

const logError = (msg: string, err: unknown, meta?: object): void => {
  const base =
    err instanceof Error
      ? { message: err.message, stack: err.stack, name: err.name }
      : { detail: String(err) };
  // eslint-disable-next-line no-console
  console.error('[AI Goal Plan]', msg, { ...meta, ...base });
};

const VAGUE_GOAL_PATTERNS = [
  /^goal$/i,
  /^my goal$/i,
  /^something$/i,
  /^anything$/i,
  /^help me$/i,
  /^i don't know$/i,
  /^idk$/i,
  /^test(?:ing)?$/i,
];

const isMeaningfulGoalPrompt = (input: string): boolean => {
  const trimmed = input.trim();
  if (trimmed.length < 10 || trimmed.length > 300) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;

  const normalized = trimmed.toLowerCase().replace(/[^\w\s]/g, '').trim();
  if (VAGUE_GOAL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  return true;
};

export type AiGoalHabit = {
  title: string;
  /** Selected weekday indices: 0 = Monday … 6 = Sunday */
  selectedDays: number[];
  /** Optional reminder time like "09:00 AM" (or null/undefined for none). */
  reminderTime?: string | null;
};

export type AiGoalTask = {
  title: string;
  /** Display due date string, e.g. "Today, Mar 11, 2026" or "20 Jan, 2025" or "YYYY-MM-DD". */
  dueDate?: string | null;
  /** Optional reminder time like "16:00 PM" (or null/undefined for none). */
  reminderTime?: string | null;
};

export type AiGoalPlanResponse = {
  goalTitle: string;
  note: string;
  habits: AiGoalHabit[];
  tasks: AiGoalTask[];
};

const SYSTEM_PROMPT = `You are a high-quality goal-planning assistant.
Given a single user goal, create a realistic, actionable plan consisting of:
- One clear, motivating goal title
- A short explanatory note (1–3 sentences) about the plan
- A list of recurring habits
- A list of concrete one-time tasks

Output ONLY valid JSON with no markdown, no code fences, and no extra text.
Use this exact shape:
{
  "goalTitle": "Short, specific goal title",
  "note": "1–3 sentences explaining the overall plan.",
  "habits": [
    {
      "title": "Habit title",
      "selectedDays": [0, 2, 4],
      "reminderTime": "09:00 AM"
    }
  ],
  "tasks": [
    {
      "title": "Task title",
      "dueDate": "Today, Mar 11, 2026",
      "reminderTime": "16:00 PM"
    }
  ]
}

Rules:
- "selectedDays" are weekday indices where 0 = Monday, 6 = Sunday.
- Always provide "selectedDays" for habits; choose a realistic schedule that fits the goal.
- "reminderTime" can be null or omitted if not needed. When present, use a readable 12‑hour time like "09:00 AM" or "18:30 PM".
- "dueDate" is a short human‑readable date string or ISO "YYYY-MM-DD". Prefer short forms like "Today, Mar 11, 2026" or "20 Jan, 2025".
- Only include a handful of high‑impact habits (3–7) and tasks (3–10), not an overwhelming list.
- Make habits and tasks specific, measurable, and practical for real life.
- Build progression from easy starter actions to stronger milestone actions.
- Keep wording concise and motivational.
`;

router.post(
  '/goal-plan',
  async (req: Request, res: Response): Promise<void> => {
    const requestId = randomUUID();
    const wallStart = Date.now();

    try {
      log('POST /ai/goal-plan — start', {
        requestId,
        ip: req.ip,
        xForwardedFor: req.headers['x-forwarded-for'],
        hasBearerToken: Boolean(
          req.headers.authorization?.startsWith('Bearer ')
        ),
        contentType: req.headers['content-type'],
      });

      const { user, error } = await getAuthenticatedUser(req, res);
      if (error || !user) {
        log('Rejected: auth failed', { requestId, error, elapsedMs: Date.now() - wallStart });
        return;
      }

      log('Auth OK', { requestId, userId: user.id, elapsedMs: Date.now() - wallStart });

      if (!openAiApiKey) {
        log('Rejected: OpenAI key not configured', { requestId });
        send(
          res,
          {
            error:
              'AI goal generator is not configured. Add OpenAI API key to .env (EXPO_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY).',
          },
          503
        );
        return;
      }

      const rawPrompt = req.body?.prompt;
      const prompt =
        typeof rawPrompt === 'string' ? rawPrompt.trim() : '';
      if (!prompt) {
        log('Rejected: empty or invalid prompt', {
          requestId,
          bodyType: rawPrompt === undefined ? 'missing' : typeof rawPrompt,
        });
        send(
          res,
          { error: 'Body must include a non-empty "prompt" string' },
          400
        );
        return;
      }
      if (!isMeaningfulGoalPrompt(prompt)) {
        log('Rejected: goal prompt too vague/invalid', {
          requestId,
          promptLength: prompt.length,
          promptPreview: prompt.slice(0, 80),
        });
        send(
          res,
          {
            error:
              'Please write a proper goal you want to make and achieve. Include what you want to accomplish.',
          },
          400
        );
        return;
      }

      log('Calling OpenAI', {
        requestId,
        model: 'gpt-4o-mini',
        promptLength: prompt.length,
        promptPreview:
          prompt.length > 100 ? `${prompt.slice(0, 100)}…` : prompt,
      });

      const openai = new OpenAI({ apiKey: openAiApiKey });
      const openAiStarted = Date.now();
      let completion: Awaited<
        ReturnType<OpenAI['chat']['completions']['create']>
      >;
      try {
        completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Create a goal plan for this user goal and output JSON only:\n\n${prompt}`,
            },
          ],
          max_tokens: 1024,
          temperature: 0.4,
          response_format: { type: 'json_object' },
        });
      } catch (openAiErr) {
        logError('OpenAI API threw', openAiErr, {
          requestId,
          openAiMs: Date.now() - openAiStarted,
        });
        send(
          res,
          {
            error:
              openAiErr instanceof Error
                ? openAiErr.message
                : 'OpenAI request failed',
          },
          502
        );
        return;
      }

      const openAiMs = Date.now() - openAiStarted;
      const choice0 = completion.choices[0];
      log('OpenAI response', {
        requestId,
        openAiMs,
        totalElapsedMs: Date.now() - wallStart,
        usage: completion.usage ?? null,
        choiceCount: completion.choices?.length ?? 0,
        finishReason: choice0?.finish_reason ?? null,
        contentLength: choice0?.message?.content?.length ?? 0,
      });

      const content = choice0?.message?.content?.trim();
      if (!content) {
        log('Rejected: empty AI message content', {
          requestId,
          finishReason: choice0?.finish_reason,
          rawMessage: choice0?.message,
        });
        send(res, { error: 'AI returned no content' }, 502);
        return;
      }

      let jsonStr = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : String(err);
        log('JSON parse error', {
          requestId,
          msg,
          snippet: jsonStr.slice(0, 200),
        });
        send(res, { error: 'Invalid JSON from AI' }, 502);
        return;
      }

      const root =
        parsed && typeof parsed === 'object' ? (parsed as any) : {};

      const rawHabits = Array.isArray(root.habits)
        ? root.habits
        : [];
      const rawTasks = Array.isArray(root.tasks)
        ? root.tasks
        : [];

      const habits: AiGoalHabit[] = rawHabits
        .filter((h: unknown) => h && typeof h === 'object')
        .map((h: any): AiGoalHabit => {
          const title = String(h.title ?? '').trim() || 'Habit';
          const selectedDaysRaw = Array.isArray(h.selectedDays)
            ? h.selectedDays
            : [];
          const selectedDays = selectedDaysRaw
            .map((d: unknown) => Number(d))
            .filter((d: number) => Number.isInteger(d) && d >= 0 && d <= 6);
          const reminderTimeRaw =
            h.reminderTime != null ? String(h.reminderTime) : '';
          const reminderTime =
            reminderTimeRaw.trim().length > 0
              ? reminderTimeRaw.trim()
              : null;

          return {
            title,
            selectedDays,
            reminderTime,
          };
        })
        .filter((h: AiGoalHabit) => h.title.length > 0);

      const tasks: AiGoalTask[] = rawTasks
        .filter((t: unknown) => t && typeof t === 'object')
        .map((t: any): AiGoalTask => {
          const title = String(t.title ?? '').trim() || 'Task';
          const dueDateRaw =
            t.dueDate != null ? String(t.dueDate) : '';
          const dueDate =
            dueDateRaw.trim().length > 0
              ? dueDateRaw.trim()
              : null;
          const reminderTimeRaw =
            t.reminderTime != null ? String(t.reminderTime) : '';
          const reminderTime =
            reminderTimeRaw.trim().length > 0
              ? reminderTimeRaw.trim()
              : null;

          return {
            title,
            dueDate,
            reminderTime,
          };
        })
        .filter((t: AiGoalTask) => t.title.length > 0);

      const goalTitleRaw =
        root.goalTitle != null ? String(root.goalTitle) : '';
      const noteRaw = root.note != null ? String(root.note) : '';

      const goalTitle =
        goalTitleRaw.trim() || prompt || 'My Goal';
      const note =
        noteRaw.trim() ||
        'This plan contains suggested habits and tasks to help you make steady progress toward your goal.';

      const payload: AiGoalPlanResponse = {
        goalTitle,
        note,
        habits,
        tasks,
      };

      if (habits.length === 0 && tasks.length === 0) {
        log('Warning: parsed plan has no habits or tasks', {
          requestId,
          rawHabitsLen: rawHabits.length,
          rawTasksLen: rawTasks.length,
        });
      }

      log('Success', {
        requestId,
        userId: user.id,
        habits: habits.length,
        tasks: tasks.length,
        totalMs: Date.now() - wallStart,
      });

      send(res, payload, 200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      logError('Unhandled error in /ai/goal-plan', err, {
        requestId,
        totalMs: Date.now() - wallStart,
      });
      send(
        res,
        { error: message || 'AI goal plan failed' },
        500
      );
    }
  }
);

export default router;

