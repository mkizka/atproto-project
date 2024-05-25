import { useEffect, useRef } from "react";

type Props = {
  blueskyUri: string;
};

export function BlueskyEmbed({ blueskyUri }: Props) {
  const ref = useRef<HTMLQuoteElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    // なぜかハイドレーションエラーになるので、レンダリング後にdata-bluesky-uriを設定する
    ref.current.dataset.blueskyUri = blueskyUri;
    window.bluesky?.scan?.();
  }, [blueskyUri]);
  return <blockquote ref={ref} />;
}
