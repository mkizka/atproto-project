import type { AppBskyActorDefs } from "@atproto/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";

import { myAgent } from "~/api/agent";
import type { BoardScheme, CardScheme } from "~/api/validator";

import { Modal } from "./Modal";
import { Sortable } from "./Sortable";

type Props = {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  board: BoardScheme;
  editable?: boolean;
};

export function Board({ profile, board, editable }: Props) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<CardScheme[]>(board.cards ?? []);

  const saveCards = (cards: CardScheme[]) => {
    void myAgent.updateBoard({ id: board.id, cards });
    setCards(cards);
  };

  const removeCard = (id: string) => {
    const newCards = cards.filter((card) => card.id !== id);
    setCards(newCards);
  };

  const handleSubmit = (input: string) => {
    const newCards = [...cards, { id: crypto.randomUUID(), url: input }];
    saveCards(newCards);
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
          <div className="flex flex-col gap-2">
            <Sortable
              cards={cards}
              saveCards={saveCards}
              removeCard={removeCard}
              sortable={editable}
            />
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
