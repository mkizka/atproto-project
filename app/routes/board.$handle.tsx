import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { getBoard } from "~/api/board";
import { getProfile } from "~/api/profile";
import { Board } from "~/components/Board";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return {
    profile: await getProfile({
      actor: params.handle!,
    }),
    board: await getBoard({
      repo: params.handle!,
    }),
  };
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  if (!profile || !board) {
    return <p>TODO: 404を返す</p>;
  }
  return <Board profile={profile} board={board} />;
}
