# DemoBlaze E2E — Playwright + TypeScript

End-to-end tests for the **Login** and **Cart** features of <https://www.demoblaze.com>, including the demo flow
**log in → add to cart → place order**. One framework runs UI, API, regression and performance tests, across desktop
and mobile browsers, locally and on GitHub Actions.

Test cases: [DemoBlaze test cases](https://docs.google.com/spreadsheets/d/1kRJ8EB9VPN3qOpzjyj5U3ogWMHwg0hH6pop9dbCiDto/edit)
(Google Sheet). Each automated test is tagged with its sheet ID, e.g. `@TC-LGN-001`.

## Run

Requires Node ≥ 20. No credentials are needed: every test registers its own user.

```bash
npm ci
npx playwright install
npm test          # UI (5 browser projects) + API
npm run report    # open the HTML report
```

| Command                                  | Runs                                      |
| ---------------------------------------- | ----------------------------------------- |
| `npm run test:smoke`                     | the critical path, incl. the demo flow    |
| `npm run test:regression`                | `@regression` tests                       |
| `npm run test:chromium` (firefox/webkit) | one browser                               |
| `npm run test:mobile`                    | `@smoke` on Pixel 7 + iPhone 15 emulation |
| `npm run test:api`                       | API tests (no browser)                    |
| `npm run test:perf`                      | load-time budgets (run alone)             |
| `npx playwright test --grep @TC-CRT-002` | one test case                             |

Optional settings (URLs, workers, headed mode, failure artifacts) go in `.env`; see `.env.example`.

## Structure

```
e2e/
  config/       .env parsing, routes, UI/API messages, timeouts, performance budgets
  api/          REST client + auth / product / cart modules
  types/        domain types and API response schemas (Zod)
  factories/    faker builders for users and order details
  test-data/    data-driven log-in cases
  components/   navbar, native alert, purchase confirmation
  pages/        page objects: Home, Product, Cart, Login modal, Place order modal
  fixtures/     test.ts — provides pages, API modules and test data to the specs
  tests/        ui/ (auth, cart, checkout, journey) · api/ · perf/
```

## Design

- **Page objects + fixtures:** locators live in page objects, assertions in specs, so a UI change is fixed in one place.
- **Independent tests:** each test creates its own user and cart data through the API and cleans up after itself, so
  tests run in parallel and in any order. UI tests check results through the UI only.
- **Stable waits:** element ids as test ids, web-first assertions, no fixed sleeps.
- **Test types:** UI specs run per browser project; API specs validate responses with Zod; perf specs check page-load
  and API response-time budgets (not load testing, which a shared public demo should not get).
- **Known defects** are pinned with `test.fail()`: the suite stays green while the defect exists and flags the fix.
- **Reports:** console, HTML (screenshot and video of each failure, trace on CI retries) and JUnit XML.

## CI

`.github/workflows/e2e.yml` runs typecheck + lint, then one job per browser project and the API project. Push and pull
requests run `@smoke`; the nightly and manual runs run everything, including perf. A last job merges the results of
all projects into one HTML report: the latest `main` run is published at
<https://tinpham943.github.io/demoblaze-e2e/>, and every run keeps it as the `html-report` artifact.
