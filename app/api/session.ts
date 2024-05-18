import { ResultAsync } from "neverthrow";

import { myAgent } from "./agent";

export const login = () => {
  return ResultAsync.fromPromise(
    myAgent.login(),
    () => new Error("Failed to login"),
  );
};
