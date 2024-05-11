import { BskyAgent } from "@atproto/api";

import { clientEnv } from "~/utils/env.client";

// const atpClient = new AtpBaseClient()
// export const atpClient = client.service("http://localhost:3000")

const agent = new BskyAgent({
  service: clientEnv.BSKY_URL,
});

export const updateCards = async () => {
  if (!agent.hasSession) {
    await agent.login({
      identifier: clientEnv.BSKY_USERNAME,
      password: clientEnv.BSKY_PASSWORD,
    });
  }
  console.log(agent.session);
};
