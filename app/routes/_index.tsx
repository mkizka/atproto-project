import { Label } from "@radix-ui/react-label";
import type { MetaFunction } from "@remix-run/node";

import { Board } from "~/components/Board";
import { Button } from "~/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/shadcn/ui/card";
import { Input } from "~/components/shadcn/ui/input";

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
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>こういうページを作ろう</CardTitle>
          <CardDescription>
            URLを貼りつけるだけでこういうページが作れます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="handle">ハンドル(またはDID)</Label>
                <Input id="handle" placeholder="example.bsky.app" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">アプリパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="abcd-efgh-ijklm-nopq"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </>
  );
}
