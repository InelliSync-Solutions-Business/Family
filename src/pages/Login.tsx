import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ 
        email,
        password
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-100">
      <form onSubmit={handleSubmit} className="space-y-4 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif text-warm-800 mb-6">Family Legacy</h1>
        <Input 
          type="email"
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          type="password" 
          placeholder="Password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full bg-warm-600 hover:bg-warm-700">
          Enter Family Archive
        </Button>
      </form>
    </div>
  )
}
