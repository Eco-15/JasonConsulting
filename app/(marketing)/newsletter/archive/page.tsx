import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Filler newsletter archive data
const newsletters = [
  {
    id: 1,
    title: 'The Art of Delegation: Why Leaders Must Let Go to Grow',
    date: '2025-01-15',
    category: 'Leadership',
    excerpt: 'Discover why the most effective leaders master the art of delegation and how you can start delegating more effectively today.',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Building a Culture of Accountability Without Micromanaging',
    date: '2025-01-08',
    category: 'Team Building',
    excerpt: 'Learn the delicate balance between holding your team accountable and giving them the autonomy they need to thrive.',
    readTime: '7 min read',
  },
  {
    id: 3,
    title: '5 Morning Rituals of Highly Successful Entrepreneurs',
    date: '2025-01-01',
    category: 'Personal Development',
    excerpt: 'Start your year right with these proven morning rituals that top entrepreneurs swear by.',
    readTime: '4 min read',
  },
  {
    id: 4,
    title: 'The Communication Framework That Transformed My Business',
    date: '2024-12-25',
    category: 'Communication',
    excerpt: 'A step-by-step guide to the communication framework I use with all my coaching clients.',
    readTime: '6 min read',
  },
  {
    id: 5,
    title: 'Why Your Best Employees Are Leaving (And How to Stop It)',
    date: '2024-12-18',
    category: 'Retention',
    excerpt: 'Understanding the real reasons behind employee turnover and actionable strategies to retain top talent.',
    readTime: '8 min read',
  },
  {
    id: 6,
    title: 'Setting Goals That Actually Stick: A Leader\'s Guide',
    date: '2024-12-11',
    category: 'Goal Setting',
    excerpt: 'Forget SMART goals. Here\'s a more effective framework for setting and achieving meaningful objectives.',
    readTime: '5 min read',
  },
  {
    id: 7,
    title: 'The Power of Saying No: Protecting Your Time as a Leader',
    date: '2024-12-04',
    category: 'Productivity',
    excerpt: 'Learn how to politely but firmly decline requests that don\'t align with your priorities.',
    readTime: '4 min read',
  },
  {
    id: 8,
    title: 'From Manager to Leader: Making the Mental Shift',
    date: '2024-11-27',
    category: 'Leadership',
    excerpt: 'The key differences between managing and leading, and how to make the transition successfully.',
    readTime: '6 min read',
  },
]

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Leadership': 'bg-purple-100 text-purple-700',
    'Team Building': 'bg-blue-100 text-blue-700',
    'Personal Development': 'bg-green-100 text-green-700',
    'Communication': 'bg-amber-100 text-amber-700',
    'Retention': 'bg-red-100 text-red-700',
    'Goal Setting': 'bg-teal-100 text-teal-700',
    'Productivity': 'bg-indigo-100 text-indigo-700',
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

export default function NewsletterArchivePage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Newsletter </span>
            <span className="gold-gradient-text">Archive</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through past issues of Leadership Insights. Each newsletter is packed with actionable advice for leaders and entrepreneurs.
          </p>
        </div>

        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={getCategoryColor(newsletter.category)}>
                        {newsletter.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(newsletter.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-sm text-gray-500">• {newsletter.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 hover:text-amber-600 cursor-pointer">
                      {newsletter.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{newsletter.excerpt}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="self-start md:self-center">
                    Read <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Want to receive new issues directly in your inbox?</p>
          <Button asChild>
            <Link href="/newsletter/subscribe">Subscribe Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
