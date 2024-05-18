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

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  return (
    <Board profile={profile._unsafeUnwrap()} board={board._unsafeUnwrap()} />
  );
}
