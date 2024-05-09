import type { MetaFunction } from "@remix-run/node";

import { AtpBaseClient } from "~/generated/api";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const client = new AtpBaseClient();

export default function Index() {
  const handleClick = async () => {
    const agent = client.service(location.href);
    await agent.dev.mkizka.sample
      .sampleMethod({ actor: "mkizka.dev" })
      .then(console.log);
  };
  return (
    <button
      className="p-4 bg-blue-500 text-white rounded"
      onClick={handleClick}
    >
      Click me
    </button>
  );
}
