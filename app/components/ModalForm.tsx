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
    <Form {...getFormProps(form)} className="flex flex-col gap-2">
      {form.errors && (
        <div id={form.errorId} className="text-destructive">
          {form.errors}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Label htmlFor={fields.text.id}>テキスト</Label>
        <Input
          {...getInputProps(fields.text, { type: "text" })}
          // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
          key={fields.text.key}
        />
        {fields.text.errors && (
          <div id={fields.text.errorId} className="text-destructive">
            {fields.text.errors}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={fields.url.id}>URL</Label>
        <Input
          {...getInputProps(fields.url, { type: "url" })}
          // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
          key={fields.url.key}
          placeholder="https://bsky.app/profile/..."
        />
        {fields.url.errors && (
          <div id={fields.url.errorId} className="text-destructive">
            {fields.url.errors}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={handleClipboard}>
          コピーしたURLを貼り付け
        </Button>
        <Button type="submit">追加</Button>
      </div>
      <p className="text-balance text-end text-sm text-muted-foreground">
        「コピーしたURLを追加」を使うにはクリップボードの許可が必要です
      </p>
      <input
        {...getInputProps(fields.id, { type: "text" })}
        // https://github.com/edmundhung/conform/issues/600#issuecomment-2074577745
        key={fields.id.key}
        hidden
      />
    </Form>
  );
}
