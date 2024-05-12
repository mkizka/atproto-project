import type { DevMkizkaTestProfileBoard } from "~/generated/api";

type RecursiveNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export type ValidCardRecord =
  | RecursiveNonNullable<DevMkizkaTestProfileBoard.LinkCard>
  | RecursiveNonNullable<DevMkizkaTestProfileBoard.BlueskyProfileCard>;
