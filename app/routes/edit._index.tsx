import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { myAgent } from "~/api/agent";
import { getSessionBoard } from "~/api/board";
import { getSessionProfile } from "~/api/profile";
import { Board } from "~/components/Board";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  await myAgent.login();
  return {
    profile: await getSessionProfile(),
    board: await getSessionBoard(),
  };
}

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  if (profile.isErr()) {
    throw profile.error;
  }
  if (board.isErr()) {
    throw board.error;
  }
  return <Board profile={profile.value} board={board.value} editable />;
}
