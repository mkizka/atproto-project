import type { AtpAgentLoginOpts, AtpSessionData } from "@atproto/api";
import { BskyAgent } from "@atproto/api";

import type {
  AtpServiceClient,
  DevMkizkaTestProfileBoard,
} from "~/generated/api";
import { AtpBaseClient } from "~/generated/api";

import type { BoardScheme } from "./validator";

const SESSION_STORAGE_KEY = "bluesky.session";

class MyAgent {
  readonly client: AtpServiceClient;
  readonly bskyAgent: BskyAgent;

  constructor({ service }: { service: string }) {
    this.client = new AtpBaseClient().service(service);
    this.bskyAgent = new BskyAgent({
      service,
      persistSession: (event, session) => {
        if (event === "create" || event === "update") {
          if (session) {
            this.client.setHeader(
              "Authorization",
              `Bearer ${session.accessJwt}`,
            );
          }
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        } else if (event === "expired") {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      },
    });
  }

  get dev() {
    return this.client.dev;
  }

  hasSession() {
    return this.bskyAgent.hasSession;
  }

  getSession() {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!session) {
      return null;
    }
    return JSON.parse(session) as AtpSessionData;
  }

  async resumeSessionIfExists() {
    const session = this.getSession();
    if (session) {
      await this.bskyAgent.resumeSession(session);
    }
  }

  async login(options: AtpAgentLoginOpts) {
    return await this.bskyAgent.login(options);
  }

  async getSessionProfile() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.bskyAgent.getProfile({
      actor: this.bskyAgent.session.did,
    });
  }

  async getSessionBoard() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.dev.mkizka.test.profile.board.get({
      repo: this.bskyAgent.session.did,
      rkey: "self",
    });
  }

  async getBoard({ repo }: { repo: string }) {
    return await this.dev.mkizka.test.profile.board.get({
      repo,
      rkey: "self",
    });
  }

  async updateBoard(board: BoardScheme) {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    // dev.mkizka.test.profile.boardにはなぜかputがないので、com.atproto.repoを使う
    return await this.bskyAgent.com.atproto.repo.putRecord({
      repo: this.bskyAgent.session.did,
      validate: false,
      collection: "dev.mkizka.test.profile.board",
      rkey: "self",
      record: {
        ...board,
        createdAt: board.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies DevMkizkaTestProfileBoard.Record,
    });
  }

  async deleteBoard() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    await this.dev.mkizka.test.profile.board.delete({
      repo: this.bskyAgent.session.did,
      validate: false,
      rkey: "self",
    });
  }
}

export const myAgent = new MyAgent({
  service: "https://bsky.social",
});

export const publicBskyAgent = new BskyAgent({
  service: "https://public.api.bsky.app",
});
