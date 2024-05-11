import type { DevMkizkaTestProfileBoard } from "~/generated/api";

export type CardRecord =
  | DevMkizkaTestProfileBoard.LinkCard
  | DevMkizkaTestProfileBoard.BlueskyProfileCard;
