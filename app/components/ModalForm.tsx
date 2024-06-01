import type { SubmissionResult } from "@conform-to/react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { err, ok, okAsync, ResultAsync } from "neverthrow";
import { useState } from "react";
import { z } from "zod";

import { resolveHandleIfNeeded } from "~/utils/urls";

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

const resolveHandleInUrl = ResultAsync.fromThrowable(
  (url: string) => resolveHandleIfNeeded(url),
  () => "URLに含まれているハンドルの解決に失敗しました",
);

const schema = z.object({
  url: z
    .string({ message: "入力してください" })
    .url({ message: "URLを入力してください" }),
  id: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type Props = {
  onSubmit: (url: string) => void;
};

export function ModalForm({ onSubmit }: Props) {
  const { setOpen } = useModal();
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [form, fields] = useForm<Schema>({
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: async (event, { submission }) => {
      event.preventDefault();
      if (!submission) throw new Error("予期せぬエラー");
      await okAsync(submission.payload.url as string)
        .andThen(resolveHandleInUrl)
        .map((url) => url.toString())
        .match(
          (url) => {
            onSubmit(url);
            setOpen(false);
          },
          (err) => alert(err),
        );
      const result = submission.reply();
      setLastResult(result);
      return result;
    },
  });
  const handleClipboard = async () => {
    await readClipboard()
      .andThen(validateClipboard)
      .andThen(resolveHandleInUrl)
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
