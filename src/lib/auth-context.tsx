import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import type { UserAuth, AuthResponse, RegisterData, Company } from "./auth.types"

interface AuthContextType {
  user: UserAuth | null
  company: Company | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          nome: session.user.user_metadata.nome,
          empresa: session.user.user_metadata.empresa,
          cargo: session.user.user_metadata.cargo,
          telefone: session.user.user_metadata.telefone,
          company_id: session.user.user_metadata.company_id,
          role: session.user.user_metadata.role || 'user'
        })

        // Fetch company data
        if (session.user.user_metadata.company_id) {
          fetchCompany(session.user.user_metadata.company_id)
        }
      }
      setIsLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          nome: session.user.user_metadata.nome,
          empresa: session.user.user_metadata.empresa,
          cargo: session.user.user_metadata.cargo,
          telefone: session.user.user_metadata.telefone,
          company_id: session.user.user_metadata.company_id,
          role: session.user.user_metadata.role || 'user'
        })

        // Fetch company data
        if (session.user.user_metadata.company_id) {
          fetchCompany(session.user.user_metadata.company_id)
        }
      } else {
        setUser(null)
        setCompany(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchCompany(companyId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!error && data) {
      setCompany(data)
    }
  }

  async function login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
          nome: data.user.user_metadata.nome,
          empresa: data.user.user_metadata.empresa,
          cargo: data.user.user_metadata.cargo,
          telefone: data.user.user_metadata.telefone,
          company_id: data.user.user_metadata.company_id,
          role: data.user.user_metadata.role || 'user'
        } : null,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "An error occurred",
      }
    }
  }

  async function register(data: RegisterData): Promise<AuthResponse> {
    try {
      // First create the company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{ name: data.empresa }])
        .select()
        .single()

      if (companyError) throw companyError

      // Then create the user with company_id
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            empresa: data.empresa,
            cargo: data.cargo,
            telefone: data.telefone,
            company_id: companyData.id,
            role: 'admin' // First user is always admin
          },
        },
      })

      if (authError) throw authError

      // Update the user's company_id in auth.users table
      if (authData.user) {
        const { error: updateError } = await supabase.rpc('update_user_company', {
          user_id: authData.user.id,
          company_id: companyData.id
        })

        if (updateError) throw updateError
      }

      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email!,
          nome: data.nome,
          empresa: data.empresa,
          cargo: data.cargo,
          telefone: data.telefone,
          company_id: companyData.id,
          role: 'admin'
        } : null,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "An error occurred",
      }
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-callback`,
    })
    if (error) throw error
  }

  const value = {
    user,
    company,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}