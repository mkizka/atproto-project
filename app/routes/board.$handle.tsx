import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { boardService } from "~/.server/db/boardService";
import { userService } from "~/.server/db/userService";
import { Board } from "~/components/Board";

export async function loader({ params }: LoaderFunctionArgs) {
  const handleOrDid = params.handle!;
  const board = await boardService.findOrFetchBoard({ handleOrDid });
  if (board.isErr() || board.value === null) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const profile = await userService.findOrFetchUser({ handleOrDid });
  if (profile.isErr() || profile.value === null) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json({ board: board.value, profile: profile.value });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  return <Board user={profile} board={board} />;
}
