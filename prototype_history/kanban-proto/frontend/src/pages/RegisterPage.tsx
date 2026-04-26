import { useNavigate, Link } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">KanbanApp</h1>
          <p className="text-gray-500 mt-1">Create your free account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <RegisterForm onSuccess={() => navigate('/dashboard')} />

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}