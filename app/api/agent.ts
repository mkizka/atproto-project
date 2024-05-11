import { BskyAgent } from "@atproto/api";

import { AtpBaseClient } from "~/generated/api";
import { clientEnv } from "~/utils/env.client";

export const updateCards = async () => {
  const bskyAgent = new BskyAgent({
    service: clientEnv.BSKY_URL,
  });
  if (!bskyAgent.hasSession) {
    await bskyAgent.login({
      identifier: clientEnv.BSKY_USERNAME,
      password: clientEnv.BSKY_PASSWORD,
    });
  }
  const myAgent = new AtpBaseClient().service(clientEnv.BSKY_URL);
  console.log(bskyAgent.session!.accessJwt);
  myAgent.setHeader("Authorization", `Bearer ${bskyAgent.session!.accessJwt}`);
  await myAgent.dev.mkizka.test.profile.board.create(
    {
      repo: clientEnv.BSKY_USERNAME,
      validate: false,
    },
    {
      cards: [
        {
          type: "test2",
          link: "https://example.com",
        },
      ],
      createdAt: new Date().toISOString(),
    },
  );
};
