'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/contexts/LanguageContext'

// 简单的翻译
const translations: Record<string, Record<string, string>> = {
  en: { 
    title: 'Sign Up', 
    email: 'Email', 
    password: 'Password', 
    confirm_password: 'Confirm Password',
    sign_up: 'Sign Up',
    or_continue: 'or continue with',
    forgot_password: 'Forgot Password?',
    have_account: 'Already have an account?',
    login: 'Login',
    email_placeholder: 'Enter your email',
    password_placeholder: 'Enter your password',
    confirm_placeholder: 'Confirm your password',
    fill_all: 'Please fill in all fields',
    password_mismatch: 'Passwords do not match',
    password_min: 'Password must be at least 6 characters',
    signing_up: 'Signing up...',
    success: 'Sign up successful! Please check your email for verification link.'
  },
  zh: { 
    title: '注册', 
    email: '邮箱', 
    password: '密码', 
    confirm_password: '确认密码',
    sign_up: '注册',
    or_continue: '或使用以下方式继续',
    forgot_password: '忘记密码?',
    have_account: '已有账户？',
    login: '登录',
    email_placeholder: '请输入邮箱',
    password_placeholder: '请输入密码',
    confirm_placeholder: '请再次输入密码',
    fill_all: '请填写所有字段',
    password_mismatch: '两次输入的密码不一致',
    password_min: '密码长度至少6位',
    signing_up: '注册中...',
    success: '注册成功！请检查邮箱验证链接。'
  },
  ru: { 
    title: 'Регистрация', 
    email: 'Эл. почта', 
    password: 'Пароль', 
    confirm_password: 'Подтвердите пароль',
    sign_up: 'Регистрация',
    or_continue: 'или продолжить с',
    forgot_password: 'Забыли пароль?',
    have_account: 'Есть аккаунт?',
    login: 'Войти',
    email_placeholder: 'Введите эл. почту',
    password_placeholder: 'Введите пароль',
    confirm_placeholder: 'Подтвердите пароль',
    fill_all: 'Пожалуйста, заполните все поля',
    password_mismatch: 'Пароли не совпадают',
    password_min: 'Пароль должен быть не менее 6 символов',
    signing_up: 'Регистрация...',
    success: 'Регистрация успешна! Проверьте свою почту.'
  },
  ar: { 
    title: 'تسجيل', 
    email: 'البريد الإلكتروني', 
    password: 'كلمة المرور', 
    confirm_password: 'تأكيد كلمة المرور',
    sign_up: 'تسجيل',
    or_continue: 'أو تابع باستخدام',
    forgot_password: 'نسيت كلمة المرور؟',
    have_account: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    email_placeholder: 'أدخل البريد الإلكتروني',
    password_placeholder: 'أدخل كلمة المرور',
    confirm_placeholder: 'تأكيد كلمة المرور',
    fill_all: 'يرجى ملء جميع الحقول',
    password_mismatch: 'كلمات المرور غير متطابقة',
    password_min: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
    signing_up: 'جاري التسجيل...',
    success: 'تم التسجيل بنجاح! تحقق من بريدك الإلكتروني.'
  },
  de: { 
    title: 'Registrieren', 
    email: 'E-Mail', 
    password: 'Passwort', 
    confirm_password: 'Passwort bestätigen',
    sign_up: 'Registrieren',
    or_continue: 'oder fortfahren mit',
    forgot_password: 'Passwort vergessen?',
    have_account: 'Sie haben bereits ein Konto?',
    login: 'Anmelden',
    email_placeholder: 'E-Mail eingeben',
    password_placeholder: 'Passwort eingeben',
    confirm_placeholder: 'Passwort bestätigen',
    fill_all: 'Bitte füllen Sie alle Felder aus',
    password_mismatch: 'Passwörter stimmen nicht überein',
    password_min: 'Passwort muss mindestens 6 Zeichen haben',
    signing_up: 'Registrierung...',
    success: 'Registrierung erfolgreich! Überprüfen Sie Ihre E-Mail.'
  },
  ja: { 
    title: '登録', 
    email: 'メールアドレス', 
    password: 'パスワード', 
    confirm_password: 'パスワード確認',
    sign_up: '登録',
    or_continue: 'または以下で続行',
    forgot_password: 'パスワードをお忘れですか？',
    have_account: 'すでにアカウントをお持ちですか？',
    login: 'ログイン',
    email_placeholder: 'メールアドレスを入力',
    password_placeholder: 'パスワードを入力',
    confirm_placeholder: 'パスワードを確認',
    fill_all: 'すべてのフィールドを入力してください',
    password_mismatch: 'パスワードが一致しません',
    password_min: 'パスワードは6文字以上である必要があります',
    signing_up: '登録中...',
    success: '登録成功！メールを確認してください。'
  },
  fr: { 
    title: "S'inscrire", 
    email: 'E-mail', 
    password: 'Mot de passe', 
    confirm_password: 'Confirmer le mot de passe',
    sign_up: "S'inscrire",
    or_continue: 'ou continuer avec',
    forgot_password: 'Mot de passe oublié ?',
    have_account: 'Vous avez déjà un compte ?',
    login: 'Se connecter',
    email_placeholder: 'Entrez votre e-mail',
    password_placeholder: 'Entrez votre mot de passe',
    confirm_placeholder: 'Confirmez le mot de passe',
    fill_all: "Veuillez remplir tous les champs",
    password_mismatch: 'Les mots de passe ne correspondent pas',
    password_min: 'Le mot de passe doit contenir au moins 6 caractères',
    signing_up: 'Inscription...',
    success: 'Inscription réussie ! Vérifiez votre e-mail.'
  },
  es: { 
    title: 'Regístrate', 
    email: 'Correo electrónico', 
    password: 'Contraseña', 
    confirm_password: 'Confirmar contraseña',
    sign_up: 'Regístrate',
    or_continue: 'o continuar con',
    forgot_password: '¿Olvidaste tu contraseña?',
    have_account: '¿Ya tienes cuenta?',
    login: 'Iniciar sesión',
    email_placeholder: 'Ingresa tu correo',
    password_placeholder: 'Ingresa tu contraseña',
    confirm_placeholder: 'Confirma tu contraseña',
    fill_all: 'Por favor complete todos los campos',
    password_mismatch: 'Las contraseñas no coinciden',
    password_min: 'La contraseña debe tener al menos 6 caracteres',
    signing_up: 'Registrando...',
    success: '¡Registro exitoso! Revisa tu correo electrónico.'
  },
  pt: { 
    title: 'Cadastre-se', 
    email: 'E-mail', 
    password: 'Senha', 
    confirm_password: 'Confirmar senha',
    sign_up: 'Cadastre-se',
    or_continue: 'ou continue com',
    forgot_password: 'Esqueceu a senha?',
    have_account: 'Já tem conta?',
    login: 'Entrar',
    email_placeholder: 'Digite seu e-mail',
    password_placeholder: 'Digite sua senha',
    confirm_placeholder: 'Confirme sua senha',
    fill_all: 'Por favor preencha todos os campos',
    password_mismatch: 'As senhas não coincidem',
    password_min: 'A senha deve ter pelo menos 6 caracteres',
    signing_up: 'Cadastrando...',
    success: 'Cadastro realizado com sucesso! Verifique seu e-mail.'
  },
  ko: { 
    title: '회원가입', 
    email: '이메일', 
    password: '비밀번호', 
    confirm_password: '비밀번호 확인',
    sign_up: '회원가입',
    or_continue: '또는 계속하기',
    forgot_password: '비밀번호를 잊으셨나요?',
    have_account: '계정이 이미 있으신가요?',
    login: '로그인',
    email_placeholder: '이메일 입력',
    password_placeholder: '비밀번호 입력',
    confirm_placeholder: '비밀번호 확인',
    fill_all: '모든 필드를 입력해주세요',
    password_mismatch: '비밀번호가 일치하지 않습니다',
    password_min: '비밀번호는 6자 이상이어야 합니다',
    signing_up: '회원가입 중...',
    success: '회원가입 성공! 이메일을 확인해주세요.'
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const { language: lang } = useLanguage()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const t = (key: string) => translations[lang]?.[key] || translations['en'][key] || key

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t('fill_all'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('password_mismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('password_min'))
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(t('success'))
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/${lang}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-10">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            {t('title')}
          </h2>
        </div>

        {/* Google 注册按钮 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* 分隔线 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{t('or_continue')}</span>
          </div>
        </div>

        {/* 注册表单 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full h-11 px-4 bg-[#E8F0FE] rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password_placeholder')}
              className="w-full h-11 px-4 bg-[#E8F0FE] rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('confirm_password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirm_placeholder')}
              className="w-full h-11 px-4 bg-[#E8F0FE] rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-[#42D392] text-white font-medium rounded-lg hover:bg-[#3BC882] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('signing_up') : t('sign_up')}
          </button>
        </div>

        {/* 底部链接 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">{t('have_account')}</span>
          <Link href={`/${lang}/auth/login`} className="text-blue-600 hover:underline ml-1">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  )
}

