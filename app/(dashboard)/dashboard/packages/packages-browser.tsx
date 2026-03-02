'use client'

import { useState, useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, Star, Zap, Crown, Diamond, Gem, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import {
  createConsultationCheckout,
  createSubscriptionCheckout,
} from '@/lib/actions/packages'
import type { Package, ClientSubscription } from '@/lib/types/database'

type TierConfig = {
  icon: React.ElementType
  color: string
  bg: string
  border: string
  badge: string
}

const TIER_CONFIG: Record<string, TierConfig> = {
  bronze: {
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  silver: {
    icon: Zap,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
  },
  gold: {
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  platinum: {
    icon: Diamond,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  vip: {
    icon: Gem,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
}

interface ActiveSubscriptionWithPackage extends ClientSubscription {
  packages: Package
}

interface PackagesBrowserProps {
  packages: Package[]
  creditsBalance: number
  activeSubscription: ActiveSubscriptionWithPackage | null
}

export function PackagesBrowser({
  packages,
  creditsBalance,
  activeSubscription,
}: PackagesBrowserProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const consultationPackages = packages.filter((p) => p.package_type === 'consultation')
  const membershipPackages = packages.filter((p) => p.package_type === 'membership')

  const handleConsultationPurchase = (packageId: string) => {
    setPurchasingId(packageId)
    startTransition(async () => {
      const result = await createConsultationCheckout(packageId)
      if (result?.error) {
        toast.error(result.error)
        setPurchasingId(null)
      }
      // On success: server action calls redirect() — no return value
    })
  }

  const handleSubscriptionPurchase = (packageId: string) => {
    if (activeSubscription) {
      toast.error('You already have an active subscription. Cancel it before subscribing to a new plan.')
      return
    }
    setPurchasingId(packageId)
    startTransition(async () => {
      const result = await createSubscriptionCheckout(packageId)
      if (result?.error) {
        toast.error(result.error)
        setPurchasingId(null)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
          <p className="text-gray-500 mt-1">
            Purchase credits to book coaching sessions with Jason.
          </p>
        </div>
        <Card className="text-center px-6 py-4 shrink-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Credit Balance
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{creditsBalance}</p>
          <p className="text-xs text-gray-400 mt-1">1 credit = 1 minute</p>
        </Card>
      </div>

      {/* Active subscription banner */}
      {activeSubscription && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-800">
                Active: {activeSubscription.packages.name}
              </p>
              <p className="text-sm text-green-600">
                {activeSubscription.current_period_end
                  ? `Next renewal: ${new Date(activeSubscription.current_period_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : 'Subscription active'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main tabs */}
      <Tabs defaultValue="consultation">
        <TabsList>
          <TabsTrigger value="consultation">Consultation Packages</TabsTrigger>
          <TabsTrigger value="membership">Membership Packages</TabsTrigger>
        </TabsList>

        {/* CONSULTATION PACKAGES */}
        <TabsContent value="consultation" className="mt-6">
          <p className="text-sm text-gray-500 mb-6">
            One-time credit purchases. Credits never expire and can be used across multiple sessions.
          </p>
          {consultationPackages.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-400">
                <ShoppingBag className="mx-auto h-10 w-10 mb-3 opacity-40" />
                <p>No consultation packages available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {consultationPackages.map((pkg) => {
                const config = TIER_CONFIG[pkg.tier_name]
                const Icon = config.icon
                const isPurchasing = purchasingId === pkg.id
                return (
                  <Card key={pkg.id} className={`border ${config.border}`}>
                    <CardHeader>
                      <div
                        className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center mb-2`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="capitalize">{pkg.tier_name}</CardTitle>
                        <Badge className={config.badge} variant="outline">
                          One-time
                        </Badge>
                      </div>
                      <CardDescription>
                        {pkg.description ??
                          `${pkg.credits_granted} minutes of consultation time`}
                        {pkg.tier_name === 'vip' && (
                          <span className="block mt-1 text-purple-600 font-medium">
                            Includes a private lunch with Jason
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-3xl font-bold">
                          ${(pkg.price_cents / 100).toLocaleString()}
                        </span>
                        <span className="text-gray-500 ml-1 text-sm">one-time</span>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        <span className="font-semibold">{pkg.credits_granted} credits</span>
                        {' '}={' '}
                        <span>
                          {pkg.credits_granted >= 60
                            ? `${pkg.credits_granted / 60} hour${pkg.credits_granted / 60 !== 1 ? 's' : ''}`
                            : `${pkg.credits_granted} minutes`}
                          {' '}of consultation
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleConsultationPurchase(pkg.id)}
                        disabled={isPurchasing}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          'Purchase'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* MEMBERSHIP PACKAGES */}
        <TabsContent value="membership" className="mt-6">
          <p className="text-sm text-gray-500 mb-6">
            Recurring subscriptions. Credits are added automatically each billing period.
            Commit longer to save more.
          </p>
          <Tabs defaultValue="quarterly">
            <TabsList>
              <TabsTrigger value="quarterly">Quarterly (Best Value)</TabsTrigger>
              <TabsTrigger value="bimonthly">Bi-Monthly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            {(['quarterly', 'bimonthly', 'monthly'] as const).map((period) => {
              const periodLabel = {
                quarterly: '/ quarter',
                bimonthly: '/ 2 months',
                monthly: '/ month',
              }[period]

              const periodCreditsNote = {
                quarterly: '3 months of credits upfront',
                bimonthly: '2 months of credits upfront',
                monthly: 'Monthly credits',
              }[period]

              return (
                <TabsContent key={period} value={period} className="mt-6">
                  <p className="text-xs text-gray-400 mb-4">{periodCreditsNote}</p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {membershipPackages
                      .filter((p) => p.billing_period === period)
                      .map((pkg) => {
                        const config = TIER_CONFIG[pkg.tier_name]
                        const Icon = config.icon
                        const isPurchasing = purchasingId === pkg.id
                        const isActivePkg = activeSubscription?.package_id === pkg.id

                        return (
                          <Card
                            key={pkg.id}
                            className={`border ${config.border} ${isActivePkg ? 'ring-2 ring-green-400' : ''}`}
                          >
                            <CardHeader>
                              <div
                                className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center mb-2`}
                              >
                                <Icon className={`h-5 w-5 ${config.color}`} />
                              </div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="capitalize">{pkg.tier_name}</CardTitle>
                                {isActivePkg && (
                                  <Badge className="bg-green-100 text-green-700" variant="outline">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <CardDescription>
                                {pkg.credits_granted} credits per billing period
                                {pkg.tier_name === 'vip' && (
                                  <span className="block mt-1 text-purple-600 font-medium">
                                    Includes monthly lunch with Jason
                                  </span>
                                )}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <span className="text-3xl font-bold">
                                  ${(pkg.price_cents / 100).toLocaleString()}
                                </span>
                                <span className="text-gray-500 ml-1 text-sm">
                                  {periodLabel}
                                </span>
                              </div>
                              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                <span className="font-semibold">{pkg.credits_granted} credits</span>
                                {' '}each period
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => handleSubscriptionPurchase(pkg.id)}
                                disabled={isPurchasing || (!!activeSubscription && !isActivePkg)}
                                variant={isActivePkg ? 'outline' : 'default'}
                              >
                                {isPurchasing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Redirecting...
                                  </>
                                ) : isActivePkg ? (
                                  'Current Plan'
                                ) : activeSubscription ? (
                                  'Cancel Current Plan First'
                                ) : (
                                  'Subscribe'
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
