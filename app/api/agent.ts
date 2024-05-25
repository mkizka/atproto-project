import type { AtpAgentLoginOpts } from "@atproto/api";
import { BskyAgent } from "@atproto/api";

import type { AtpServiceClient } from "~/generated/api";
import { AtpBaseClient } from "~/generated/api";
import { env } from "~/utils/env";

import type { BoardScheme } from "./validator";

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

  async login(options: AtpAgentLoginOpts) {
    const response = await this.bskyAgent.login(options);
    this.client.setHeader("Authorization", `Bearer ${response.data.accessJwt}`);
    return response.data;
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
      record: board,
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
