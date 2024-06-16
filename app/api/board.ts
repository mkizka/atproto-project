import { Result, ResultAsync } from "neverthrow";
import type { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { myAgent } from "./agent";
import { boardScheme } from "./validator";

const parseBoard = Result.fromThrowable(
  (input: unknown) => boardScheme.parse(input),
  (e) => fromZodError(e as ZodError),
);

export const getBoard = (...args: Parameters<typeof myAgent.getBoard>) => {
  return ResultAsync.fromPromise(
    myAgent.getBoard(...args),
    () => new Error("Failed to get board"),
  )
    .map((response) => response.value)
    .andThen(parseBoard)
    .unwrapOr(null);
};

export const getSessionBoard = () => {
  return ResultAsync.fromPromise(
    myAgent.getSessionBoard(),
    () => new Error("Failed to login"),
  )
    .map((response) => response.value)
    .andThen(parseBoard)
    .unwrapOr(null);
};
