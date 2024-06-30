import type { Prisma } from "@prisma/client";
import { ok, okAsync, Result, ResultAsync } from "neverthrow";
import { toValidationError } from "zod-validation-error";

import { createLogger } from "~/.server/utils/logger";
import { toPrismaError, toXRPCError } from "~/.server/utils/neverthrow";
import { myAgent } from "~/api/agent";
import { type BoardScheme, boardScheme } from "~/api/validator";
import type { DevMkizkaTestProfileBoard } from "~/generated/api";

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
    include: {
      user: true,
      cards: true,
    },
  });
  return ResultAsync.fromPromise(promise, toPrismaError).map((board) => ({
    ...board,
    cards: board.cards.sort((a, b) => a.order - b.order),
  }));
};

const safeParseBoard = Result.fromThrowable(
  // eslint-disable-next-line @typescript-eslint/unbound-method
  boardScheme.parse,
  toValidationError(),
);

const createBoard = (handleOrDid: string) => (board: BoardScheme) => {
  const promise = prisma.$transaction((tx) => {
    return userService
      .findOrFetchUser({ tx, handleOrDid })
      .andThen(() => userService.findOrFetchUser({ tx, handleOrDid }))
      .andThen(() => cardService.deleteManyInBoard({ tx, handleOrDid }))
      .andThen(() => upsertBoard({ tx, handleOrDid, board }))
      .match(
        (value) => value,
        (error) => {
          throw error;
        },
      );
  });
  return ResultAsync.fromPromise(promise, toPrismaError);
};

export const parseAndCreateBoard = ({
  handleOrDid,
  board,
}: {
  handleOrDid: string;
  board: DevMkizkaTestProfileBoard.Record;
}) => {
  return safeParseBoard(board).asyncAndThen(createBoard(handleOrDid));
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
      user: true,
      cards: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return ResultAsync.fromPromise(promise, toPrismaError);
};

const safeGetBoard = (handleOrDid: string) => {
  const promise = ResultAsync.fromPromise(
    myAgent.getBoard({ repo: handleOrDid }),
    toXRPCError,
  )
    .mapErr((error) => {
      logger.warn("ボードの取得に失敗しました", {
        error,
      });
      return error;
    })
    .unwrapOr(null);
  return ResultAsync.fromSafePromise(promise);
};

const fetchBoard = (handleOrDid: string) => {
  logger.info("ボードを取得します", { actor: handleOrDid });
  return safeGetBoard(handleOrDid).andThen((board) => {
    if (!board) return okAsync(null);
    return parseAndCreateBoard({ handleOrDid, board: board.value });
  });
};

export const findOrFetchBoard = ({ handleOrDid }: { handleOrDid: string }) => {
  return findBoard({ handleOrDid }).andThen((board) => {
    if (board) return ok(board);
    return fetchBoard(handleOrDid);
  });
};
