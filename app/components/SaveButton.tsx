import { useNavigate } from "@remix-run/react";
import { Save } from "lucide-react";
import { useState } from "react";

import { myAgent } from "~/api/agent";

import { useBoard } from "./BoardProvider";
import { useSession } from "./SessionProvider";
import { Button } from "./shadcn/ui/button";

type Props = {
  className?: string;
};

export function SaveButton({ className }: Props) {
  const session = useSession();
  const board = useBoard();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!session.data) throw new Error("セッションがありません");
    setIsSaving(true);
    await myAgent.updateBoard(board.value);
    navigate(`/board/${session.data.handle}`);
  };

  return (
    <Button className={className} disabled={isSaving} asChild>
      <button onClick={handleSave}>
        <Save className="size-4" />
        {isSaving ? "保存中..." : "保存"}
      </button>
    </Button>
  );
}
