import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createClient, type User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isDemo: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  authConfigured: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  continueAsDemo: () => void;
  signOut: () => Promise<void>;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const authConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = authConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const demoUser: AppUser = {
  id: 'orbit-preview-user',
  email: 'alex@preview.orbit',
  name: 'Alex Morgan',
  isDemo: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const metadataName = metadata.full_name ?? metadata.name;
  const emailName = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ');
  const name = typeof metadataName === 'string' && metadataName.trim()
    ? metadataName.trim()
    : emailName || 'Your account';

  return {
    id: user.id,
    email: user.email ?? '',
    name,
    avatarUrl: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined,
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(supabase ? null : demoUser);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let alive = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(toAppUser(session?.user ?? null));
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) console.error('Could not restore the Orbit session.', error.message);
      setUser(toAppUser(data.session?.user ?? null));
      setLoading(false);
    });

    return () => {
      alive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signInWithEmail(email: string) {
    if (!supabase) {
      setUser(demoUser);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
  }

  function continueAsDemo() {
    if (!authConfigured) setUser(demoUser);
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, authConfigured, signInWithEmail, continueAsDemo, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
