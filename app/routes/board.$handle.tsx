import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { myAgent, publicBskyAgent } from "~/api/agent";
import type { ValidCardRecord } from "~/api/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";
import { Button } from "~/components/shadcn/ui/button";
import { Sortable } from "~/components/Sortable";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return {
    profile: await publicBskyAgent
      .getProfile({
        actor: params.handle!,
      })
      .then((response) => response.data),
    board: await myAgent
      .getBoard({
        repo: params.handle!,
      })
      .then((response) => response.value)
      .catch(() => ({ cards: [] })),
  };
}

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  const [cards, setCards] = useState<ValidCardRecord[]>(
    // @ts-expect-error
    board.cards,
  );
  return (
    <>
      <section className="flex w-full justify-center py-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>
            {profile.handle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </section>
      <section className="w-full">
        <div className="flex">
          <Button onClick={() => myAgent.login()}>Sign in</Button>
          <Button onClick={() => myAgent.updateBoard(cards)}>Save</Button>
          <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
        </div>
        <Sortable cards={cards} setCards={setCards} sortable />
      </section>
    </>
  );
}
