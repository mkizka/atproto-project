import type { AtpSessionData } from "@atproto/api";
import { BskyAgent } from "@atproto/api";

import { AtpBaseClient } from "~/generated/api";
import { clientEnv } from "~/utils/env.client";

const LOCALSTORAGE_SESSION_KEY = "dev.mkizka.test.session";

class MyAgent {
  constructor(
    private client = new AtpBaseClient().service(clientEnv.BSKY_URL),
    private bskyAgent = new BskyAgent({ service: clientEnv.BSKY_URL }),
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
        identifier: clientEnv.BSKY_USERNAME,
        password: clientEnv.BSKY_PASSWORD,
      });
    }
    this.client.setHeader(
      "Authorization",
      `Bearer ${this.bskyAgent.session!.accessJwt}`,
    );
    this.saveJwtToStorage(this.bskyAgent.session!);
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

  async updateBoard() {
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
        cards: [
          {
            $type: "dev.mkizka.test.profile.board#blueskyProfileCard",
            id: crypto.randomUUID(),
            handle: "mkizka.dev",
          },
          {
            $type: "dev.mkizka.test.profile.board#linkCard",
            id: crypto.randomUUID(),
            url: "https://mkizka.dev",
          },
        ],
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
