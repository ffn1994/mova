import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
      <p className="text-sm mb-6" style={{ color: '#B3B3B3' }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ResetPasswordForm />
    </>
  )
}
