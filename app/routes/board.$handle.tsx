import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { bskyAgent } from "~/api/agent.client";
import { Board } from "~/components/Board";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

// const preloadImage = (src: string) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = resolve;
//     img.onerror = reject;
//     img.src = src;
//   });
// };

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const response = await bskyAgent.getProfile({
    actor: params.handle!,
  });
  // if (response.data.avatar) {
  //   await preloadImage(response.data.avatar);
  // }
  return response.data;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}

export default function Index() {
  const profile = useLoaderData<typeof clientLoader>();
  return (
    <>
      <section className="flex justify-center py-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>
            {profile.handle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </section>
      <section>
        <Board />
      </section>
    </>
  );
}
