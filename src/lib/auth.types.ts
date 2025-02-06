export interface Company {
  id: string
  name: string
  active: boolean
}

export interface UserAuth {
  id: string
  email: string
  nome: string
  empresa: string
  cargo: string
  telefone: string
  company_id: string
  role: 'admin' | 'user'
}

export interface AuthResponse {
  user: UserAuth | null
  error: string | null
}

export interface RegisterData {
  email: string
  password: string
  nome: string
  empresa: string
  cargo: string
  telefone: string
}