import { z } from 'zod';

/** DemoBlaze reports business errors as HTTP 200 + `{ errorMessage }`. */
export const ApiErrorBodySchema = z.object({ errorMessage: z.string().min(1) });

/** Sign-up: `""` on success. */
export const SignupResponseSchema = z.union([z.literal(''), ApiErrorBodySchema]);

const TOKEN_PREFIX = 'Auth_token: ';
/** Log-in: the JSON string `"Auth_token: <token>"` on success (returned without the prefix). */
export const LoginResponseSchema = z.union([
  z
    .string()
    .startsWith(TOKEN_PREFIX)
    .transform((s) => s.slice(TOKEN_PREFIX.length))
    .pipe(z.string().min(1)),
  ApiErrorBodySchema,
]);
