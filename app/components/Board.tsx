import type { AppBskyActorDefs } from "@atproto/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";

import { myAgent } from "~/api/agent";
import type { BoardScheme, CardScheme } from "~/api/validator";

import { Modal } from "./Modal";
import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";

type Props = {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  board: BoardScheme;
  editable?: boolean;
};

export function Board({ profile, board, editable }: Props) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<CardScheme[]>(board.cards ?? []);

  const handleSubmit = (input: string) => {
    setCards([...cards, { id: crypto.randomUUID(), url: input }]);
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
      <section className="flex flex-col items-center">
        <div className="w-full max-w-[95vw] sm:max-w-screen-sm">
          {editable && (
            <div className="flex">
              <Button onClick={() => myAgent.login()}>Sign in</Button>
              <Button onClick={() => myAgent.updateBoard({ ...board, cards })}>
                Save
              </Button>
              <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Sortable cards={cards} setCards={setCards} sortable={editable} />
            {editable && (
              <Modal
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
