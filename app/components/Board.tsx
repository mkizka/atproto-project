import type { AppBskyActorDefs } from "@atproto/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";

import { myAgent } from "~/api/agent";
import type { ValidCardRecord } from "~/api/types";
import type { DevMkizkaTestProfileBoard } from "~/generated/api";

import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";

type Props = {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  board: DevMkizkaTestProfileBoard.Record;
  editable?: boolean;
};

export function Board({ profile, board, editable }: Props) {
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
        {editable && (
          <div className="flex">
            <Button onClick={() => myAgent.login()}>Sign in</Button>
            <Button onClick={() => myAgent.updateBoard(cards)}>Save</Button>
            <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
          </div>
        )}
        <Sortable cards={cards} setCards={setCards} sortable={editable} />
      </section>
    </>
  );
}
