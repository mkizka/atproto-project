import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import type { BoardScheme, CardScheme } from "~/api/validator";

type BoardContextValue = {
  value: BoardScheme;
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
  const [cards, setCards] = useState<CardScheme[]>(board.cards);

  const addCard: BoardContextValue["addCard"] = (card) => {
    const newCards = [...cards, { ...card, id: crypto.randomUUID() }];
    setCards(newCards);
  };

  const replaceCard: BoardContextValue["replaceCard"] = (card) => {
    const newCards = cards.map((currentCard) =>
      currentCard.id === card.id ? card : currentCard,
    );
    setCards(newCards);
  };

  const removeCard: BoardContextValue["removeCard"] = (id) => {
    const newCards = cards.filter((card) => card.id !== id);
    setCards(newCards);
  };

  const value = {
    ...board,
    cards,
  };

  return (
    <BoardContext.Provider
      value={{
        value,
        setCards,
        addCard,
        replaceCard,
        removeCard,
      }}
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
