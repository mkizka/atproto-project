import { useLoaderData } from "@remix-run/react";

import { myAgent } from "~/api/agent";
import { Board } from "~/components/Board";

export async function clientLoader() {
  await myAgent.login();
  return {
    profile: await myAgent
      .getSessionProfile()
      .then((response) => response.data),
    board: await myAgent
      .getSessionBoard() //
      .then((response) => response.value),
  };
}

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  return (
    <Board
      // @ts-expect-error
      profile={profile}
      board={board}
      editable
    />
  );
}
