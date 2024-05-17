import type { FirehoseOperation, RepoEvent } from "./base";
import { FirehoseSubscriptionBase } from "./base";

class FirehoseSubscription extends FirehoseSubscriptionBase {
  handle(
    operations: FirehoseOperation[],
    event: RepoEvent,
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}
