import type { AppBskyActorDefs } from "@atproto/api";
import { useState } from "react";

import type { BoardScheme, CardScheme } from "~/api/validator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

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

  const editCard = () => {
    setOpen(true);
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
    <div className="flex flex-col gap-2">
      <section className="flex w-full justify-center py-4">
        <Avatar className="size-16">
          <AvatarImage src={props.profile.avatar} />
          <AvatarFallback />
        </Avatar>
      </section>
      <section className="flex w-full flex-col gap-2">
        <Sortable
          cards={cards}
          saveCards={saveCards}
          editCard={editCard}
          removeCard={removeCard}
          editable={props.editable}
        />
        {props.editable && (
          <Modal open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
        )}
      </section>
    </div>
  );
}
