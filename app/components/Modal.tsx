import type { DialogProps } from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
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

const safeUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};

const readClipboard = async () => {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
};

export function Modal({ onSubmit, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ref.current) {
      alert("予期せぬエラー");
      return;
    }
    const url = safeUrl(ref.current.value);
    if (!url) {
      alert("URLが不正です");
      return;
    }
    onSubmit(ref.current.value);
    ref.current.value = "";
  };

  const handleSubmitFromClipboard = async () => {
    const clipboard = await readClipboard();
    if (!clipboard) {
      alert("クリップボードから読み込めませんでした");
      return;
    }
    const url = safeUrl(clipboard);
    if (!url) {
      alert(
        `コピーされた文字がURLではありませんでした: ${truncate(clipboard, 20)}`,
      );
      return;
    }
    const ok = confirm(`${clipboard} を追加しますか？`);
    if (ok) {
      onSubmit(clipboard);
    }
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
      <DialogContent className="top-48 max-w-[90vw] gap-2 sm:max-w-[600px]">
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
