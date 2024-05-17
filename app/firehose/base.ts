import { ids, lexicons } from "@atproto/bsky/dist/lexicon/lexicons.js";
import type { OutputSchema } from "@atproto/bsky/dist/lexicon/types/com/atproto/sync/subscribeRepos.js";
import { isCommit } from "@atproto/bsky/dist/lexicon/types/com/atproto/sync/subscribeRepos.js";
import { cborToLexRecord, readCar } from "@atproto/repo";
import { Subscription } from "@atproto/xrpc-server";

export type FirehoseOperation = {
  action: string;
  uri: string;
  cid: string;
  repo: string;
  collection: string;
  record: Record<string, unknown>;
};

export type RepoEvent = OutputSchema;

type FirehoseRunOptions = {
  reconnectDelay: number;
};

export abstract class FirehoseSubscriptionBase {
  public sub: Subscription<RepoEvent>;
  private cursor: number | null = null;

  constructor(public service: string = "wss://bsky.network") {
    this.sub = new Subscription({
      service: service,
      method: ids.ComAtprotoSyncSubscribeRepos,
      getParams: () => this.getCursor(),
      validate: (value: unknown) => {
        try {
          return lexicons.assertValidXrpcMessage<RepoEvent>(
            ids.ComAtprotoSyncSubscribeRepos,
            value,
          );
        } catch (err) {
          console.error("repo subscription skipped invalid message", err);
        }
      },
    });
  }

  getCursor() {
    if (this.cursor) {
      return { cursor: this.cursor };
    }
    return {};
  }

  abstract handle(
    operations: FirehoseOperation[],
    event: RepoEvent,
  ): Promise<void> | void;

  async handleEvent(event: RepoEvent) {
    if (!isCommit(event)) return;
    const car = await readCar(event.blocks);
    const operations: FirehoseOperation[] = [];
    for (const op of event.ops) {
      if (!op.cid) continue;
      const recordBytes = car.blocks.get(op.cid);
      if (!recordBytes) continue;
      operations.push({
        action: op.action,
        cid: `${op.cid}`,
        uri: `at://${event.repo}/${op.path}`,
        collection: op.path.split("/")[0],
        repo: event.repo,
        record: cborToLexRecord(recordBytes),
      });
    }
    return this.handle(operations, event);
  }

  async run(options: FirehoseRunOptions) {
    try {
      for await (const evt of this.sub) {
        try {
          await this.handleEvent(evt);
        } catch (e) {
          console.error(e);
        }
        if (isCommit(evt)) {
          this.cursor = evt.seq;
        }
      }
    } catch (err) {
      console.error("repo subscription errored", err);
      setTimeout(() => this.run(options), options.reconnectDelay);
    }
  }
}
