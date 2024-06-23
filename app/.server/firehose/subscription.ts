import type { Prisma } from "@prisma/client";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { toValidationError } from "zod-validation-error";

import { publicBskyAgent } from "~/api/agent";
import type { BoardScheme } from "~/api/validator";
import { boardScheme } from "~/api/validator";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { prisma } from "../db/prisma";
import type { FirehoseOperation, RepoEvent } from "./base";
import { FirehoseSubscriptionBase } from "./base";

const checkIsBoard = (
  record: Record<string, unknown>,
): Result<DevMkizkaTestProfileBoard.Record, null> => {
  return DevMkizkaTestProfileBoard.isRecord(record) ? ok(record) : err(null);
};

const parseBoard = Result.fromThrowable(
  (record: DevMkizkaTestProfileBoard.Record) => boardScheme.parse(record),
  toValidationError(),
);

const createUserIfNotExists = async (
  userDid: string,
): Promise<Result<string, Error>> => {
  const user = await prisma.user.findUnique({
    where: {
      did: userDid,
    },
  });
  if (user) {
    return ok(userDid);
  }
  const blueskyUser = await publicBskyAgent.getProfile({
    actor: userDid,
  });
  if (!blueskyUser.success) {
    return err(new Error("Blueskyからのユーザー取得に失敗しました"));
  }
  await prisma.user.create({
    data: {
      did: userDid,
      description: blueskyUser.data.description,
      displayName: blueskyUser.data.displayName,
      handle: blueskyUser.data.handle,
    },
  });
  return ok(userDid);
};

const createBoard = (userDid: string) =>
  ResultAsync.fromThrowable(
    async (board: BoardScheme) => {
      const result = await createUserIfNotExists(userDid);
      if (result.isErr()) {
        throw result.error;
      }
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
      return await prisma.board.upsert({
        where: {
          userDid,
        },
        update: data,
        create: data,
      });
    },
    (e) => new Error("Failed to create board", { cause: e }),
  );

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  handle(operations: FirehoseOperation[], event: RepoEvent) {
    for (const operation of operations) {
      void checkIsBoard(operation.record)
        .andThen(parseBoard)
        .asyncAndThen(createBoard(operation.repo))
        .match(
          (board) => {
            // eslint-disable-next-line no-console
            console.log("board created", board);
          },
          (error) => {
            if (!error) return;
            // eslint-disable-next-line no-console
            console.error(error);
          },
        );
    }
  }
}
