import type { AppBskyActorDefs } from "@atproto/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";

import { myAgent } from "~/api/agent";
import type { ValidCardRecord } from "~/api/types";
import type { DevMkizkaTestProfileBoard } from "~/generated/api";

import { Modal } from "./Modal";
import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";

type Props = {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  board: DevMkizkaTestProfileBoard.Record;
  editable?: boolean;
};

const isBskyProfileUrl = (hostname: string, paths: string[]) => {
  return (
    hostname === "bsky.app" && paths[1] === "profile" && paths[3] === undefined
  );
};

const convertUrlToCard = (input: string): ValidCardRecord => {
  const url = new URL(input);
  const paths = url.pathname.split("/");
  if (isBskyProfileUrl(url.hostname, paths)) {
    return {
      $type: "dev.mkizka.test.profile.board#blueskyProfileCard",
      id: crypto.randomUUID(),
      handle: paths[2],
    };
  }
  return {
    $type: "dev.mkizka.test.profile.board#linkCard",
    id: crypto.randomUUID(),
    url: input,
  };
};

export function Board({ profile, board, editable }: Props) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<ValidCardRecord[]>(
    // @ts-expect-error
    board.cards,
  );

  const handleSubmit = (input: string) => {
    setCards((prev) => {
      return [...prev, convertUrlToCard(input)];
    });
    setOpen(false);
  };

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
        <div className="flex flex-col gap-2">
          <Sortable cards={cards} setCards={setCards} sortable={editable} />
          <Modal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
        </div>
      </section>
    </>
  );
}
