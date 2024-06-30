import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { boardService } from "../db/boardService";
import type { FirehoseOperation, RepoEvent } from "./base";
import { FirehoseSubscriptionBase } from "./base";

const checkIsBoard = (
  record: Record<string, unknown>,
): Result<DevMkizkaTestProfileBoard.Record, null> => {
  return DevMkizkaTestProfileBoard.isRecord(record) ? ok(record) : err(null);
};

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  handle(operations: FirehoseOperation[], event: RepoEvent) {
    for (const operation of operations) {
      void checkIsBoard(operation.record)
        .asyncAndThen((board) =>
          boardService.parseAndCreateBoard({
            handleOrDid: operation.repo,
            board,
          }),
        )
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
