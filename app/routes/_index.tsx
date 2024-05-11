import type { MetaFunction } from "@remix-run/node";

import { updateCards } from "~/api/agent";
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
      <Button onClick={() => updateCards()}>button</Button>
      <Sortable />
    </div>
  );
}
