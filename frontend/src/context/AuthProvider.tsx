import { type ReactNode, createContext, useState, type Dispatch, type SetStateAction } from "react"

export interface AuthState {
  accessToken?: string;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading, setIsLoading }} >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
