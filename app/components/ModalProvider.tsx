import type { SubmissionResult } from "@conform-to/react";
import { FormProvider, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { z } from "zod";

import { useBoard } from "./BoardProvider";

type ModalContextValue = {
  formId: string;
  open: boolean;
  setOpen: (open: boolean, cardId?: string) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

const schema = z.object({
  url: z
    .string({ message: "入力してください" })
    .url({ message: "URLを入力してください" }),
  id: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type Props = {
  children: ReactNode;
};

export function ModalProvider({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);
  const { cards, addCard } = useBoard();
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

  const [form] = useForm<Schema>({
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: (event, { submission }) => {
      event.preventDefault();
      if (!submission) throw new Error("予期せぬエラー");
      const url = submission.payload.url as string;
      addCard({ url });
      setOpen(false);
      const result = submission.reply();
      setLastResult(result);
      return result;
    },
  });

  const handleOpen: ModalContextValue["setOpen"] = (open, cardId) => {
    setOpen(open);
    setCardId(cardId ?? null);
  };

  return (
    <FormProvider context={form.context}>
      <ModalContext.Provider
        value={{ formId: form.id, open, setOpen: handleOpen }}
      >
        {children}
      </ModalContext.Provider>
    </FormProvider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === null) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
