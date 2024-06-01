import type { AppBskyActorDefs } from "@atproto/api";
import type { DependencyList } from "react";
import { useState } from "react";
import { useEffect, useRef } from "react";

import { myAgent } from "~/api/agent";
import type { BoardScheme, CardScheme } from "~/api/validator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

import { Modal } from "./Modal";
import { Sortable } from "./Sortable";

export const useDidMountEffect = (effect: () => void, deps: DependencyList) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      return effect();
    } else {
      didMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

type Props = {
  profile: Pick<AppBskyActorDefs.ProfileViewDetailed, "avatar" | "handle">;
  board: BoardScheme;
  editable?: boolean;
};

export function Board({ profile, board, editable }: Props) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<CardScheme[]>(board.cards);

  useDidMountEffect(() => {
    void myAgent.updateBoard({ ...board, cards });
  }, [JSON.stringify(cards)]);

  const saveCards = (cards: CardScheme[]) => {
    if (!editable) return;
    setCards(cards);
  };

  const editCard = () => {
    setOpen(true);
  };

  const removeCard = (id: string) => {
    const newCards = cards.filter((card) => card.id !== id);
    setCards(newCards);
  };

  const handleOpen = (open: boolean) => {
    setOpen(open);
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
          <AvatarImage src={profile.avatar} />
          <AvatarFallback />
        </Avatar>
      </section>
      <section className="flex w-full flex-col gap-2">
        <Sortable
          cards={cards}
          setCards={setCards}
          editCard={editCard}
          removeCard={removeCard}
          editable={editable}
        />
        {editable && (
          <Modal
            open={open}
            onOpenChange={handleOpen}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </div>
  );
}
