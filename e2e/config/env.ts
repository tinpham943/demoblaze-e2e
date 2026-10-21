import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true });

// One RUN_ID per run: set here in the main process, inherited by every worker. Test users carry it, so the users of
// one run can be told apart from other runs on the shared public demo.
if (!process.env.RUN_ID) {
  process.env.RUN_ID = Date.now().toString(36);
}

const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;
const flag = z.preprocess(blankToUndefined, z.enum(['true', 'false']).optional());
const url = (fallback: string) =>
  z.preprocess(blankToUndefined, z.url().default(fallback)).transform((v) => v.replace(/\/+$/, ''));

const EnvSchema = z.object({
  BASE_URL: url('https://www.demoblaze.com'),
  API_URL: url('https://api.demoblaze.com'),
  RUN_ID: z.string().regex(/^[a-z0-9]+$/),
  USERNAME_PREFIX: z.preprocess(
    blankToUndefined,
    z
      .string()
      .regex(/^[a-z0-9]+$/)
      .default('qa'),
  ),
  WORKERS: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).optional()),
  HEADED: flag,
  ENABLE_TRACE: flag,
  ENABLE_VIDEO: flag,
  ENABLE_SCREENSHOT: flag,
  CI: z.preprocess(blankToUndefined, z.string().optional()),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Names the key and the problem, never the value.
  const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid .env (compare with .env.example): ${problems}`);
}
const e = parsed.data;

export const env = {
  BASE_URL: e.BASE_URL,
  API_URL: e.API_URL,
  RUN_ID: e.RUN_ID,
  USERNAME_PREFIX: e.USERNAME_PREFIX,
  IS_CI: Boolean(e.CI),
  WORKERS: e.WORKERS,
  HEADED: e.HEADED === 'true',
  ARTIFACTS: {
    trace: e.ENABLE_TRACE !== 'false',
    video: e.ENABLE_VIDEO !== 'false',
    screenshot: e.ENABLE_SCREENSHOT !== 'false',
  },
} as const;
