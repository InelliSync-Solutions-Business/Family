import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUser({ name })
      toast({
        title: 'Settings updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-serif text-2xl text-warm-800 mb-6">Settings</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
            <p className="text-sm text-warm-600">
              This is how your name will appear to family members.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <p className="text-warm-800">{user?.email}</p>
            <p className="text-sm text-warm-600">
              Contact support to change your email address.
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-8 p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
        <p className="text-sm text-warm-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive" disabled={isLoading}>
          Delete Account
        </Button>
      </Card>
    </div>
  )
}
