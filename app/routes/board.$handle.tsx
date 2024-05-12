import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { bskyAgent } from "~/api/agent";
import { Board } from "~/components/Board";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const response = await bskyAgent.getProfile({
    actor: params.handle!,
  });
  return response.data;
}

export { HydrateFallback } from "~/components/HydrateFallback";

export default function Index() {
  const profile = useLoaderData<typeof clientLoader>();
  return (
    <>
      <section className="flex w-full justify-center py-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>
            {profile.handle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </section>
      <section className="w-full">
        <Board />
      </section>
    </>
  );
}
