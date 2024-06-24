import { err, ok, Result, ResultAsync } from "neverthrow";
import { toValidationError } from "zod-validation-error";

import type { BoardScheme } from "~/api/validator";
import { boardScheme } from "~/api/validator";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { boardService } from "../db/boardService";
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

const safeCreateBoard = (userDid: string) =>
  ResultAsync.fromThrowable((board: BoardScheme) =>
    boardService.createBoard(userDid, board),
  );

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  handle(operations: FirehoseOperation[], event: RepoEvent) {
    for (const operation of operations) {
      void checkIsBoard(operation.record)
        .andThen(parseBoard)
        .asyncAndThen(safeCreateBoard(operation.repo))
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
