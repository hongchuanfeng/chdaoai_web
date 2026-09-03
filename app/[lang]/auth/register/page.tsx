'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

// 简单的翻译
const translations: Record<string, Record<string, string>> = {
  en: { 
    title: 'Sign Up', 
    email: 'Email', 
    password: 'Password', 
    confirm_password: 'Confirm Password',
    sign_up: 'Sign Up',
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
    success: 'Sign up successful! Redirecting to profile...'
  },
  zh: { 
    title: '注册', 
    email: '邮箱', 
    password: '密码', 
    confirm_password: '确认密码',
    sign_up: '注册',
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
    success: '注册成功！正在跳转到个人资料...'
  },
  ru: { 
    title: 'Регистрация', 
    email: 'Эл. почта', 
    password: 'Пароль', 
    confirm_password: 'Подтвердите пароль',
    sign_up: 'Регистрация',
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
    success: 'Регистрация успешна! Перенаправление...'
  },
  ar: { 
    title: 'تسجيل', 
    email: 'البريد الإلكتروني', 
    password: 'كلمة المرور', 
    confirm_password: 'تأكيد كلمة المرور',
    sign_up: 'تسجيل',
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
    success: 'تم التسجيل بنجاح! جاري التحويل...'
  },
  de: { 
    title: 'Registrieren', 
    email: 'E-Mail', 
    password: 'Passwort', 
    confirm_password: 'Passwort bestätigen',
    sign_up: 'Registrieren',
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
    success: 'Registrierung erfolgreich! Weiterleitung...'
  },
  ja: { 
    title: '登録', 
    email: 'メールアドレス', 
    password: 'パスワード', 
    confirm_password: 'パスワード確認',
    sign_up: '登録',
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
    success: '登録成功！リダイレクト中...'
  },
  fr: { 
    title: "S'inscrire", 
    email: 'E-mail', 
    password: 'Mot de passe', 
    confirm_password: 'Confirmer le mot de passe',
    sign_up: "S'inscrire",
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
    success: 'Inscription réussie ! Redirection...'
  },
  es: { 
    title: 'Regístrate', 
    email: 'Correo electrónico', 
    password: 'Contraseña', 
    confirm_password: 'Confirmar contraseña',
    sign_up: 'Regístrate',
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
    success: '¡Registro exitoso! Redirigiendo...'
  },
  pt: { 
    title: 'Cadastre-se', 
    email: 'E-mail', 
    password: 'Senha', 
    confirm_password: 'Confirmar senha',
    sign_up: 'Cadastre-se',
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
    success: 'Cadastro realizado com sucesso! Redirecionando...'
  },
  ko: { 
    title: '회원가입', 
    email: '이메일', 
    password: '비밀번호', 
    confirm_password: '비밀번호 확인',
    sign_up: '회원가입',
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
    success: '회원가입 성공! 리다이렉트 중...'
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const { language: lang } = useLanguage()
  
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
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (lang === 'en' ? 'Registration failed' : '注册失败'))
        setLoading(false)
        return
      }

      setSuccess(t('success'))
      
      // Redirect to profile after successful registration
      setTimeout(() => {
        router.push(`/${lang}/profile`)
        router.refresh()
      }, 1500)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('confirm_password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
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
