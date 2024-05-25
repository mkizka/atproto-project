import { DevMkizkaTestProfileBoard } from "~/generated/api";

import type { FirehoseOperation, RepoEvent } from "./base";
import { FirehoseSubscriptionBase } from "./base";

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  handle(
    operations: FirehoseOperation[],
    event: RepoEvent,
  ): void | Promise<void> {
    for (const operation of operations) {
      if (DevMkizkaTestProfileBoard.isRecord(operation.record)) {
        // eslint-disable-next-line no-console
        console.log("board operation", operation);
      }
    }
  }
}
