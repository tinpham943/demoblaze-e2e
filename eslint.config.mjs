import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

const XPATH = {
  selector: 'Literal[value=/^(xpath=|\\/\\/)/]',
  message: 'XPath is forbidden. Use getByTestId (TID constants) > getByRole > getByLabel > getByText.',
};
const WAIT_FOR_TIMEOUT = {
  selector: "CallExpression[callee.property.name='waitForTimeout']",
  message: 'waitForTimeout is forbidden. Use a web-first assertion instead.',
};
const DOUBLE_CAST = {
  selector: "TSAsExpression > TSAsExpression[typeAnnotation.type='TSUnknownKeyword']",
  message: '`as unknown as T` hides type errors. Parse with a Zod schema or use a precise type.',
};

export default tseslint.config(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', 'reports/', '**/*.mjs'],
  },
  {
    files: ['e2e/**/*.ts', 'playwright*.config.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      'no-restricted-syntax': ['error', WAIT_FOR_TIMEOUT, XPATH, DOUBLE_CAST],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-raw-locators': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-useless-await': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
      'playwright/valid-title': 'off',
    },
  },
  {
    // Specs: DI through fixtures only.
    files: ['e2e/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: "Import { test, expect } from '@e2e/fixtures/test' instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Page objects and components: no assertions.
    files: ['e2e/pages/**/*.ts', 'e2e/components/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='expect']",
          message: 'No assertions in page objects/components. Return locators/state; assert in specs.',
        },
        WAIT_FOR_TIMEOUT,
        XPATH,
        DOUBLE_CAST,
      ],
    },
  },
);
