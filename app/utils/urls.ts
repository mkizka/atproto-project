import { publicBskyAgent } from "~/api/agent";

// https://bsky.app/profile/example.com
export const isBlueskyProfileUrl = (url: URL) => {
  const paths = url.pathname.split("/");
  return (
    url.hostname === "bsky.app" && paths[1] === "profile" && paths.length === 3
  );
};

// https://bsky.app/profile/example.com/post/12345...
export const isBlueskyPostUrl = (url: URL) => {
  const paths = url.pathname.split("/");
  return (
    url.hostname === "bsky.app" &&
    paths[1] === "profile" &&
    paths[3] === "post" &&
    paths.length === 5
  );
};

// https://bsky.app/profile/example.com
// ↓
// https://bsky.app/profile/did:plc:abcdefg...
//
// https://bsky.app/profile/example.com/post/hijklmnop...
// ↓
// https://bsky.app/profile/did:plc:abcdefg.../post/hijklmnop...
export const resolveHandleIfNeeded = async (url: URL) => {
  if (!isBlueskyProfileUrl(url) && !isBlueskyPostUrl(url)) {
    return url.toString();
  }
  const [_, profile, handle, ...rest] = url.pathname.split("/");
  if (handle.startsWith("did:")) {
    return url.toString();
  }
  const response = await publicBskyAgent.resolveHandle({ handle });
  const resolvedUrl = new URL(url.origin);
  resolvedUrl.pathname = "/" + [profile, response.data.did, ...rest].join("/");
  return resolvedUrl.toString();
};

// https://bsky.app/profile/did:plc:abcdefg.../post/hijklmnop...
// ↓
// at://did:plc:abcdefg.../app.bsky.feed.post/hijklmnop...
export const atUri = (url: URL) => {
  const [_, _profile, did, _post, tid] = url.pathname.split("/");
  return `at://${did}/app.bsky.feed.post/${tid}`;
};