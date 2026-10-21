import { faker } from '@faker-js/faker';
import type { OrderDetails } from '@e2e/types/domain';

/** Valid Place Order details (every field filled). Pass overrides for the field under test. */
export function buildOrder(overrides: Partial<OrderDetails> = {}): OrderDetails {
  const expiry = faker.date.future({ years: 4 });
  return {
    name: faker.person.fullName(),
    country: faker.location.country(),
    city: faker.location.city(),
    card: faker.finance.creditCardNumber({ issuer: '4###############' }),
    month: String(expiry.getUTCMonth() + 1).padStart(2, '0'),
    year: String(expiry.getUTCFullYear()),
    ...overrides,
  };
}
