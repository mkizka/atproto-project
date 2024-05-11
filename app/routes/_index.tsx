import type { MetaFunction } from "@remix-run/node";

import { Board } from "~/components/Board";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <Board />;
}
