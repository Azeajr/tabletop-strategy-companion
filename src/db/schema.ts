import { z } from 'zod'

export const PhaseEnum = z.enum(['Setup', 'Early Game', 'Mid-Game', 'End-Game'])
export type Phase = z.infer<typeof PhaseEnum>

export const TagEnum = z.enum([
  'TLDR', 'Offense', 'Defense', 'Economy',
  'Pivot', 'Memory', 'Bluff', 'Transition', 'Closing',
])
export type Tag = z.infer<typeof TagEnum>

export const StrategySchema = z.object({
  phase: PhaseEnum,
  category: z.string().min(3).max(24),
  condition: z.string().min(5).max(45),
  strategy_detailed: z.string().min(20).max(300),
  strategy_stealth: z.array(z.string().max(50)).max(3),
  tags: z.array(TagEnum).max(2),
  context: z.string().nullable(),
})
export type Strategy = z.infer<typeof StrategySchema>

export const GameSeedSchema = z.object({
  game_id: z.string().min(2).max(32).regex(/^[a-z0-9-]+$/),
  game_name: z.string().min(2).max(32),
  game_description: z.string().min(10).max(80),
  filter_1_label: z.string().nullable(),
  filter_1_yes_context: z.string().nullable(),
  filter_1_no_context: z.string().nullable(),
  filter_2_label: z.string().nullable(),
  filter_2_yes_context: z.string().nullable(),
  filter_2_no_context: z.string().nullable(),
  strategies: z.array(StrategySchema),
})
export type GameSeed = z.infer<typeof GameSeedSchema>
