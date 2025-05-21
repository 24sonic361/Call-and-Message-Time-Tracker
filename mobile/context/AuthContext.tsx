// context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  authorized: false,
  setAuthorized: (value: boolean) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  return (
    <AuthContext.Provider value={{ authorized, setAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
