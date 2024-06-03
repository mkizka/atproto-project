import type { MetaFunction } from "@remix-run/node";
import { ArrowUp } from "lucide-react";

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
    <div className="grid gap-8">
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
            {
              id: "2",
              text: "ここを長押しで並び替えられます",
              url: location.href,
            },
            {
              id: "3",
              text: "この内容はリロードすると元に戻ります",
              url: location.href,
            },
          ],
        }}
      />
      <div className="flex flex-col items-center">
        <ArrowUp className="size-12" />
        <p className="text-xl">こういうのを作ろう</p>
      </div>
      <LoginForm />
    </div>
  );
}
