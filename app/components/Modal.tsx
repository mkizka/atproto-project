import type { DialogProps } from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import type { Result } from "neverthrow";
import { err, ok, okAsync, ResultAsync } from "neverthrow";
import type { FormEvent } from "react";
import { useRef } from "react";

import { resolveHandleIfNeeded } from "~/utils/urls";

import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/ui/dialog";
import { Input } from "./shadcn/ui/input";

type Props = {
  onSubmit: (input: string) => void;
} & DialogProps;

const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};

const readClipboard = ResultAsync.fromThrowable(
  () => navigator.clipboard.readText(),
  () => "クリップボードから読み込めませんでした",
);

const validateClipboard = (text: string) => {
  if (!text) return err("何もコピーしていませんでした");
  try {
    return ok(new URL(text));
  } catch (e) {
    return err(
      `コピーしている文字がURLではありませんでした: ${truncate(text, 20)}`,
    );
  }
};

const resolveHandleInUrl = ResultAsync.fromThrowable(
  (url: URL) => resolveHandleIfNeeded(url),
  () => "URLに含まれているハンドルの解決に失敗しました",
);

const confirmToAdd = (url: string): Result<string, string> => {
  if (confirm(`${url} を追加しますか？`)) {
    return ok(url);
  }
  return err("キャンセルされました");
};

export function Modal({ onSubmit, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void okAsync(new URL(ref.current!.value))
      .andThen(resolveHandleInUrl)
      .match(
        (url) => {
          onSubmit(url);
          ref.current!.value = "";
        },
        (err) => {
          alert(err);
        },
      );
  };

  const handleSubmitFromClipboard = () => {
    void readClipboard()
      .andThen(validateClipboard)
      .andThen(resolveHandleInUrl)
      .andThen(confirmToAdd)
      .match(
        (url) => {
          onSubmit(url);
        },
        (err) => {
          alert(err);
        },
      );
  };

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Card
          as="button"
          className="flex h-16 items-center justify-center gap-2 text-muted-foreground hover:opacity-70"
        >
          <CirclePlus className="stroke-current" />
          <p className="mr-6">カードを追加</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="top-48 max-w-[90vw] gap-4 sm:max-w-screen-sm">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>URLを追加</DialogTitle>
            <DialogDescription>Bluesky以外のURLも使えます</DialogDescription>
          </DialogHeader>
          <Input
            id="url"
            type="url"
            ref={ref}
            placeholder="https://bsky.app/profile/..."
            className="w-full"
            required
          />
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmitFromClipboard}
            >
              コピーしたURLを追加
            </Button>
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
        <p className="text-balance text-end text-sm text-muted-foreground">
          「コピーしたURLを追加」を使うにはクリップボードの許可が必要です
        </p>
      </DialogContent>
    </Dialog>
  );
}
