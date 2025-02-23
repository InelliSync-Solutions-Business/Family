import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

export function LoginPage() {
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to backend auth
    login({ name: 'Family Member' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-100">
      <form onSubmit={handleSubmit} className="space-y-4 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif text-warm-800 mb-6">Family Legacy</h1>
        <Input placeholder="Username" required />
        <Input type="password" placeholder="Password" required />
        <Button type="submit" className="w-full bg-warm-600 hover:bg-warm-700">
          Enter Family Archive
        </Button>
      </form>
    </div>
  )
}
