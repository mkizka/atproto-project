import { useEffect, useState } from "react";

import { myAgent } from "~/api/agent";
import type { ValidCardRecord } from "~/api/types";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";

export function Board() {
  const [cards, setCards] = useState<ValidCardRecord[] | null>(null);

  useEffect(() => {
    const updateCards = async () => {
      await myAgent.login();
      const board = await myAgent.getBoard();
      const validBoard = DevMkizkaTestProfileBoard.validateRecord(board.value);
      if (validBoard.success) {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setCards(validBoard.value.cards);
      }
    };
    void updateCards();
  }, []);

  if (!cards) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Button onClick={() => myAgent.login()}>Sign in</Button>
      <Button onClick={() => myAgent.updateBoard()}>Save</Button>
      <Button onClick={() => myAgent.deleteBoard()}>Delete</Button>
      <Sortable cards={cards} setItems={setCards} />
    </div>
  );
}
