import { Agent, CredentialSession } from "@atproto/api";
import { createContext, useContext } from "react";
import { BSKY_PUB_API_URL } from "./constants";

export const defaultAgent = new Agent(
  new CredentialSession(new URL(BSKY_PUB_API_URL)),
);

const AgentContext = createContext<Agent>(defaultAgent);

export function AgentProvider({
  children,
  agent,
}: {
  children: React.ReactNode;
  agent?: Agent;
}) {
  if (!agent) return children;
  return (
    <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
