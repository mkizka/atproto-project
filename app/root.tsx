import type { LinksFunction } from "@remix-run/node";
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";

import { serverEnv } from "./utils/env.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function loader() {
  return json({ serverEnv });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { serverEnv } = useLoaderData<typeof loader>();
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(serverEnv)}`,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <main className="flex justify-center">
      <div className="w-full max-w-[600px]">
        <Outlet />
      </div>
    </main>
  );
}
