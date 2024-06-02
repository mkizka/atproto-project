import {
  getFormProps,
  getInputProps,
  useFormMetadata,
} from "@conform-to/react";
import { Form } from "@remix-run/react";
import { err, ok, ResultAsync } from "neverthrow";
import { useLayoutEffect } from "react";
import { z } from "zod";

import { useModal } from "./ModalProvider";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";

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
    return ok(z.string().url().parse(text));
  } catch (e) {
    return err(
      `コピーしている文字がURLではありませんでした: ${truncate(text, 20)}`,
    );
  }
};

export function ModalForm() {
  const { editingCard } = useModal();
  const form = useFormMetadata();
  const fields = form.getFieldset();

  const handleClipboard = async () => {
    await readClipboard()
      .andThen(validateClipboard)
      .match(
        (url) => form.update({ name: "url", value: url }),
        (err) => alert(err),
      );
  };

  useLayoutEffect(() => {
    if (editingCard) {
      Object.entries(editingCard).forEach(([key, value]) => {
        form.update({ name: key, value });
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCard?.id]);

  return (
    <Form {...getFormProps(form)} className="flex flex-col gap-4">
      {form.errors && (
        <div id={form.errorId} className="text-destructive">
          {form.errors}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={fields.url.id}>URL</Label>
        <div className="flex gap-1">
          <Input
            {...getInputProps(fields.url, { type: "url" })}
            // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
            key={fields.url.key}
            placeholder="https://bsky.app/profile/..."
          />
          <Button type="button" variant="secondary" onClick={handleClipboard}>
            コピーから貼り付け
          </Button>
        </div>
        {fields.url.errors && (
          <div id={fields.url.errorId} className="text-destructive">
            {fields.url.errors}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={fields.text.id}>カードのタイトル</Label>
        <Input
          {...getInputProps(fields.text, { type: "text" })}
          // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
          key={fields.text.key}
          placeholder="無くてもいい"
        />
        {fields.text.errors && (
          <div id={fields.text.errorId} className="text-destructive">
            {fields.text.errors}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="text-balance text-sm text-muted-foreground">
          「コピーから貼り付け」を使うにはクリップボードの許可が必要です
        </div>
        <Button type="submit" className="ml-auto">
          追加
        </Button>
      </div>
      <input
        {...getInputProps(fields.id, { type: "text" })}
        // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
        key={fields.id.key}
        hidden
      />
    </Form>
  );
}
