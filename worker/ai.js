// Haiku assists. Each one is a single request with a structured result; there is no chat.
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const MODEL = 'claude-haiku-5-5';

const VOICE = `You write short pieces of text for Healthy Hannah, a private workout and habit app used by one woman, Hannah. She may be postpartum.
Voice: warm, calm, plain words, short sentences, Christian faith-friendly, grace first.
Rules you always follow:
- Never mention weight, body size, shape or appearance, calories or "burning off" food.
- Never use guilt, shame, "no excuses", or comparison language. Missed days get grace, not pressure.
- Never diagnose or give medical advice. If pain, pelvic floor or postpartum symptoms come up, gently suggest checking with her doctor or a pelvic floor physical therapist.
- No emoji. No exclamation marks. No hashtags.`;

export class AiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function ask(env, { system, content, schema, maxTokens = 2000 }) {
  if (!env.ANTHROPIC_API_KEY) throw new AiError('Assists aren’t set up yet.', 503);
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 45000 });
  let res;
  try {
    res = await client.messages.parse({
      model: MODEL,
      max_tokens: maxTokens,
      output_config: { effort: 'low', format: zodOutputFormat(schema) },
      system: VOICE + (system ? '\n\n' + system : ''),
      messages: [{ role: 'user', content }],
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new AiError('Busy right now. Try again in a minute.', 429);
    if (e instanceof Anthropic.AuthenticationError) throw new AiError('The assist key isn’t valid.', 503);
    if (e instanceof Anthropic.BadRequestError) throw new AiError('That request couldn’t be read.', 400);
    if (e instanceof Anthropic.APIError) throw new AiError('Couldn’t reach the assist service.', 502);
    throw new AiError('Couldn’t reach the assist service.', 502);
  }
  if (res.stop_reason === 'refusal') throw new AiError('That one couldn’t be answered.', 422);
  if (!res.parsed_output) throw new AiError('Couldn’t read the answer. Try again.', 502);
  return res.parsed_output;
}

// 1) One encouragement line for today, from her real week.
export function encourage(env, summary) {
  return ask(env, {
    system: 'Write one encouraging line for the top of her Today screen. Make it specific to what she actually did or what today holds. 8 to 24 words. You may weave in a short Bible phrase, but not every day. Do not start with her name.',
    content: 'Her recent days and today, as JSON:\n' + JSON.stringify(summary),
    schema: z.object({ line: z.string() }),
    maxTokens: 1200,
  });
}

// 2) Read a workout screenshot into moves she can add.
export function movesFromImage(env, { image, routine }) {
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(image || '');
  if (!m) throw new AiError('That image couldn’t be read.', 400);
  return ask(env, {
    system: 'Read the workout shown in the image (on-screen text, captions, numbered lists). List each distinct exercise once, in order. Use short plain names. reps is what the image says, like "30", "1 min", "3x10", "10 each side", or "" if it doesn’t say. note is a short form cue only if the image gives one, else "". If there is no workout in the image, return an empty list.',
    content: [
      { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
      { type: 'text', text: `These moves may be added to her "${routine || 'workout'}" list.` },
    ],
    schema: z.object({ moves: z.array(z.object({ name: z.string(), reps: z.string(), note: z.string() })) }),
    maxTokens: 3000,
  });
}

// 3) Suggest gentler or different swaps for one move.
export function swapMove(env, { move, reps, routine, reason }) {
  return ask(env, {
    system: 'Suggest exactly 3 alternative exercises for the one move given, fitting the reason. Keep the same goal and muscle focus where you can. Prefer bodyweight or light equipment home moves. Each option: name (short), reps (similar volume, same format as given), why (one short sentence, kind, practical).',
    content: JSON.stringify({ move, reps, workout: routine, reason }),
    schema: z.object({ options: z.array(z.object({ name: z.string(), reps: z.string(), why: z.string() })) }),
    maxTokens: 1500,
  });
}

// 4) A short Sunday look back at her week.
export function reflect(env, week) {
  return ask(env, {
    system: 'Write a short look back at her week for the Progress screen. summary: 2 or 3 sentences naming real things she did (workouts, habits, wins she wrote), framed with grace. If the week was light, honor rest and anything she did do. focus: one gentle, specific idea for next week, one sentence, phrased as an invitation, not a rule.',
    content: 'Her week, as JSON:\n' + JSON.stringify(week),
    schema: z.object({ summary: z.string(), focus: z.string() }),
    maxTokens: 1500,
  });
}

// 5) Turn a short ask ("I need pelvic floor exercises") into a repeatable workout she can save to her week.
const ICONS = ['wave', 'dumbbell', 'flower', 'lotus', 'ring', 'heart', 'leaf', 'sun', 'spark', 'run', 'bike', 'drop', 'steps', 'pill', 'book', 'moon', 'sprout'];
export function planWorkout(env, { request, phase, existing, week }) {
  return ask(env, {
    system: `Design one repeatable home workout from her request, to be saved alongside her other workouts and done on set days each week.
- name: 2 to 4 plain words, like "Pelvic Floor Reset".
- icon: one of ${ICONS.join(', ')}.
- note: one or two short sentences on how to do it well (breath, pace, form). For pelvic floor, core or postpartum requests, include a gentle line that a pelvic floor physical therapist can tailor it, and to stop if anything hurts, leaks or feels heavy.
- moves: 5 to 10 distinct exercises in order, bodyweight or light equipment. name short and plain. reps like "10", "30 sec", "3x10", "10 each side". note is one short form cue or "".
- days: the weekdays to repeat it, as numbers 0=Sunday to 6=Saturday. Pick a sensible frequency for the goal (pelvic floor and mobility can be most days, strength 2 to 3 days with rest between) and prefer days that fit around her current week.
- If her cycle phase is given and relevant, let it shape intensity gently, without making the plan about the cycle.
- If the request is not about exercise or movement, return a gentle mobility workout and say so in the note.`,
    content: JSON.stringify({ request, cycle_phase: phase || null, her_current_workouts: existing || [], her_current_week: week || {} }),
    schema: z.object({
      name: z.string(), icon: z.string(), note: z.string(), days: z.array(z.number().int()),
      moves: z.array(z.object({ name: z.string(), reps: z.string(), note: z.string() })),
    }),
    maxTokens: 2500,
  });
}
