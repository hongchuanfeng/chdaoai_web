'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '@/contexts/LanguageContext'

// 简单的翻译
const translations: Record<string, Record<string, string>> = {
  en: { 
    title: 'Login', 
    email: 'Email', 
    password: 'Password', 
    sign_in: 'Sign In',
    or_continue: 'or continue with',
    forgot_password: 'Forgot Password?',
    no_account: "Don't have an account?",
    register: 'Sign Up',
    email_placeholder: 'Enter your email',
    password_placeholder: 'Enter your password',
    logging_in: 'Logging in...'
  },
  zh: { 
    title: '欢迎回来', 
    email: '邮箱', 
    password: '密码', 
    sign_in: '登录',
    or_continue: '或使用以下方式继续',
    forgot_password: '忘记密码?',
    no_account: '还没有账户？',
    register: '注册',
    email_placeholder: '请输入邮箱',
    password_placeholder: '请输入密码',
    logging_in: '登录中...'
  },
  ru: { 
    title: 'С возвращением', 
    email: 'Эл. почта', 
    password: 'Пароль', 
    sign_in: 'Войти',
    or_continue: 'или продолжить с',
    forgot_password: 'Забыли пароль?',
    no_account: 'Нет аккаунта?',
    register: 'Регистрация',
    email_placeholder: 'Введите эл. почту',
    password_placeholder: 'Введите пароль',
    logging_in: 'Вход...'
  },
  ar: { 
    title: 'مرحبًا بعودتك', 
    email: 'البريد الإلكتروني', 
    password: 'كلمة المرور', 
    sign_in: 'تسجيل الدخول',
    or_continue: 'أو تابع باستخدام',
    forgot_password: 'نسيت كلمة المرور؟',
    no_account: 'ليس لديك حساب؟',
    register: 'تسجيل',
    email_placeholder: 'أدخل البريد الإلكتروني',
    password_placeholder: 'أدخل كلمة المرور',
    logging_in: 'جاري تسجيل الدخول...'
  },
  de: { 
    title: 'Willkommen zurück', 
    email: 'E-Mail', 
    password: 'Passwort', 
    sign_in: 'Anmelden',
    or_continue: 'oder fortfahren mit',
    forgot_password: 'Passwort vergessen?',
    no_account: 'Kein Konto?',
    register: 'Registrieren',
    email_placeholder: 'E-Mail eingeben',
    password_placeholder: 'Passwort eingeben',
    logging_in: 'Anmeldung...'
  },
  ja: { 
    title: 'おかえりなさい', 
    email: 'メールアドレス', 
    password: 'パスワード', 
    sign_in: 'ログイン',
    or_continue: 'または以下で続行',
    forgot_password: 'パスワードをお忘れですか？',
    no_account: 'アカウントをお持ちでないですか？',
    register: '登録',
    email_placeholder: 'メールアドレスを入力',
    password_placeholder: 'パスワードを入力',
    logging_in: 'ログイン中...'
  },
  fr: { 
    title: 'Bon retour', 
    email: 'E-mail', 
    password: 'Mot de passe', 
    sign_in: 'Se connecter',
    or_continue: 'ou continuer avec',
    forgot_password: 'Mot de passe oublié ?',
    no_account: 'Pas de compte ?',
    register: "S'inscrire",
    email_placeholder: 'Entrez votre e-mail',
    password_placeholder: 'Entrez votre mot de passe',
    logging_in: 'Connexion...'
  },
  es: { 
    title: 'Bienvenido de nuevo', 
    email: 'Correo electrónico', 
    password: 'Contraseña', 
    sign_in: 'Iniciar sesión',
    or_continue: 'o continuar con',
    forgot_password: '¿Olvidaste tu contraseña?',
    no_account: '¿No tienes cuenta?',
    register: 'Regístrate',
    email_placeholder: 'Ingresa tu correo',
    password_placeholder: 'Ingresa tu contraseña',
    logging_in: 'Iniciando sesión...'
  },
  pt: { 
    title: 'Bem-vindo de volta', 
    email: 'E-mail', 
    password: 'Senha', 
    sign_in: 'Entrar',
    or_continue: 'ou continue com',
    forgot_password: 'Esqueceu a senha?',
    no_account: 'Não tem conta?',
    register: 'Cadastre-se',
    email_placeholder: 'Digite seu e-mail',
    password_placeholder: 'Digite sua senha',
    logging_in: 'Entrando...'
  },
  ko: { 
    title: '다시 오신 것을 환영합니다', 
    email: '이메일', 
    password: '비밀번호', 
    sign_in: '로그인',
    or_continue: '또는 계속하기',
    forgot_password: '비밀번호를 잊으셨나요?',
    no_account: '계정이 없으신가요?',
    register: '회원가입',
    email_placeholder: '이메일 입력',
    password_placeholder: '비밀번호 입력',
    logging_in: '로그인 중...'
  },
}

export default function LoginPage() {
  const router = useRouter()
  const { language: lang } = useLanguage()
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const t = (key: string) => translations[lang]?.[key] || translations['en'][key] || key

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(lang === 'en' ? 'Please enter email and password' : '请输入邮箱和密码')
      return
    }

    setLoading(true)
    setError('')
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(`/${lang}/profile`)
    router.refresh()
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

        {/* Google 登录按钮 */}
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

        {/* 登录表单 */}
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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-[#42D392] text-white font-medium rounded-lg hover:bg-[#3BC882] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('logging_in') : t('sign_in')}
          </button>
        </div>

        {/* 底部链接 */}
        <div className="mt-6 text-center text-sm">
          <a href="#" className="text-blue-600 hover:underline mr-4">
            {t('forgot_password')}
          </a>
          <span className="text-gray-500">{t('no_account')}</span>
          <Link href={`/${lang}/auth/register`} className="text-blue-600 hover:underline ml-1">
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  )
}
