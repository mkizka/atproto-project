import type { MetaFunction } from "@remix-run/node";

import { Board } from "~/components/Board";
import { LoginForm } from "~/components/LoginForm";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <Board
        profile={{
          handle: "example.bsky.app",
        }}
        board={{
          cards: [
            {
              id: "1",
              url: "https://bsky.app/profile/did:plc:4gow62pk3vqpuwiwaslcwisa/post/3krfvqn7v2d2n",
            },
            { id: "2", url: "https://ここを長押しで並び替え.example.com" },
            { id: "3", url: "https://example.com" },
          ],
        }}
        editable
      />
      <LoginForm />
    </>
  );
}
