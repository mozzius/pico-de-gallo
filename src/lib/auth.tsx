import { createContext, useContext, useMemo } from "react";

type AuthContextValue = {
  user: { did: string } | null;
  logIn: (
    identifier: string,
    password: string,
  ) => Promise<{ success: boolean }>;
  logOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  user,
  logIn,
  logOut,
}: React.PropsWithChildren<AuthContextValue>) {
  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({
          user,
          logIn,
          logOut,
        }),
        [user, logIn, logOut],
      )}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
