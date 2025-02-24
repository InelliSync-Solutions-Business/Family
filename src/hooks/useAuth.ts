import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  name?: string;
  role?: 'admin' | 'user';
}

interface User extends SupabaseUser {
  name?: string;
  role?: 'admin' | 'user';
}

const createUserWithProfile = (
  supabaseUser: SupabaseUser,
  profile: UserProfile | null
): User => {
  return {
    ...supabaseUser,
    name: profile?.name,
    role: profile?.role || 'user'
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, role')
        .eq('id', userId)
        .single()

      if (!error && data) {
        // Validate role
        const profile: UserProfile = {
          name: data.name,
          role: data.role === 'admin' || data.role === 'user' ? data.role : 'user'
        }
        return profile
      }
      return null
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id)
        setUser(createUserWithProfile(session.user, userData))
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id)
        setUser(createUserWithProfile(session.user, userData))
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    signIn: supabase.auth.signInWithPassword,
    signUp: supabase.auth.signUp,
    signOut: () => supabase.auth.signOut(),
  }
}
