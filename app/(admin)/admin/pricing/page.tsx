'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  createPricingTier,
  updatePricingTier,
  togglePricingTier,
  deletePricingTier,
} from '@/lib/actions/pricing'
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
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { PricingTier } from '@/lib/types/database'

export default function PricingPage() {
  const supabase = createClient()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formLabel, setFormLabel] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')

  const fetchTiers = async () => {
    const { data } = await supabase
      .from('pricing_tiers')
      .select('*')
      .order('sort_order')
    setTiers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTiers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreateDialog = () => {
    setEditingTier(null)
    setFormLabel('')
    setFormDuration('')
    setFormPrice('')
    setFormDescription('')
    setFormSortOrder('0')
    setDialogOpen(true)
  }

  const openEditDialog = (tier: PricingTier) => {
    setEditingTier(tier)
    setFormLabel(tier.label)
    setFormDuration(tier.duration_minutes.toString())
    setFormPrice(tier.price.toString())
    setFormDescription(tier.description || '')
    setFormSortOrder(tier.sort_order.toString())
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const data = {
      label: formLabel,
      duration_minutes: Number(formDuration),
      price: Number(formPrice),
      description: formDescription || undefined,
      sort_order: Number(formSortOrder),
    }

    const result = editingTier
      ? await updatePricingTier(editingTier.id, data)
      : await createPricingTier(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingTier ? 'Tier updated' : 'Tier created')
      setDialogOpen(false)
      await fetchTiers()
    }
    setSaving(false)
  }

  const handleToggle = async (tier: PricingTier) => {
    const result = await togglePricingTier(tier.id, !tier.is_active)
    if (result.error) {
      toast.error(result.error)
    } else {
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tier.id ? { ...t, is_active: !t.is_active } : t
        )
      )
      toast.success(tier.is_active ? 'Tier deactivated' : 'Tier activated')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return
    const result = await deletePricingTier(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setTiers((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tier deleted')
    }
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
          <p className="text-gray-500">
            Manage your coaching session pricing tiers.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tier
        </Button>
      </div>

      {tiers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={!tier.is_active ? 'opacity-60' : ''}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{tier.label}</CardTitle>
                  {tier.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {tier.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={
                    tier.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }
                >
                  {tier.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-gray-500">
                    / {tier.duration_minutes} min
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(tier)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(tier)}
                    title={tier.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {tier.is_active ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tier.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center bg-white">
          <p className="text-gray-500">
            No pricing tiers yet. Add your first one!
          </p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Edit Pricing Tier' : 'New Pricing Tier'}
            </DialogTitle>
            <DialogDescription>
              {editingTier
                ? 'Update the pricing tier details.'
                : 'Create a new coaching session pricing tier.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder="e.g. Standard Session"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  min={15}
                  max={480}
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  placeholder="175"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="A full-hour deep dive into your challenges."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formLabel || !formDuration || !formPrice}
            >
              {saving ? 'Saving...' : editingTier ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
