import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";

import { myAgent } from "./api/agent";
import { SessionProvider } from "./components/SessionProvider";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export { HydrateFallback } from "~/components/HydrateFallback";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script async src="https://embed.bsky.app/static/embed.js"></script>
      </body>
    </html>
  );
}

// どのページでもログイン状態を復元する
export async function clientLoader() {
  if (!myAgent.hasSession()) {
    await myAgent.resumeSession();
  }
  return null;
}

export default function App() {
  return (
    <SessionProvider>
      <main className="flex justify-center">
        <div className="w-full max-w-[95vw] sm:max-w-screen-sm">
          <Outlet />
        </div>
      </main>
    </SessionProvider>
  );
}
