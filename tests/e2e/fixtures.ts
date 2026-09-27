import { test as base } from '@playwright/test'
import { createHarnessTest } from '@azeajr/web-harness/playwright'
import harness from '../../harness.config.mjs'

// The shared fault guard (web-harness): page errors, console errors, failed or
// erroring same-origin requests and escaped external calls fail a passing
// test — the same policy an agent's harness session is judged by. A test that
// causes a fault on purpose declares it with `allowPageFaults` or
// `expectPageFault`, for that test alone.
export const test = createHarnessTest(base, harness)

export { expect } from '@playwright/test'
