import type { Prisma } from "@prisma/client";

import { createLogger } from "~/.server/utils/logger";
import { myAgent } from "~/api/agent";
import { type BoardScheme, boardScheme } from "~/api/validator";

import { cardService } from "../cardService";
import { prisma } from "../prisma";
import { userService } from "../userService";

const logger = createLogger("boardService");

const upsertBoard = async ({
  tx,
  handleOrDid,
  board,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
  board: BoardScheme;
}) => {
  const connect = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  const data = {
    user: {
      connect,
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
      userDid: handleOrDid,
    },
    update: data,
    create: data,
  });
};

export const createBoard = async (handleOrDid: string, board: BoardScheme) => {
  return await prisma.$transaction(async (tx) => {
    await userService.findOrFetchUser({ tx, handleOrDid });
    await cardService.deleteManyInBoard({ tx, handleOrDid });
    return await upsertBoard({ tx, handleOrDid, board });
  });
};

const findBoard = async ({ handleOrDid }: { handleOrDid: string }) => {
  const user = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  return await prisma.board.findFirst({
    where: {
      user,
    },
    include: {
      cards: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

const fetchBoardInPDS = async (handleOrDid: string) => {
  logger.info("boardを取得します", { handleOrDid });
  const response = await myAgent.getBoard({
    repo: handleOrDid,
  });
  const parsed = boardScheme.safeParse(response.value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
};

export const findOrFetchBoard = async ({
  handleOrDid,
}: {
  handleOrDid: string;
}) => {
  const board = await findBoard({ handleOrDid });
  if (board) {
    return board;
  }
  const boardInPDS = await fetchBoardInPDS(handleOrDid);
  if (!boardInPDS) {
    return null;
  }
  const newBoard = await createBoard(handleOrDid, boardInPDS);
  return {
    ...newBoard,
    cards: [],
  };
};
