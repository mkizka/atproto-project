import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Board } from "~/components/Board";

import { findProfileAndBoard } from "./shared";

export async function loader({ params }: LoaderFunctionArgs) {
  const result = await findProfileAndBoard(params.handle!);
  if (!result) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json({
    profile: result.profile,
    board: result.board,
  });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  return <Board user={profile} board={board} />;
}
