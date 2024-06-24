import type { Prisma } from "@prisma/client";

import type { BoardScheme } from "~/api/validator";

import { cardService } from "../cardService";
import { prisma } from "../prisma";
import { userService } from "../userService";

const upsertBoard = async ({
  tx,
  userDid,
  board,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
  board: BoardScheme;
}) => {
  const data = {
    user: {
      connect: {
        did: userDid,
      },
    },
    cards: {
      create: board.cards.map((card, index) => ({
        url: card.url,
        text: card.text,
        order: index,
      })),
    },
  } satisfies Prisma.BoardUpsertArgs["create"];
  return await tx.board.upsert({
    where: {
      userDid,
    },
    update: data,
    create: data,
  });
};

export const createBoard = async (userDid: string, board: BoardScheme) => {
  return await prisma.$transaction(async (tx) => {
    await userService.findOrFetchUser({ tx, userDid });
    await cardService.deleteManyInBoard({ tx, userDid });
    return await upsertBoard({ tx, userDid, board });
  });
};
