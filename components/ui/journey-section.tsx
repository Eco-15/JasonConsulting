"use client"

import { FeatureSteps } from "@/components/ui/feature-section"

const features = [
  {
    step: 'Step 1',
    title: 'Discover Your Vision',
    content: 'Begin with a comprehensive assessment to identify your goals, strengths, and areas for growth.',
    image: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnBVk03ZNs1dDP4Ioh850ny67VtNg3mlwEuFpx',
    objectPosition: 'center 40%'
  },
  {
    step: 'Step 2',
    title: 'Build Your Strategy',
    content: 'Develop a personalized action plan with clear milestones and accountability systems.',
    image: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnP0b2lRAdscr0bGLESYikhm9wWV6MUX84gjFQ',
    objectPosition: 'center 20%'
  },
  {
    step: 'Step 3',
    title: 'Transform & Lead',
    content: 'Execute your vision with ongoing support, coaching, and leadership development to create lasting impact.',
    image: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnmmOj8NKBzouqJLWiGQnfpy1elkbVU4xY56S9',
    objectPosition: 'center 40%'
  },
  {
    step: 'Step 4',
    title: 'Empower Your Team',
    content: 'Build and develop high-performing teams that amplify your leadership vision and drive collective success.',
    image: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnk3LO1hq3fVlhMWBTEXRD5x2LS6mPGqI8Jk7Y',
    objectPosition: 'center 30%'
  },
  {
    step: 'Step 5',
    title: 'Scale Your Impact',
    content: 'Multiply your influence by mentoring future leaders, implementing sustainable systems, and creating lasting organizational change.',
    image: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnGe6QtF6iCoPQKLSUwt6WYbdkBsiaXVMNygn5',
    objectPosition: 'center 30%'
  },
]

export function JourneySection() {
  return (
    <section className="bg-white py-16">
      <FeatureSteps
        features={features}
        title="Your Leadership Journey"
        autoPlayInterval={4000}
        imageHeight="h-[500px]"
      />
    </section>
  )
}
