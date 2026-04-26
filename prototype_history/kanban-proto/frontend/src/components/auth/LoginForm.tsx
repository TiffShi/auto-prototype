import { useState, FormEvent } from 'react'
import { useAuthStore } from '../../store/authStore'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const errors: { email?: string; password?: string } = {}
    if (!email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email address'
    if (!password) errors.password = 'Password is required'
    return errors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    try {
      await login(email, password)
      onSuccess?.()
    } catch {
      // error handled in store
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      <Button type="submit" isLoading={isLoading} className="mt-2">
        Sign In
      </Button>
    </form>
  )
}