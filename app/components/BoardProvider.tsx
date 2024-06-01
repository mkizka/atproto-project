import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import { myAgent } from "~/api/agent";
import type { BoardScheme, CardScheme } from "~/api/validator";

type BoardContextValue = {
  cards: CardScheme[];
  setCards: (cards: CardScheme[]) => void;
  replaceCard: (card: CardScheme) => void;
  addCard: (card: Omit<CardScheme, "id">) => void;
  removeCard: (id: string) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

type Props = {
  board: BoardScheme;
  children: ReactNode;
};

export function BoardProvider({ children, board }: Props) {
  const [value, setValue] = useState<CardScheme[]>(board.cards);

  const updateBoard = (newCards: CardScheme[]) => {
    return myAgent.updateBoard({ ...board, cards: newCards });
  };

  const setCards: BoardContextValue["setCards"] = (cards) => {
    setValue(cards);
    void updateBoard(cards);
  };

  const addCard: BoardContextValue["addCard"] = (card) => {
    const newCards = [...value, { ...card, id: crypto.randomUUID() }];
    setValue(newCards);
    void updateBoard(newCards);
  };

  const replaceCard: BoardContextValue["replaceCard"] = (card) => {
    const newCards = value.map((currentCard) =>
      currentCard.id === card.id ? card : currentCard,
    );
    setValue(newCards);
    void updateBoard(newCards);
  };

  const removeCard: BoardContextValue["removeCard"] = (id) => {
    const newCards = value.filter((card) => card.id !== id);
    setValue(newCards);
    void updateBoard(newCards);
  };

  return (
    <BoardContext.Provider
      value={{ cards: value, setCards, addCard, replaceCard, removeCard }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === null) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};
