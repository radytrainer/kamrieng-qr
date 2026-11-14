import { unstable_rethrow } from "next/navigation";

/**
 * Next.js strips the `.message` off any error thrown out of a Server Action
 * in production — the client only ever sees a generic "An error occurred in
 * the Server Components render" digest, regardless of how deliberate/
 * user-facing the thrown message was (e.g. "A department with this code
 * already exists"). See https://github.com/vercel/next.js/discussions/49426.
 *
 * The fix is to never let expected errors escape as a thrown exception
 * across that boundary — catch them inside the action and return them as
 * plain data instead. runAction()/unwrapAction() are the server/client
 * halves of that: wrap a Server Action's body in runAction(), then unwrap
 * the call site (inside a mutationFn, typically) with unwrapAction() so the
 * error re-throws client-side — where nothing redacts it — for onError/
 * catch handlers to read normally.
 */
export type ActionResult<T> =
  { data: T; error?: undefined } | { data?: undefined; error: string };

export async function runAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { data: await fn() };
  } catch (error) {
    // redirect()/notFound() signal via a thrown value Next.js expects to
    // keep propagating — swallowing it here would silently break auth
    // redirects instead of surfacing a real error.
    unstable_rethrow(error);
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function unwrapAction<T>(
  promise: Promise<ActionResult<T>>
): Promise<T> {
  const result = await promise;
  if (result.error !== undefined) throw new Error(result.error);
  return result.data as T;
}
