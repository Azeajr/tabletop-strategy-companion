import { z } from 'zod'

export const TagEnum = z.enum([
  'TLDR', 'Offense', 'Defense', 'Economy',
  'Pivot', 'Memory', 'Bluff', 'Transition', 'Closing',
])
export type Tag = z.infer<typeof TagEnum>

export const StrategySchema = z.object({
  phase: z.string().min(2).max(32),
  category: z.string().min(3).max(24),
  condition: z.string().min(5).max(45),
  strategy_detailed: z.string().min(20).max(300),
  strategy_stealth: z.array(z.string().max(50)).max(3),
  tags: z.array(TagEnum).max(2),
  context: z.string().nullable(),
  // Explicit reading order within a phase. Lower sorts first; ties fall back to
  // condition alphabetical. Default 0 = unordered (every existing seed), so the
  // pipeline degrades to the historical alphabetical behavior.
  order: z.number().int().min(0).default(0),
})
export type Strategy = z.infer<typeof StrategySchema>

export const GameSeedSchema = z.object({
  game_id: z.string().min(2).max(32).regex(/^[a-z0-9-]+$/),
  game_name: z.string().min(2).max(32),
  game_description: z.string().min(10).max(80),
  phases: z.array(z.string().min(2).max(32)).min(1).max(8),
  // 'arc' (default) = phases are a linear progression (Setup → … → End),
  // rendered as a stepper. 'modes' = phases are non-linear states the player
  // freely switches between (a loop game like Battleship: search ↔ target),
  // rendered as free-select mode tabs. See PhaseStepper.
  nav_style: z.enum(['arc', 'modes']).default('arc'),
  filter_1_label: z.string().nullable(),
  filter_1_yes_context: z.string().nullable(),
  filter_1_no_context: z.string().nullable(),
  filter_2_label: z.string().nullable(),
  filter_2_yes_context: z.string().nullable(),
  filter_2_no_context: z.string().nullable(),
  strategies: z.array(StrategySchema),
})
export type GameSeed = z.infer<typeof GameSeedSchema>
