'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid username or password. Please try again.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-(--shadow-modal) w-full max-w-md p-8 animate-slide-up">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-linear-to-br from-orange-400 to-orange-600 shadow-sm">
            <UtensilsCrossed size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Alfredough POS</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
            >
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <Input
            label="Username"
            type="text"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Enter username"
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            loading={loading}
            size="xl"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-gray-300 mt-6 select-none">
          Default: admin / admin123
        </p>
      </div>
    </div>
  )
}
