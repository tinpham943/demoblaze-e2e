import { faker } from '@faker-js/faker';
import { env } from '@e2e/config/env';
import type { UserCredentials } from '@e2e/types/domain';

/** A new user `<prefix>_<run id>_<random>`. DemoBlaze cannot delete users, so the run id keeps them traceable. */
export function buildUser(overrides: Partial<UserCredentials> = {}): UserCredentials {
  return {
    username: `${env.USERNAME_PREFIX}_${env.RUN_ID}_${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`,
    password: faker.internet.password({ length: 14, prefix: 'Aa1!' }),
    ...overrides,
  };
}
