import type { MetaFunction } from "@remix-run/node";

import { myAgent } from "~/api/agent.client";
import { Button } from "~/components/shadcn/ui/button";
import { Sortable } from "~/components/Sortable";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <Button onClick={() => myAgent.login()}>Sign in</Button>
      <Button onClick={() => myAgent.createBoard()}>Save</Button>
      <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
      <Sortable />
    </div>
  );
}
