import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useNavigate, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

import { useSession } from "./SessionProvider";
import { Button } from "./shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";

const schema = z.object({
  identifier: z
    .string({ required_error: "入力してください" })
    .regex(/\./, "example.bsky.socialのように指定してください")
    .min(1, "ハンドルは1文字以上である必要があります"),
  password: z
    .string({ required_error: "入力してください" })
    .min(1, "パスワードは1文字以上である必要があります")
    .regex(/^[a-z0-9-]+$/, "パスワードはアプリパスワードしか使用できません"),
});

type Schema = z.infer<typeof schema>;

export function LoginForm() {
  const session = useSession();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  const [form, fields] = useForm<Schema>({
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      setSubmitting(true);
      return parseWithZod(formData, { schema });
    },
    onSubmit: async (event, { submission }) => {
      event.preventDefault();
      if (!submission) throw new Error("予期せぬエラーが発生しました");
      try {
        const response = await session.login(submission.payload as Schema);
        navigate(`/edit?base=${response.handle}`);
      } catch {
        alert("ログインに失敗しました");
      }
      setSubmitting(false);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blueskyアカウントでログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form {...getFormProps(form)} className="grid gap-4">
          {form.errors && (
            <div id={form.errorId} className="text-destructive">
              {form.errors}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="handle">ハンドル(またはDID)</Label>
            <Input
              {...getInputProps(fields.identifier, { type: "text" })}
              placeholder="example.bsky.social"
              autoComplete="username"
            />
            {fields.identifier.errors && (
              <div id={fields.identifier.errorId} className="text-destructive">
                {fields.identifier.errors}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">アプリパスワード</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              placeholder="abcd-efgh-ijkl-mnop"
              autoComplete="current-password"
            />
            {fields.password.errors && (
              <div id={fields.password.errorId} className="text-destructive">
                {fields.password.errors}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button>
              {submitting || navigation.state === "loading"
                ? "ログイン中..."
                : "ログイン"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
