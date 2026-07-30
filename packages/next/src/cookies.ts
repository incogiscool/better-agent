/**
 * Route tools are fetched server-to-server from BetterAgent's backend, so the
 * end user's browser never talks to your API directly and its cookies are not
 * attached to those requests. `authToken` is how you authenticate them.
 *
 * `buildCookieHeader` covers the case where your backend only accepts a session
 * cookie. Call it in a Server Component and pass the result to the provider's
 * `authToken` prop:
 *
 * ```tsx
 * import { buildCookieHeader } from "betteragent-next";
 *
 * export default async function Layout({ children }) {
 *   return (
 *     <AgentProvider
 *       clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
 *       endUserId={user.id}
 *       authToken={await buildCookieHeader(["session"])}
 *     >
 *       {children}
 *     </AgentProvider>
 *   );
 * }
 * ```
 *
 * Understand the trade before you reach for this: it sends a live session
 * credential to BetterAgent, which forwards it to your backend. The project
 * must also have cookie forwarding enabled in its settings, and the request is
 * only made over HTTPS. A short-lived scoped token remains the safer default —
 * prefer it whenever your backend can mint one.
 */
export async function buildCookieHeader(
  names: string[],
): Promise<Record<string, string>> {
  if (names.length === 0) return {};

  // Imported lazily: `next/headers` only resolves in a server runtime, and this
  // module is part of a package that also gets pulled into client bundles.
  const { cookies } = await import("next/headers");
  const store = await cookies();

  const pairs: string[] = [];
  for (const name of names) {
    const cookie = store.get(name);
    if (cookie?.value) pairs.push(`${name}=${cookie.value}`);
  }

  return pairs.length > 0 ? { Cookie: pairs.join("; ") } : {};
}
