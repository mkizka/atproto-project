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

  async createBoard() {
    if (!this.bskyAgent.session) {
      throw new Error("Not logged in");
    }
    return await this.dev.mkizka.test.profile.board.create(
      {
        repo: this.bskyAgent.session.did,
        validate: false,
      },
      {
        cards: [
          {
            $type: "dev.mkizka.test.profile.defs#blueskyCard",
            handle: "https://example.com",
          },
        ],
        createdAt: new Date().toISOString(),
      },
    );
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
