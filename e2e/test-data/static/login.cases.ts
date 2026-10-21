import { MESSAGES } from '@e2e/config/messages';
import type { UserCredentials } from '@e2e/types/domain';

/** A rejected log-in: what to type (derived from a freshly registered user) and the alert the app must raise. */
export type RejectedLoginCase = {
  tc: string;
  when: string;
  username: (user: UserCredentials) => string;
  password: (user: UserCredentials) => string;
  alert: string;
};

const { fillLogin, wrongPassword, userNotFound } = MESSAGES.alerts;

export const REJECTED_LOGIN_CASES: readonly RejectedLoginCase[] = [
  {
    tc: 'LGN-003',
    when: 'the password is wrong',
    username: (u) => u.username,
    password: () => 'not-the-password',
    alert: wrongPassword,
  },
  {
    tc: 'LGN-004',
    when: 'the username is not registered',
    username: (u) => `${u.username}x`,
    password: (u) => u.password,
    alert: userNotFound,
  },
  {
    tc: 'LGN-005',
    when: 'the username differs only in letter case',
    username: (u) => u.username.toUpperCase(),
    password: (u) => u.password,
    alert: userNotFound,
  },
  { tc: 'LGN-006', when: 'both fields are empty', username: () => '', password: () => '', alert: fillLogin },
  {
    tc: 'LGN-007',
    when: 'the password is empty',
    username: (u) => u.username,
    password: () => '',
    alert: fillLogin,
  },
];
