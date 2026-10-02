import { ApiError } from '../utils/auth';

export function friendlyApiMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!(err instanceof ApiError)) {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }
  if (err.status === 403) return 'You do not have permission';
  if (err.status === 404) return 'That item no longer exists';
  if (err.status === 429) return 'Too many attempts. Please wait a moment.';
  if (err.status === 409) return err.message || 'Conflict — please review and try again.';
  if (err.status === 400) return err.message || 'Please check the form and try again.';
  return err.message || fallback;
}

export function fieldErrorsFromApi(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.details || typeof err.details !== 'object') return {};
  const data = err.details as { errors?: Record<string, string[]> };
  if (!data.errors) return {};
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(data.errors)) {
    if (Array.isArray(msgs) && msgs[0]) out[key] = msgs[0];
  }
  return out;
}
