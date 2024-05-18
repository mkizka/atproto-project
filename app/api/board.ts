import type { Ok } from "neverthrow";
import { ok, Result, ResultAsync } from "neverthrow";
import type { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { myAgent } from "./agent";
import type { BoardScheme, RawBoardScheme } from "./validator";
import { cardSchema, rawBoardScheme } from "./validator";

const parseBoard = Result.fromThrowable(
  (input: unknown) => rawBoardScheme.parse(input),
  (e) => fromZodError(e as ZodError),
);

const filterCards = (board: RawBoardScheme): Ok<BoardScheme, never> => {
  return ok({
    ...board,
    cards: (board.cards ?? [])
      .map((card) => {
        const parsed = cardSchema.safeParse(card);
        if (parsed.success) {
          return parsed.data;
        }
        return null;
      })
      .filter(Boolean) as BoardScheme["cards"],
  });
};

export const getBoard = (...args: Parameters<typeof myAgent.getBoard>) => {
  return ResultAsync.fromPromise(
    myAgent.getBoard(...args),
    () => new Error("Failed to get board"),
  )
    .map((response) => response.value)
    .andThen(parseBoard)
    .andThen(filterCards);
};

export const getSessionBoard = () => {
  return ResultAsync.fromPromise(
    myAgent.getSessionBoard(),
    () => new Error("Failed to login"),
  )
    .map((response) => response.value)
    .andThen(parseBoard)
    .andThen(filterCards);
};
