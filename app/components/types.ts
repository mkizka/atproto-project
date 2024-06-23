import type { Card } from "@prisma/client";

export type ClientCard = Omit<Card, "id" | "boardId" | "order"> & {
  // DBではautoincrementのnumberだが、ブラウザ上ではUUIDを使う
  // firehoseから取得する際に初めてautoincrementでID(number)が割り当てられるが、
  // ブラウザ上で新規追加したものにはUUID(string)を割り当てる
  id: string | number;
};

export type ClientBoard = { cards: ClientCard[] };
