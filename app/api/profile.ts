import { ResultAsync } from "neverthrow";

import { myAgent, publicBskyAgent } from "./agent";

export const getProfile = (
  ...args: Parameters<typeof publicBskyAgent.getProfile>
) => {
  return ResultAsync.fromPromise(
    publicBskyAgent.getProfile(...args),
    () => new Error("Failed to get profile"),
  )
    .map((response) => response.data)
    .unwrapOr(null);
};

export const getSessionProfile = () => {
  return ResultAsync.fromPromise(
    myAgent.getSessionProfile(),
    () => new Error("Failed to get profile"),
  )
    .map((response) => response.data)
    .unwrapOr(null);
};
