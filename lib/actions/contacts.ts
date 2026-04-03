'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { twilioClient, twilioPhoneNumber, jasonPhoneNumber } from '@/lib/twilio/client'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
})

export async function submitContact(formData: {
  name: string
  email: string
  phone: string
  message?: string
}) {
  const parsed = contactSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, phone, message } = parsed.data

  const supabase = await createClient()

  const { error: dbError } = await supabase.from('contacts').insert({
    name,
    email,
    phone: phone || null,
    message: message || null,
  })

  if (dbError) {
    return { error: 'Failed to save your registration. Please try again.' }
  }

  // Send welcome SMS to the contact (if phone provided)
  if (phone) {
    try {
      await twilioClient.messages.create({
        body: `Hi ${name}, you're registered for the upcoming Jason Graziani Consulting webinar! We'll send you the details soon.`,
        from: twilioPhoneNumber,
        to: phone,
      })
    } catch {
      // Don't fail the submission if SMS fails
      console.error('Failed to send welcome SMS')
    }
  }

  // Notify Jason about the new lead
  try {
    await twilioClient.messages.create({
      body: `New webinar registration!\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}`,
      from: twilioPhoneNumber,
      to: jasonPhoneNumber,
    })
  } catch {
    console.error('Failed to send notification SMS to Jason')
  }

  return { success: true }
}
