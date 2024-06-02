import { FormProvider, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { z } from "zod";

import type { CardScheme } from "~/api/validator";

import { useBoard } from "./BoardProvider";

type ModalContextValue = {
  formId: string;
  editingCard: CardScheme | null;
  open: boolean;
  setOpen: (open: boolean, cardId?: string) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

const schema = z.object({
  url: z.string().url({ message: "URLを入力してください" }),
  text: z.string().optional(),
  id: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type Props = {
  children: ReactNode;
};

export function ModalProvider({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardScheme | null>(null);
  const { cards, addCard, replaceCard } = useBoard();

  const [form] = useForm<Schema>({
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: (event, { submission }) => {
      event.preventDefault();
      if (!submission) throw new Error("予期せぬエラーが発生しました");
      const formCard = submission.payload as Schema;
      if (formCard.id) {
        replaceCard({ ...formCard, id: formCard.id });
      } else {
        addCard(formCard);
      }
      setOpen(false);
    },
  });

  const handleOpen: ModalContextValue["setOpen"] = (open, cardId) => {
    setOpen(open);
    const card = cards.find((card) => card.id === cardId);
    setEditingCard(card ?? null);
  };

  return (
    <FormProvider context={form.context}>
      <ModalContext.Provider
        value={{ formId: form.id, editingCard, open, setOpen: handleOpen }}
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
