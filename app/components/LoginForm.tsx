import { useNavigate } from "@remix-run/react";
import { err, ok, ResultAsync } from "neverthrow";
import type { FormEvent } from "react";
import { useRef } from "react";
import { z } from "zod";

import { useSession } from "./SessionProvider";
import { Button } from "./shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";

const formScheme = z.object({
  identifier: z.string().min(1, "ハンドルは1文字以上である必要があります"),
  password: z
    .string()
    .min(1, "パスワードは1文字以上である必要があります")
    .regex(/^[a-z0-9-]+$/, "パスワードはアプリパスワードしか使用できません"),
});

const validateForm = (form: { identifier: string; password: string }) => {
  const result = formScheme.safeParse(form);
  if (!result.success) {
    return err(result.error.issues[0].message);
  }
  return ok(result.data);
};

export function LoginForm() {
  const session = useSession();
  const navigate = useNavigate();
  const handleRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const loginWithBluesky = ResultAsync.fromThrowable(
    session.login,
    () => "ログインに失敗しました",
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ok({
      identifier: handleRef.current!.value,
      password: passwordRef.current!.value,
    })
      .andThen(validateForm)
      .asyncAndThen(loginWithBluesky)
      .match(
        (response) => navigate(`/board/${response.handle}`),
        (error) => alert(error),
      );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blueskyアカウントでログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="handle">ハンドル(またはDID)</Label>
            <Input
              id="handle"
              placeholder="example.bsky.social"
              autoComplete="username"
              required
              ref={handleRef}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">アプリパスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="abcd-efgh-ijkl-mnop"
              autoComplete="current-password"
              required
              ref={passwordRef}
            />
          </div>
          <div className="flex justify-end">
            <Button>ログイン</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
