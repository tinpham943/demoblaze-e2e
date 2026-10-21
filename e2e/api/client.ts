import type { APIRequest, APIRequestContext } from '@playwright/test';
import type { z } from 'zod';
import { env } from '@e2e/config/env';

/** A request context for the DemoBlaze API. The caller disposes it. */
export async function newApiContext(request: APIRequest): Promise<APIRequestContext> {
  return request.newContext({ baseURL: env.API_URL, extraHTTPHeaders: { Accept: 'application/json' } });
}

/** DemoBlaze REST API: seeds data for the UI tests and is the subject of the API tests. Responses are Zod-validated. */
export class RestClient {
  constructor(readonly raw: APIRequestContext) {}

  async post<S extends z.ZodType>(path: string, schema: S, body: unknown): Promise<z.output<S>> {
    const res = await this.raw.post(path, { data: body });
    if (!res.ok()) throw new Error(`POST ${path} → ${res.status()}`);
    const text = await res.text();
    return schema.parse(text.trim() === '' ? null : JSON.parse(text));
  }

  async get<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
    const res = await this.raw.get(path);
    if (!res.ok()) throw new Error(`GET ${path} → ${res.status()}`);
    return schema.parse(await res.json());
  }
}
