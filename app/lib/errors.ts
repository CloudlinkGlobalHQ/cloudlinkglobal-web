import type { ApiError } from './api'

export const WAKING_UP_HINT = 'The backend may be waking up — this can take up to a minute.'
export const READ_ONLY_TITLE = 'This action isn’t available — Cloudlink is read-only.'

export type ErrorCopy = { title: string; message: string; hint?: string }

/** Plain-English copy for an API failure. */
export function describeError(err: ApiError): ErrorCopy {
  switch (err.kind) {
    case 'timeout':
      return { title: 'The request timed out', message: 'Cloudlink didn’t answer in time.', hint: WAKING_UP_HINT }
    case 'network':
      return { title: 'Couldn’t reach Cloudlink', message: 'Check your connection and try again.', hint: WAKING_UP_HINT }
    case 'unauthorized':
      return { title: 'Your session couldn’t be verified', message: 'Reload the page, or sign out and sign in again.' }
    case 'forbidden':
      return err.readOnly
        ? { title: READ_ONLY_TITLE, message: 'Cloudlink never changes resources in your AWS account. Make this change in the AWS console instead.' }
        : { title: 'You don’t have access to this', message: err.detail || 'The server refused this request.' }
    case 'not_found':
      return { title: 'Not available yet', message: 'The Cloudlink backend doesn’t support this yet.' }
    case 'server':
      return { title: 'Cloudlink hit an error', message: 'The Cloudlink server returned an error. Try again in a moment.' }
    default:
      return { title: 'The request failed', message: err.detail || err.message }
  }
}
