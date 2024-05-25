import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { myAgent } from "~/api/agent";
import { getSessionBoard } from "~/api/board";
import { getSessionProfile } from "~/api/profile";
import { Board } from "~/components/Board";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return {
    profile: await getSessionProfile(),
    board: await getSessionBoard(),
  };
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  return (
    <Board
      profile={profile._unsafeUnwrap()}
      board={board._unsafeUnwrap()}
      onBoardUpdate={(board) => myAgent.updateBoard(board)}
      editable
    />
  );
}
