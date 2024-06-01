import {
  getFormProps,
  getInputProps,
  useField,
  useFormMetadata,
} from "@conform-to/react";
import { Form } from "@remix-run/react";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

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
  const form = useFormMetadata();
  const [url] = useField("url");
  const [id] = useField("id");
  const fields = { url, id };

  const handleClipboard = async () => {
    await readClipboard()
      .andThen(validateClipboard)
      .match(
        (url) => form.update({ name: "url", value: url }),
        (err) => alert(err),
      );
  };

  return (
    <Form {...getFormProps(form)}>
      <div id={form.errorId}>{form.errors}</div>
      <div className="mb-2">
        <Label htmlFor={fields.url.id}>URL</Label>
        <Input
          {...getInputProps(fields.url, { type: "url" })}
          placeholder="https://bsky.app/profile/..."
        />
        <div id={fields.url.errorId} className="mt-2 text-destructive">
          {fields.url.errors}
        </div>
      </div>
      <div className="mb-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={handleClipboard}>
          コピーしたURLを貼り付け
        </Button>
        <Button type="submit">追加</Button>
      </div>
      <p className="text-balance text-end text-sm text-muted-foreground">
        「コピーしたURLを追加」を使うにはクリップボードの許可が必要です
      </p>
      <input id={fields.id.id} type="email" name={fields.id.name} hidden />
    </Form>
  );
}
