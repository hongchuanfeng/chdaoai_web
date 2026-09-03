'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

// 简单的翻译
const translations: Record<string, Record<string, string>> = {
  en: { 
    title: 'Login', 
    email: 'Email', 
    password: 'Password', 
    sign_in: 'Sign In',
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
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (lang === 'en' ? 'Login failed' : '登录失败'))
        setLoading(false)
        return
      }

      router.push(`/${lang}/profile`)
      router.refresh()
    } catch (err) {
      setError(lang === 'en' ? 'Network error, please try again' : '网络错误，请重试')
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
          <span className="text-gray-500">{t('no_account')}</span>
          <Link href={`/${lang}/auth/register`} className="text-blue-600 hover:underline ml-1">
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  )
}
