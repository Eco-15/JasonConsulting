'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  adminCreatePackage,
  adminUpdatePackage,
  adminTogglePackage,
  adminDeletePackage,
} from '@/lib/actions/packages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Star,
  Zap,
  Crown,
  Diamond,
  Gem,
} from 'lucide-react'
import type { Package } from '@/lib/types/database'

const TIER_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  bronze:   { icon: Star,    color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  silver:   { icon: Zap,     color: 'text-slate-500',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  gold:     { icon: Crown,   color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  platinum: { icon: Diamond, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  vip:      { icon: Gem,     color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
}

const PERIOD_LABEL: Record<string, string> = {
  once:      'one-time',
  monthly:   '/ month',
  bimonthly: '/ 2 months',
  quarterly: '/ quarter',
}

const ANNUAL_MULTIPLIER: Record<string, number> = {
  monthly:   12,
  bimonthly: 6,
  quarterly: 4,
}

export default function PricingPage() {
  const supabase = createClient()

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<Package | null>(null)
  const [savingPkg, setSavingPkg] = useState(false)
  const [pkgName, setPkgName] = useState('')
  const [pkgTier, setPkgTier] = useState('bronze')
  const [pkgType, setPkgType] = useState('consultation')
  const [pkgBillingPeriod, setPkgBillingPeriod] = useState('once')
  const [pkgCredits, setPkgCredits] = useState('')
  const [pkgPrice, setPkgPrice] = useState('')
  const [pkgDescription, setPkgDescription] = useState('')
  const [pkgSortOrder, setPkgSortOrder] = useState('0')

  const fetchData = async () => {
    const { data } = await supabase.from('packages').select('*').order('sort_order')
    setPackages(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreatePkgDialog = () => {
    setEditingPkg(null)
    setPkgName('')
    setPkgTier('bronze')
    setPkgType('consultation')
    setPkgBillingPeriod('once')
    setPkgCredits('')
    setPkgPrice('')
    setPkgDescription('')
    setPkgSortOrder('0')
    setPkgDialogOpen(true)
  }

  const openEditPkgDialog = (pkg: Package) => {
    setEditingPkg(pkg)
    setPkgName(pkg.name)
    setPkgTier(pkg.tier_name)
    setPkgType(pkg.package_type)
    setPkgBillingPeriod(pkg.billing_period)
    setPkgCredits(pkg.credits_granted.toString())
    setPkgPrice((pkg.price_cents / 100).toString())
    setPkgDescription(pkg.description || '')
    setPkgSortOrder(pkg.sort_order.toString())
    setPkgDialogOpen(true)
  }

  const handlePkgSave = async () => {
    setSavingPkg(true)
    const priceCents = Math.round(Number(pkgPrice) * 100)
    const result = editingPkg
      ? await adminUpdatePackage(editingPkg.id, {
          name: pkgName,
          description: pkgDescription || null,
          price_cents: priceCents,
          credits_granted: Number(pkgCredits),
          sort_order: Number(pkgSortOrder),
          billing_period: pkgBillingPeriod,
        })
      : await adminCreatePackage({
          name: pkgName,
          tier_name: pkgTier,
          package_type: pkgType,
          billing_period: pkgType === 'consultation' ? 'once' : pkgBillingPeriod,
          credits_granted: Number(pkgCredits),
          price_cents: priceCents,
          description: pkgDescription || undefined,
          sort_order: Number(pkgSortOrder),
        })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingPkg ? 'Package updated' : 'Package created')
      setPkgDialogOpen(false)
      await fetchData()
    }
    setSavingPkg(false)
  }

  const handlePkgToggle = async (pkg: Package) => {
    const result = await adminTogglePackage(pkg.id, !pkg.is_active)
    if (result.error) {
      toast.error(result.error)
    } else {
      setPackages((prev) => prev.map((p) => p.id === pkg.id ? { ...p, is_active: !p.is_active } : p))
      toast.success(pkg.is_active ? 'Package deactivated' : 'Package activated')
    }
  }

  const handlePkgDelete = async (id: string) => {
    if (!confirm('Delete this package? This cannot be undone.')) return
    const result = await adminDeletePackage(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setPackages((prev) => prev.filter((p) => p.id !== id))
      toast.success('Package deleted')
    }
  }

  const consultationPackages = packages.filter((p) => p.package_type === 'consultation')
  const membershipPackages = packages.filter((p) => p.package_type === 'membership')

  const renderPackageCard = (pkg: Package) => {
    const config = TIER_CONFIG[pkg.tier_name]
    const Icon = config?.icon ?? Star
    return (
      <Card
        key={pkg.id}
        className={`border ${config?.border ?? 'border-gray-200'} ${!pkg.is_active ? 'opacity-60' : ''}`}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${config?.bg ?? 'bg-gray-50'} flex items-center justify-center shrink-0`}>
              <Icon className={`h-4 w-4 ${config?.color ?? 'text-gray-500'}`} />
            </div>
            <div>
              <CardTitle className="text-base">{pkg.name}</CardTitle>
              <p className="text-xs text-gray-500 capitalize">{pkg.tier_name}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={pkg.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}
          >
            {pkg.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {pkg.description && (
            <p className="text-sm text-gray-500">{pkg.description}</p>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${(pkg.price_cents / 100).toLocaleString()}</span>
            <span className="text-gray-500 text-sm">{PERIOD_LABEL[pkg.billing_period] ?? ''}</span>
          </div>
          {pkg.billing_period !== 'once' && (
            <p className="text-xs text-gray-400">
              ${((pkg.price_cents / 100) * ANNUAL_MULTIPLIER[pkg.billing_period]).toLocaleString()} / year
            </p>
          )}
          <p className="text-sm text-gray-600">
            <span className="font-medium">{pkg.credits_granted} credits</span>
            {' = '}
            {pkg.credits_granted >= 60
              ? `${pkg.credits_granted / 60}h`
              : `${pkg.credits_granted}min`}
          </p>
          <div className="flex items-center gap-1 pt-1">
            <Button variant="ghost" size="sm" onClick={() => openEditPkgDialog(pkg)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePkgToggle(pkg)}
              title={pkg.is_active ? 'Deactivate' : 'Activate'}
            >
              {pkg.is_active
                ? <ToggleRight className="h-4 w-4 text-green-600" />
                : <ToggleLeft className="h-4 w-4 text-gray-400" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePkgDelete(pkg.id)} title="Delete">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-gray-500">Manage client packages and offerings.</p>
        </div>
        <Button onClick={openCreatePkgDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      {/* Consultation */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Consultation Packages</h2>
          <p className="text-sm text-gray-500">One-time credit purchases.</p>
        </div>
        {consultationPackages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {consultationPackages.map(renderPackageCard)}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-gray-400">No consultation packages.</p>
          </div>
        )}
      </div>

      {/* Membership */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Membership Packages</h2>
          <p className="text-sm text-gray-500">Recurring subscriptions with automatic credit renewal.</p>
        </div>
        {membershipPackages.length > 0 ? (
          <Tabs defaultValue="quarterly">
            <TabsList>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="bimonthly">Bi-Monthly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            {(['quarterly', 'bimonthly', 'monthly'] as const).map((period) => (
              <TabsContent key={period} value={period} className="mt-4">
                {membershipPackages.filter((p) => p.billing_period === period).length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {membershipPackages.filter((p) => p.billing_period === period).map(renderPackageCard)}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-gray-400">No {period} packages.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-gray-400">No membership packages.</p>
          </div>
        )}
      </div>

      {/* ── Package Dialog ──────────────────────────────────────────────── */}
      <Dialog open={pkgDialogOpen} onOpenChange={setPkgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPkg ? 'Edit Package' : 'New Package'}</DialogTitle>
            <DialogDescription>
              {editingPkg ? 'Update package details.' : 'Create a new client package.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Bronze Consultation"
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
              />
            </div>
            {!editingPkg && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={pkgTier} onValueChange={setPkgTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={pkgType}
                    onValueChange={(v) => {
                      setPkgType(v)
                      setPkgBillingPeriod(v === 'consultation' ? 'once' : 'monthly')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {(editingPkg ? editingPkg.package_type === 'membership' : pkgType === 'membership') && (
              <div className="space-y-2">
                <Label>Billing Period</Label>
                <Select value={pkgBillingPeriod} onValueChange={setPkgBillingPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bimonthly">Bi-Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credits Granted</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={pkgCredits}
                  onChange={(e) => setPkgCredits(e.target.value)}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  placeholder="299"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(e.target.value)}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description of the package"
                value={pkgDescription}
                onChange={(e) => setPkgDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={pkgSortOrder}
                onChange={(e) => setPkgSortOrder(e.target.value)}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePkgSave}
              disabled={savingPkg || !pkgName || !pkgCredits || !pkgPrice}
            >
              {savingPkg ? 'Saving...' : editingPkg ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
