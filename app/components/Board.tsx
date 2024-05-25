import type { AppBskyActorDefs } from "@atproto/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";

import type { BoardScheme, CardScheme } from "~/api/validator";

import { Modal } from "./Modal";
import { Sortable } from "./Sortable";

type EditableProps = {
  editable: true;
  onBoardUpdate?: (board: BoardScheme) => void;
};

type NonEditableProps = {
  editable?: false;
};

type Props = {
  profile: Pick<AppBskyActorDefs.ProfileViewDetailed, "avatar" | "handle">;
  board: BoardScheme;
} & (EditableProps | NonEditableProps);

export function Board(props: Props) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<CardScheme[]>(props.board.cards ?? []);

  const saveCards = (cards: CardScheme[]) => {
    if (!props.editable) return;
    props.onBoardUpdate?.({ ...props.board, cards });
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
          {props.profile.avatar && <AvatarImage src={props.profile.avatar} />}
          <AvatarFallback>
            {props.profile.handle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </section>
      <section className="flex w-full flex-col gap-2">
        <Sortable
          cards={cards}
          saveCards={saveCards}
          removeCard={removeCard}
          sortable={props.editable}
        />
        {props.editable && (
          <Modal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
        )}
      </section>
    </>
  );
}
