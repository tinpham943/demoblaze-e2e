import type { RestClient } from '@e2e/api/client';
import { API_ROUTES } from '@e2e/config/routes';
import type { UserCredentials } from '@e2e/types/domain';
import { LoginResponseSchema, SignupResponseSchema } from '@e2e/types/schemas/auth.schema';

/** The web app base64-encodes the password before sending it (`btoa`); the API expects the same. */
const encodePassword = (password: string): string => Buffer.from(password, 'utf8').toString('base64');

export class AuthApi {
  constructor(private readonly client: RestClient) {}

  /** Registers the user; throws with the API's reason when refused. */
  async signup(user: UserCredentials): Promise<void> {
    const body = await this.client.post(API_ROUTES.signup, SignupResponseSchema, {
      username: user.username,
      password: encodePassword(user.password),
    });
    if (typeof body !== 'string') throw new Error(`Sign-up refused: ${body.errorMessage}`);
  }

  /** Session token of the user; throws with the API's reason when refused. */
  async token(user: UserCredentials): Promise<string> {
    const body = await this.client.post(API_ROUTES.login, LoginResponseSchema, {
      username: user.username,
      password: encodePassword(user.password),
    });
    if (typeof body !== 'string') throw new Error(`Log-in refused: ${body.errorMessage}`);
    return body;
  }
}
