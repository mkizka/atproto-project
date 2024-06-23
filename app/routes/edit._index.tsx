import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useLayoutEffect } from "react";

import { Board } from "~/components/Board";
import { useSession } from "~/components/SessionProvider";
import type { ClientBoard } from "~/components/types";

import { findProfileAndBoard } from "./shared";

const defaultBoard = {
  cards: [],
} satisfies ClientBoard;

export async function loader({ params }: LoaderFunctionArgs) {
  const result = await findProfileAndBoard(params.handle!);
  if (!result) {
    return json({
      profile: null,
      board: defaultBoard,
    });
  }
  return json({
    profile: result.profile,
    board: result.board,
  });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const session = useSession();

  useLayoutEffect(() => {
    if (!session.data) {
      navigate("/", { replace: true });
    }
  }, [navigate, session.data]);

  if (!profile) {
    return null;
  }
  return <Board profile={profile} board={board} editable />;
}
