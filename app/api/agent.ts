import type { AtpSessionData } from "@atproto/api";
import { BskyAgent } from "@atproto/api";

import { AtpBaseClient } from "~/generated/api";
import { env } from "~/utils/env";

import type { ValidCardRecord } from "./types";

const LOCALSTORAGE_SESSION_KEY = "dev.mkizka.test.session";

class MyAgent {
  constructor(
    private client = new AtpBaseClient().service(env.VITE_BSKY_URL),
    private bskyAgent = new BskyAgent({ service: env.VITE_BSKY_URL }),
  ) {}

  get dev() {
    return this.client.dev;
  }

  private loadJwtFromStorage() {
    const accessJwt = localStorage.getItem(LOCALSTORAGE_SESSION_KEY);
    if (!accessJwt) return null;
    return JSON.parse(accessJwt) as AtpSessionData;
  }

  private saveJwtToStorage(jwt: AtpSessionData) {
    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(jwt));
  }

  async login() {
    const session = this.loadJwtFromStorage();
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
    this.saveJwtToStorage(this.bskyAgent.session!);
  }

  async getProfile() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.bskyAgent.getProfile({
      actor: this.bskyAgent.session.did,
    });
  }

  async getBoard() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.dev.mkizka.test.profile.board.get({
      repo: this.bskyAgent.session.did,
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

export const myAgent = new MyAgent();

export const bskyAgent = new BskyAgent({
  service: "https://public.api.bsky.app",
});
