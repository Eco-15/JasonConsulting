import { z } from 'zod'

export const bookMeetingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  pricing_tier_id: z.string().uuid('Invalid pricing tier'),
  client_notes: z.string().max(500).optional(),
})

export const pricingTierSchema = z.object({
  duration_minutes: z.number().int().min(15).max(480),
  price: z.number().positive(),
  label: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sort_order: z.number().int().default(0),
})
