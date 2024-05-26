import type { AtpAgentLoginOpts, AtpSessionData } from "@atproto/api";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { myAgent } from "~/api/agent";

import { useLocalStorage } from "./useLocalStorage";

type SessionContextType = {
  data: AtpSessionData | null;
  login: (options: AtpAgentLoginOpts) => Promise<AtpSessionData>;
};

const SessionContext = createContext<SessionContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function SessionProvider({ children }: Props) {
  const [data, setData] = useLocalStorage<AtpSessionData>(
    myAgent.localStorageKey,
  );

  const login = async (options: AtpAgentLoginOpts) => {
    const newSession = await myAgent.login(options);
    setData(newSession);
    return newSession;
  };

  return (
    <SessionContext.Provider value={{ data, login }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
