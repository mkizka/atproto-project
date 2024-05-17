import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { myAgent, publicBskyAgent } from "~/api/agent";
import { Board } from "~/components/Board";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return {
    profile: await publicBskyAgent
      .getProfile({
        actor: params.handle!,
      })
      .then((response) => response.data),
    board: await myAgent
      .getBoard({
        repo: params.handle!,
      })
      .then((response) => response.value)
      .catch(
        // TODO: いい感じにハンドリングする
        () => ({ cards: [], createdAt: new Date().toISOString() }),
      ),
  };
}

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  return <Board profile={profile} board={board} />;
}
