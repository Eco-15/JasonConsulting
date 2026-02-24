'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, CheckCircle, Sparkles, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewsletterSubscribePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubscribed(true)
    setLoading(false)
    toast.success('Successfully subscribed!')
  }

  if (subscribed) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">You&apos;re Subscribed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for subscribing to the Leadership Insights newsletter. Check your inbox for a confirmation email.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Subscribe to </span>
            <span className="gold-gradient-text">Leadership Insights</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of leaders who receive weekly insights on leadership, business growth, and personal development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Subscribe Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get Weekly Insights</CardTitle>
              <CardDescription>
                Subscribe to receive actionable leadership tips every week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    'Subscribing...'
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">What You&apos;ll Get</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium">Weekly Leadership Tips</h4>
                  <p className="text-sm text-gray-600">
                    Practical strategies you can implement immediately to improve your leadership.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Business Growth Insights</h4>
                  <p className="text-sm text-gray-600">
                    Learn proven methods for scaling your business and building high-performing teams.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Exclusive Community Access</h4>
                  <p className="text-sm text-gray-600">
                    Connect with like-minded leaders and access subscriber-only resources.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-600 italic">
                &ldquo;Jason&apos;s newsletter has been instrumental in my growth as a leader. The weekly insights are always practical and immediately applicable.&rdquo;
              </p>
              <p className="text-sm font-medium mt-2">— Michael Chen, VP of Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
