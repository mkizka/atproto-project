import { useEffect, useState } from "react";

import { myAgent } from "~/api/agent.client";
import type { CardRecord } from "~/api/types";

import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";

export function Board() {
  const [cards, setCards] = useState<CardRecord[] | null>(null);

  useEffect(() => {
    const updateCards = async () => {
      await myAgent.login();
      const board = await myAgent.getBoard();
      console.log(board.value.cards);
      setCards(board.value.cards);
    };
    void updateCards();
  }, []);

  if (!cards) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Button onClick={() => myAgent.login()}>Sign in</Button>
      <Button onClick={() => myAgent.createBoard()}>Save</Button>
      <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
      <Sortable items={cards} setItems={setCards} />
    </div>
  );
}
