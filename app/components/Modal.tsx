import type { DialogProps } from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type { FormEvent } from "react";
import { useRef } from "react";

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
  () => new Error("クリップボードから読み込めませんでした"),
);

const parseUrl = Result.fromThrowable<(text: string) => string, Error>(
  (text) => {
    try {
      return new URL(text).toString();
    } catch (e) {
      throw new Error(
        `コピーしている文字がURLではありませんでした: ${truncate(text, 20)}`,
      );
    }
  },
);

const confirmToAdd = (url: string): Result<string, Error> => {
  if (confirm(`${url} を追加しますか？`)) {
    return ok(url);
  }
  return err(new Error("キャンセルされました"));
};

export function Modal({ onSubmit, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(ref.current!.value);
    ref.current!.value = "";
  };

  const handleSubmitFromClipboard = () => {
    void readClipboard()
      .andThen(parseUrl)
      .andThen(confirmToAdd)
      .match(
        (url) => onSubmit(url),
        (err) => alert(err.message),
      );
  };

  return (
    <Dialog {...props}>
      {!props.open && (
        <DialogTrigger asChild>
          <Card
            as="button"
            className="flex h-16 items-center justify-center hover:opacity-70"
          >
            <CirclePlus className="stroke-current text-muted-foreground" />
          </Card>
        </DialogTrigger>
      )}
      <DialogContent className="top-48 max-w-[90vw] gap-4 sm:max-w-[600px]">
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
