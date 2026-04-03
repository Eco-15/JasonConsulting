'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { twilioClient, twilioPhoneNumber, jasonPhoneNumber } from '@/lib/twilio/client'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export async function submitContact(formData: {
  name: string
  email: string
  phone: string
  message: string
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
    message,
  })

  if (dbError) {
    return { error: 'Failed to save your message. Please try again.' }
  }

  // Send welcome SMS to the contact (if phone provided)
  if (phone) {
    try {
      await twilioClient.messages.create({
        body: `Hi ${name}, thanks for reaching out to Jason Graziani Consulting! We've received your message and will get back to you shortly.`,
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
      body: `New lead from ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\nMessage: ${message}`,
      from: twilioPhoneNumber,
      to: jasonPhoneNumber,
    })
  } catch {
    console.error('Failed to send notification SMS to Jason')
  }

  return { success: true }
}
