import type { AtpAgentLoginOpts, AtpSessionData } from "@atproto/api";
import type { ReactNode } from "react";
import { createContext, useContext, useLayoutEffect, useState } from "react";

import { myAgent } from "~/api/agent";

type SessionContextType = {
  data: AtpSessionData | null;
  login: (options: AtpAgentLoginOpts) => Promise<AtpSessionData>;
};

const SessionContext = createContext<SessionContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function SessionProvider({ children }: Props) {
  const [data, setData] = useState<AtpSessionData | null>(null);

  useLayoutEffect(() => {
    const session = myAgent.getSession();
    if (session) {
      setData(session);
    }
  }, []);

  const login = async (options: AtpAgentLoginOpts) => {
    const response = await myAgent.login(options);
    // なぜか途中からAtpSessionDataのactiveのみ型が合わなくなった
    const session = response.data as AtpSessionData;
    setData(session);
    return session;
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
