import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Types partagés
export interface Item {
  id: number
  text: string
  added_by: string
  created_at: string
}

export interface Player {
  id: number
  name: string
  name_key: string
  cells: string[] // 25 textes
  checked: boolean[] // 25 booléens
  created_at: string
}

export interface GameState {
  id: number
  is_open: boolean
  updated_at: string
}
