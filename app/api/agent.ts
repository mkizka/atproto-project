import type { AtpSessionData } from "@atproto/api";
import { BskyAgent } from "@atproto/api";

import type { AtpServiceClient } from "~/generated/api";
import { AtpBaseClient } from "~/generated/api";
import { env } from "~/utils/env";

import type { ValidCardRecord } from "./types";

const LOCALSTORAGE_SESSION_KEY = "dev.mkizka.test.session";

class MyAgent {
  client: AtpServiceClient;
  bskyAgent: BskyAgent;

  constructor({ service }: { service: string }) {
    this.client = new AtpBaseClient().service(service);
    this.bskyAgent = new BskyAgent({ service });
  }

  get dev() {
    return this.client.dev;
  }

  private getSession() {
    if (this.bskyAgent.session) {
      return this.bskyAgent.session;
    }
    const cachedSession = localStorage.getItem(LOCALSTORAGE_SESSION_KEY);
    if (!cachedSession) return null;
    return JSON.parse(cachedSession) as AtpSessionData;
  }

  private saveSession(session: AtpSessionData) {
    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(session));
  }

  async login() {
    const session = this.getSession();
    if (session) {
      await this.bskyAgent.resumeSession(session);
    } else {
      await this.bskyAgent.login({
        identifier: env.VITE_BSKY_USERNAME,
        password: env.VITE_BSKY_PASSWORD,
      });
    }
    this.client.setHeader(
      "Authorization",
      `Bearer ${this.bskyAgent.session!.accessJwt}`,
    );
    this.saveSession(this.bskyAgent.session!);
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

  async updateBoard(cards: ValidCardRecord[]) {
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
        cards,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async deleteBoard() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.dev.mkizka.test.profile.board.delete({
      repo: this.bskyAgent.session.did,
      validate: false,
      rkey: "self",
    });
  }
}

export const myAgent = new MyAgent({
  service: env.VITE_BSKY_URL,
});

export const publicBskyAgent = new BskyAgent({
  service: "https://public.api.bsky.app",
});
