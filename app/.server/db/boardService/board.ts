import type { Prisma } from "@prisma/client";
import { Result, ResultAsync } from "neverthrow";
import { toValidationError } from "zod-validation-error";

import { isErrorOrNotNull, toPrismaError } from "~/.server/utils/errors";
import { createLogger } from "~/.server/utils/logger";
import { myAgent } from "~/api/agent";
import { type BoardScheme, boardScheme } from "~/api/validator";

import { cardService } from "../cardService";
import { prisma } from "../prisma";
import { userService } from "../userService";

const logger = createLogger("boardService");

const upsertBoard = ({
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
  const promise = tx.board.upsert({
    where: {
      userDid: handleOrDid,
    },
    update: data,
    create: data,
  });
  return ResultAsync.fromPromise(promise, toPrismaError);
};

export const createBoard = (handleOrDid: string, board: BoardScheme) => {
  const promise = prisma.$transaction(async (tx) => {
    (await userService.findOrFetchUser({ tx, handleOrDid }))._unsafeUnwrap();
    (await cardService.deleteManyInBoard({ tx, handleOrDid }))._unsafeUnwrap();
    return (await upsertBoard({ tx, handleOrDid, board }))._unsafeUnwrap();
  });
  return ResultAsync.fromPromise(promise, toPrismaError);
};

const findBoard = ({ handleOrDid }: { handleOrDid: string }) => {
  const user = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  const promise = prisma.board.findFirst({
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
  return ResultAsync.fromPromise(promise, toPrismaError);
};

// eslint-disable-next-line @typescript-eslint/unbound-method
const safeGetBoard = ResultAsync.fromThrowable(myAgent.getBoard);

const safeParseBoard = Result.fromThrowable(
  // eslint-disable-next-line @typescript-eslint/unbound-method
  boardScheme.parse,
  toValidationError(),
);

const fetchBoard = (handleOrDid: string) => {
  logger.info("ボードを取得します", { actor: handleOrDid });
  return safeGetBoard({
    repo: handleOrDid,
  })
    .andThen(safeParseBoard)
    .andThen((board) => createBoard(handleOrDid, board));
};

export const findOrFetchBoard = async ({
  handleOrDid,
}: {
  handleOrDid: string;
}) => {
  const board = await findBoard({ handleOrDid });
  if (isErrorOrNotNull(board)) {
    return board;
  }
  return fetchBoard(handleOrDid);
};
