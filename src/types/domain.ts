// Canonical runtime entity types — mirrors src/db/schema.ts Zod types
// but expressed as plain TypeScript interfaces for use throughout the app.

export type Phase = string

export type Tag =
  | 'TLDR' | 'Offense' | 'Defense' | 'Economy'
  | 'Pivot' | 'Memory' | 'Bluff' | 'Transition' | 'Closing'

export interface Game {
  game_id: string
  game_name: string
  game_description: string
  phases: string[]
  filter_1_label: string | null
  filter_1_yes_context: string | null
  filter_1_no_context: string | null
  filter_2_label: string | null
  filter_2_yes_context: string | null
  filter_2_no_context: string | null
}

export interface Strategy {
  id?: number
  game_id: string
  phase: Phase
  category: string
  condition: string
  strategy_detailed: string
  strategy_stealth: string[]
  tags: Tag[]
  context: string | null
}
