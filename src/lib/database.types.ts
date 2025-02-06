export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          nome: string
          celular_cliente: string
          timer_is_active: boolean
          client_id: string
          ativacao: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          nome: string
          celular_cliente: string
          timer_is_active?: boolean
          client_id: string
          ativacao?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          nome?: string
          celular_cliente?: string
          timer_is_active?: boolean
          client_id?: string
          ativacao?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          message_content: string
          status: string
          role: "assistant" | "customer"
          phone: string
          client_id: string
          tokens: number
          custo_tokens: number
        }
        Insert: {
          id?: string
          created_at?: string
          message_content: string
          status: string
          role: "assistant" | "customer"
          phone: string
          client_id: string
          tokens?: number
          custo_tokens?: number
        }
        Update: {
          id?: string
          created_at?: string
          message_content?: string
          status?: string
          role?: "assistant" | "customer"
          phone?: string
          client_id?: string
          tokens?: number
          custo_tokens?: number
        }
      }
    }
  }
}