import PasswordRecoveryForm from '@/components/auth/PasswordRecoveryForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            MakerCycle
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Recupera el acceso a tu cuenta
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <PasswordRecoveryForm />
        </div>
      </div>
    </div>
  )
}