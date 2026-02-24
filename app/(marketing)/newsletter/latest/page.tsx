import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Share2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function LatestNewsletterPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              Leadership
            </Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              January 15, 2025
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              5 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            The Art of Delegation: Why Leaders Must Let Go to Grow
          </h1>
          <p className="text-xl text-gray-600">
            Discover why the most effective leaders master the art of delegation and how you can start delegating more effectively today.
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
            JG
          </div>
          <div>
            <p className="font-semibold">Jason Graziani</p>
            <p className="text-sm text-gray-500">Business Coach & Leadership Developer</p>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <p>
            One of the biggest challenges I see with emerging leaders is the struggle to delegate effectively. Many talented individuals rise through the ranks because of their ability to execute—they&apos;re the ones who get things done, who others rely on, who never drop the ball.
          </p>

          <p>
            But here&apos;s the paradox: the very skills that got you promoted are often the ones holding you back as a leader.
          </p>

          <h2>The Delegation Dilemma</h2>

          <p>
            When I work with coaching clients, I often hear variations of the same concern:
          </p>

          <ul>
            <li>&ldquo;It&apos;s faster if I just do it myself.&rdquo;</li>
            <li>&ldquo;No one can do it as well as I can.&rdquo;</li>
            <li>&ldquo;I don&apos;t have time to train someone.&rdquo;</li>
          </ul>

          <p>
            Sound familiar? These are all signs of a delegation problem—and they&apos;re costing you more than you realize.
          </p>

          <h2>The True Cost of Not Delegating</h2>

          <p>
            When you refuse to delegate, you&apos;re not just overworking yourself. You&apos;re:
          </p>

          <ol>
            <li><strong>Limiting your team&apos;s growth</strong> — Your team members need challenges to develop. By hoarding tasks, you&apos;re denying them opportunities to learn and prove themselves.</li>
            <li><strong>Creating a bottleneck</strong> — If everything has to flow through you, you become the constraint on your team&apos;s productivity.</li>
            <li><strong>Missing the big picture</strong> — When you&apos;re buried in execution, you can&apos;t see the strategic opportunities and threats that require your attention.</li>
            <li><strong>Burning yourself out</strong> — Sustainable leadership requires working at a sustainable pace. If you&apos;re doing everyone&apos;s job, you won&apos;t last.</li>
          </ol>

          <h2>A Framework for Effective Delegation</h2>

          <p>
            Here&apos;s the framework I use with my clients to help them delegate more effectively:
          </p>

          <h3>1. Identify What to Delegate</h3>
          <p>
            Start by categorizing your tasks into four buckets:
          </p>
          <ul>
            <li><strong>Must do yourself</strong> — Tasks that require your unique expertise or authority</li>
            <li><strong>Should delegate</strong> — Tasks someone else could do (even if not as well initially)</li>
            <li><strong>Could automate</strong> — Repetitive tasks that technology could handle</li>
            <li><strong>Should eliminate</strong> — Tasks that don&apos;t actually need to be done at all</li>
          </ul>

          <h3>2. Choose the Right Person</h3>
          <p>
            Match tasks to team members based on their skills, development goals, and capacity. Sometimes the best person isn&apos;t the most obvious choice—consider who would benefit most from the learning opportunity.
          </p>

          <h3>3. Delegate Outcomes, Not Tasks</h3>
          <p>
            Instead of giving detailed instructions, define the desired outcome and let your team member figure out how to achieve it. This builds problem-solving skills and often leads to better solutions than you would have devised.
          </p>

          <h3>4. Provide Support, Not Supervision</h3>
          <p>
            Be available for questions and check in at key milestones, but resist the urge to hover. Trust is built through autonomy.
          </p>

          <h2>Your Action Item This Week</h2>

          <p>
            Take 30 minutes this week to audit your calendar and task list. Identify three tasks you&apos;re currently doing that someone else could handle. Then, schedule time to delegate at least one of them before the week is out.
          </p>

          <p>
            Remember: Delegation isn&apos;t about offloading work—it&apos;s about multiplying your impact through others. The best leaders aren&apos;t the ones who do the most; they&apos;re the ones who enable others to do their best.
          </p>

          <p className="text-gray-600 italic">
            Until next week,<br />
            Jason
          </p>
        </article>

        {/* CTA */}
        <Card className="mt-12 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Enjoyed this issue?</h3>
                <p className="text-sm text-gray-600">Subscribe to get Leadership Insights delivered to your inbox every week.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button size="sm" asChild>
                  <Link href="/newsletter/subscribe">Subscribe</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link href="/newsletter/archive">
              <BookOpen className="mr-2 h-4 w-4" />
              View All Issues
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
