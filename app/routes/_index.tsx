import type { MetaFunction } from "@remix-run/node";
import { ArrowUp } from "lucide-react";

import { Board } from "~/components/Board";
import { LoginForm } from "~/components/LoginForm";
import { useSession } from "~/components/SessionProvider";
import { Button } from "~/components/shadcn/ui/button";
import { Card } from "~/components/shadcn/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const session = useSession();
  return (
    <div className="grid gap-8">
      <Board
        user={{
          handle: "example.bsky.app",
          avatar: null,
        }}
        board={{
          cards: [
            {
              id: "1",
              text: null,
              url: "https://bsky.app/profile/did:plc:4gow62pk3vqpuwiwaslcwisa/post/3krfvqn7v2d2n",
            },
            {
              id: "2",
              text: "Blueskyへのリンク",
              url: "https://bsky.app/profile/bsky.app",
            },
            {
              id: "3",
              text: "Xへのリンク",
              url: "https://x.com/x",
            },
          ],
        }}
      />
      <div className="flex flex-col items-center">
        <ArrowUp className="size-12" />
        <p className="text-xl">こういうのを作ろう</p>
      </div>
      {session.data ? (
        <Card className="flex justify-center p-8">
          <Button size="lg" asChild>
            <a href={`/edit?base=${session.data.handle}`}>作りに行く</a>
          </Button>
        </Card>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
