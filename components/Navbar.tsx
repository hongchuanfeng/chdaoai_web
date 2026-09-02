'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Language } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // 鼠标进入一级菜单时显示对应的二级菜单
  const handleMenuEnter = (menu: string | null) => {
    setActiveMenu(menu)
  }

  // 鼠标离开时隐藏所有二级菜单
  const handleMenuLeave = () => {
    setActiveMenu(null)
  }
  const [mobileImageToolsOpen, setMobileImageToolsOpen] = useState(false)
  const [mobileVideoToolsOpen, setMobileVideoToolsOpen] = useState(false)
  const [mobileAudioToolsOpen, setMobileAudioToolsOpen] = useState(false)
  const [mobileSubtitleToolsOpen, setMobileSubtitleToolsOpen] = useState(false)
  const [mobilePdfToolsOpen, setMobilePdfToolsOpen] = useState(false)
  const [mobileCsvToolsOpen, setMobileCsvToolsOpen] = useState(false)
  const [mobileOtherToolsOpen, setMobileOtherToolsOpen] = useState(false)
  const [mobileQRCodeToolsOpen, setMobileQRCodeToolsOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // 辅助函数：获取带语言前缀的路径
  const getLangPath = (path: string, lang: string): string => {
    if (path === '/') return `/${lang}`
    return `/${lang}${path}`
  }

  const ensureUserRecord = async (u: any) => {
    if (!u?.id) return
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', u.id)
      .single()

    if ((error && error.code === 'PGRST116') || (!data && !error)) {
      await supabase
        .from('users')
        .insert({
          id: u.id,
          email: u.email,
          credits: 5,
        })
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await ensureUserRecord(user)
      }
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        ensureUserRecord(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLanguageChange = (newLang: Language) => {
    console.log('[DEBUG] handleLanguageChange called, newLang:', newLang)
    
    // 始终更新语言状态
    setLanguage(newLang)
    document.cookie = `language=${newLang};path=/;max-age=31536000`
    localStorage.setItem('language', newLang)
    
    // 始终跳转（即使选择了相同的语言也强制刷新）
    const currentPath = window.location.pathname
    console.log('[DEBUG] currentPath:', currentPath)
    
    const pathWithoutLang = currentPath.replace(/^\/(en|zh|ru|ar|de|ja|fr|es|pt|ko)/, '') || '/'
    console.log('[DEBUG] pathWithoutLang:', pathWithoutLang)
    
    const newPath = getLangPath(pathWithoutLang, newLang)
    console.log('[DEBUG] newPath:', newPath)
    
    // 强制页面跳转
    console.log('[DEBUG] Calling window.location.replace')
    window.location.replace(newPath)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={getLangPath('/', language)} className="flex-shrink-0 flex items-center" onClick={() => setMobileOpen(false)}>
              <span className="text-2xl font-bold text-primary-600">chdaoai</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              <Link href={getLangPath('/', language)} className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap">
                {t('nav.home')}
              </Link>
              
              {/* Image Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleMenuEnter(activeMenu === 'image' ? null : 'image')}
                  onMouseEnter={() => handleMenuEnter('image')}
                  onMouseLeave={handleMenuLeave}
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center"
                >
                  {t('nav.image_tools')}
                  <svg className={`ml-1 h-4 w-4 transition-transform ${activeMenu === 'image' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu - Horizontal Layout with 2 Columns */}
                {activeMenu === 'image' && (
                  <div 
                    className="absolute left-0 mt-0 w-[600px] bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                    onMouseEnter={() => handleMenuEnter('image')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="flex">
                      {/* AI Image Tools Column */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.ai_image_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/ai-age-change', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_age_change')}</span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                        </Link>
                        <Link 
                          href={getLangPath('/gender-swapper', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.gender_swapper')}</span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                        </Link>
                        <Link 
                          href={getLangPath('/ai-face-beautify', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_face_beautify')}</span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                        </Link>
                        <Link 
                          href={getLangPath('/ai-remove-background', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_remove_background_new')}</span>
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">NEW</span>
                        </Link>
                        <Link 
                          href={getLangPath('/ai-drawing', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_drawing')}</span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                        </Link>
                        <Link 
                          href={getLangPath('/ai-comic', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_comic')}</span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                        </Link>
                        <Link 
                          href={getLangPath('/ai-text-to-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          <span>{t('nav.ai_text_to_image')}</span>
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">NEW</span>
                        </Link>
                      </div>

                      {/* Image Processing Tools Column */}
                      <div className="flex-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.image_processing_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/image-mosaic', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_mosaic')}
                        </Link>
                        <Link 
                          href={getLangPath('/image-compress', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_compress')}
                        </Link>
                        <Link 
                          href={getLangPath('/image-grid', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_grid')}
                        </Link>
                        <Link 
                          href={getLangPath('/nine-grid', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_nine_grid')}
                        </Link>
                        <Link 
                          href={getLangPath('/rounded-corner', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.rounded_corner')}
                        </Link>
                        <Link 
                          href={getLangPath('/remove-background', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.remove_background')}
                        </Link>
                        <Link 
                          href={getLangPath('/crop-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.crop_image')}
                        </Link>
                        <Link 
                          href={getLangPath('/grayscale', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.grayscale')}
                        </Link>
                        <Link 
                          href={getLangPath('/text-to-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.text_to_image')}
                        </Link>
                        <Link 
                          href={getLangPath('/enlarge-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.enlarge_image')}
                        </Link>
                        <Link 
                          href={getLangPath('/change-background', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.change_background')}
                        </Link>
                        <Link 
                          href={getLangPath('/image-format-conversion', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_format_conversion')}
                        </Link>
                        <Link 
                          href={getLangPath('/add-watermark', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.add_watermark')}
                        </Link>
                        <Link 
                          href={getLangPath('/merge-images', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.merge_images')}
                        </Link>
                        <Link 
                          href={getLangPath('/photo-restoration', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.photo_restoration')}
                        </Link>
                        <Link 
                          href={getLangPath('/rotate-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.rotate_image')}
                        </Link>
                        <Link 
                          href={getLangPath('/ico-generator', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ico_generator')}
                        </Link>
                        <Link 
                          href={getLangPath('/add-text', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.add_text')}
                        </Link>
                        <Link 
                          href={getLangPath('/colorize-image', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.colorize_image')}
                        </Link>
                        <Link 
                          href={getLangPath('/view-exif', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.view_exif')}
                        </Link>
                        <Link 
                          href={getLangPath('/image-hosting', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.image_hosting')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                    
              {/* Video Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleMenuEnter(activeMenu === 'video' ? null : 'video')}
                  onMouseEnter={() => handleMenuEnter('video')}
                  onMouseLeave={handleMenuLeave}
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center"
                >
                  {t('nav.video_tools')}
                  <svg className={`ml-1 h-4 w-4 transition-transform ${activeMenu === 'video' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Video Tools Dropdown Menu */}
                {activeMenu === 'video' && (
                  <div 
                    className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                    onMouseEnter={() => handleMenuEnter('video')}
                    onMouseLeave={handleMenuLeave}
                  >
                    {/* Video Tools */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {t('nav.video_tools')}
                    </div>
                          <Link 
                            href={getLangPath('/video-watermark-removal', language)} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                          >
                            {t('nav.video_watermark_removal')}
                          </Link>
                          <Link 
                            href={getLangPath('/video-to-text', language)} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                          >
                            {t('nav.video_to_text')}
                          </Link>
                          <Link 
                            href={getLangPath('/video-to-speech', language)} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                          >
                            {t('nav.video_to_speech')}
                          </Link>
                          <Link 
                            href={getLangPath('/old-video-restoration', language)} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                          >
                            {t('nav.old_video_restoration')}
                          </Link>
                  </div>
                )}
              </div>

              {/* Audio & Subtitle Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleMenuEnter(activeMenu === 'audio' ? null : 'audio')}
                  onMouseEnter={() => handleMenuEnter('audio')}
                  onMouseLeave={handleMenuLeave}
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center"
                >
                  {t('nav.audio_tools')}
                  <svg className={`ml-1 h-4 w-4 transition-transform ${activeMenu === 'audio' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Audio & Subtitle Tools Dropdown Menu - Horizontal Layout */}
                {activeMenu === 'audio' && (
                  <div 
                    className="absolute left-0 mt-0 w-[480px] bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                    onMouseEnter={() => handleMenuEnter('audio')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="flex">
                      {/* Audio Tools Section */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.audio_tools_dropdown')}
                        </div>
                        <Link 
                          href={getLangPath('/audio-clip-merge', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.audio_clip_merge')}
                        </Link>
                        <Link 
                          href={getLangPath('/audio-format-conversion', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.audio_format_conversion')}
                        </Link>
                        <Link 
                          href={getLangPath('/vocal-separation', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.vocal_separation')}
                        </Link>
                        <Link 
                          href={getLangPath('/audio-to-text', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.audio_to_text')}
                        </Link>
                        <Link 
                          href={getLangPath('/audio-to-subtitles', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.audio_to_subtitles')}
                        </Link>
                        <Link 
                          href={getLangPath('/audio-repair', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.audio_repair')}
                        </Link>
                      </div>

                      {/* Subtitle Tools Section */}
                      <div className="flex-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.subtitle_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/text-to-subtitles', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.text_to_subtitles')}
                        </Link>
                        <Link 
                          href={getLangPath('/subtitles-to-text', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.subtitles_to_text')}
                        </Link>
                        <Link 
                          href={getLangPath('/subtitle-format-conversion', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.subtitle_format_conversion')}
                        </Link>
                        <Link 
                          href={getLangPath('/subtitle-translation', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.subtitle_translation')}
                        </Link>
                        <Link 
                          href={getLangPath('/subtitle-merge', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.subtitle_merge')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Tools Dropdown - CSV & eBook & PDF */}
              <div className="relative">
                <button
                  onClick={() => handleMenuEnter(activeMenu === 'other' ? null : 'other')}
                  onMouseEnter={() => handleMenuEnter('other')}
                  onMouseLeave={handleMenuLeave}
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center"
                >
                  {t('nav.other_tools')}
                  <svg className={`ml-1 h-4 w-4 transition-transform ${activeMenu === 'other' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Other Tools Dropdown Menu - Horizontal Layout */}
                {activeMenu === 'other' && (
                  <div 
                    className="absolute left-0 mt-0 w-[600px] bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                    onMouseEnter={() => handleMenuEnter('other')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="flex">
                      {/* CSV Tools Section */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.csv_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/csv-merge', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.csv_merge')}
                        </Link>
                        <Link 
                          href={getLangPath('/csv-split', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.csv_split')}
                        </Link>
                        <Link 
                          href={getLangPath('/csv-deduplicate', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.csv_deduplicate')}
                        </Link>
                      </div>
                      
                      {/* eBook Tools Section */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.ebook_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/ebook-merge', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ebook_merge')}
                        </Link>
                        <Link 
                          href={getLangPath('/document-to-ebook', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.document_to_ebook')}
                        </Link>
                        <Link 
                          href={getLangPath('/ebook-watermark-removal', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ebook_watermark_removal')}
                        </Link>
                        <Link 
                          href={getLangPath('/ebook-to-speech', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ebook_to_speech')}
                        </Link>
                        <Link 
                          href={getLangPath('/ebook-subtitles', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ebook_subtitles')}
                        </Link>
                        <Link 
                          href={getLangPath('/ebook-format-conversion', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.ebook_format_conversion')}
                        </Link>
                      </div>
                      
                      {/* PDF Tools Section */}
                      <div className="flex-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.pdf_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/pdf-merge', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_merge')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-split', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_split')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-deduplicate', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_deduplicate')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-convert', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_convert')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-to-audio', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_to_audio')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-to-text', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_to_text')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-to-subtitles', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_to_subtitles')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-translate', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_translate')}
                        </Link>
                        <Link 
                          href={getLangPath('/document-to-pdf', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.document_to_pdf')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-add-watermark', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_add_watermark')}
                        </Link>
                        <Link 
                          href={getLangPath('/pdf-remove-watermark', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.pdf_remove_watermark')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div> 

              {/* QR Code & Barcode Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleMenuEnter(activeMenu === 'qrcode' ? null : 'qrcode')}
                  onMouseEnter={() => handleMenuEnter('qrcode')}
                  onMouseLeave={handleMenuLeave}
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap inline-flex items-center"
                >
                  {t('nav.qrcode_barcode_tools')}
                  <svg className={`ml-1 h-4 w-4 transition-transform ${activeMenu === 'qrcode' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* QR Code & Barcode Tools Dropdown Menu */}
                {activeMenu === 'qrcode' && (
                  <div 
                    className="absolute left-0 mt-0 w-[400px] bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100"
                    onMouseEnter={() => handleMenuEnter('qrcode')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="flex">
                      {/* QR Code Section */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.qrcode_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/qrcode-generate', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.qrcode_generate')}
                        </Link>
                        <Link 
                          href={getLangPath('/qrcode-recognize', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.qrcode_recognize')}
                        </Link>
                      </div>
                      
                      {/* Barcode Section */}
                      <div className="flex-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('nav.barcode_tools')}
                        </div>
                        <Link 
                          href={getLangPath('/barcode-generate', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.barcode_generate')}
                        </Link>
                        <Link 
                          href={getLangPath('/barcode-recognize', language)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { handleMenuLeave(); setMobileOpen(false); }}
                        >
                          {t('nav.barcode_recognize')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Link href={getLangPath('/subscribe', language)} className="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium whitespace-nowrap">
                {t('nav.subscribe')}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <div className="relative hidden sm:block">
              <select
                value={language}
                onClick={() => console.log('[DEBUG] select clicked, current value:', language)}
                onChange={(e) => {
                  console.log('[DEBUG] select onChange triggered, value:', e.target.value)
                  handleLanguageChange(e.target.value as Language)
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer w-20"
                style={{ color: '#111827' }}
              >
                <option value="en" style={{ color: '#111827', backgroundColor: '#ffffff' }}>English</option>
                <option value="zh" style={{ color: '#111827', backgroundColor: '#ffffff' }}>中文</option>
                <option value="ru" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Русский</option>
                <option value="ar" style={{ color: '#111827', backgroundColor: '#ffffff' }}>العربية</option>
                <option value="de" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Deutsch</option>
                <option value="ja" style={{ color: '#111827', backgroundColor: '#ffffff' }}>日本語</option>
                <option value="fr" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Français</option>
                <option value="es" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Español</option>
                <option value="pt" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Português</option>
                <option value="ko" style={{ color: '#111827', backgroundColor: '#ffffff' }}>한국어</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(prev => !prev)}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop user/login area */}
            <div className="hidden sm:flex items-center space-x-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href={getLangPath('/profile', language)}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href={getLangPath('/auth/login', language)}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
                  >
                    {t('nav.login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
          <div className="px-4 pt-4 pb-4 space-y-1">
            <Link href={getLangPath('/', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </Link>
            
            {/* Mobile Image Tools Dropdown */}
            <div>
              <button 
                onClick={() => setMobileImageToolsOpen(!mobileImageToolsOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                {t('nav.image_tools')}
                <svg className={`h-4 w-4 transition-transform ${mobileImageToolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileImageToolsOpen && (
                <div className="pl-4 space-y-1">
                  {/* AI Image Tools */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                    {t('nav.ai_image_tools')}
                  </div>
                  <Link href={getLangPath('/ai-age-change', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.ai_age_change')}</span>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                  </Link>
                  <Link href={getLangPath('/gender-swapper', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.gender_swapper')}</span>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                  </Link>
                  <Link href={getLangPath('/ai-face-beautify', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.ai_face_beautify')}</span>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                  </Link>
                  <Link href={getLangPath('/ai-remove-background', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.ai_remove_background_new')}</span>
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">NEW</span>
                  </Link>
                  <Link href={getLangPath('/ai-drawing', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.ai_drawing')}</span>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                  </Link>
                  <Link href={getLangPath('/ai-comic', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                    <span>{t('nav.ai_comic')}</span>
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">VIP</span>
                  </Link>

                  {/* Image Processing Tools */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1 mt-2">
                    {t('nav.image_processing_tools')}
                  </div>
                  <Link href={getLangPath('/image-mosaic', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_mosaic')}
                  </Link>
                  <Link href={getLangPath('/image-compress', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_compress')}
                  </Link>
                  <Link href={getLangPath('/image-grid', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_grid')}
                  </Link>
                  <Link href={getLangPath('/nine-grid', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_nine_grid')}
                  </Link>
                  <Link href={getLangPath('/rounded-corner', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.rounded_corner')}
                  </Link>
                  <Link href={getLangPath('/remove-background', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.remove_background')}
                  </Link>
                  <Link href={getLangPath('/crop-image', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.crop_image')}
                  </Link>
                  <Link href={getLangPath('/grayscale', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.grayscale')}
                  </Link>
                  <Link href={getLangPath('/text-to-image', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.text_to_image')}
                  </Link>
                  <Link href={getLangPath('/enlarge-image', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.enlarge_image')}
                  </Link>
                  <Link href={getLangPath('/change-background', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.change_background')}
                  </Link>
                  <Link href={getLangPath('/image-format-conversion', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_format_conversion')}
                  </Link>
                  <Link href={getLangPath('/add-watermark', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.add_watermark')}
                  </Link>
                  <Link href={getLangPath('/merge-images', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.merge_images')}
                  </Link>
                  <Link href={getLangPath('/photo-restoration', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.photo_restoration')}
                  </Link>
                  <Link href={getLangPath('/rotate-image', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.rotate_image')}
                  </Link>
                  <Link href={getLangPath('/ico-generator', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ico_generator')}
                  </Link>
                  <Link href={getLangPath('/remove-watermark', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_watermark_removal')}
                  </Link>
                  <Link href={getLangPath('/add-text', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.add_text')}
                  </Link>
                  <Link href={getLangPath('/colorize-image', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.colorize_image')}
                  </Link>
                  <Link href={getLangPath('/view-exif', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.view_exif')}
                  </Link>
                  <Link href={getLangPath('/image-hosting', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.image_hosting')}
                  </Link>
                </div>
              )}
            </div>
                  
            {/* Mobile Video Tools Dropdown */}
            <div>
                    <button 
                      onClick={() => setMobileVideoToolsOpen(!mobileVideoToolsOpen)}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      {t('nav.video_tools')}
                      <svg className={`h-4 w-4 transition-transform ${mobileVideoToolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {mobileVideoToolsOpen && (
                      <div className="pl-4 space-y-1">
                  {/* Video Tools */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                    {t('nav.video_tools')}
                  </div>
                        <Link href={getLangPath('/video-watermark-removal', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                          {t('nav.video_watermark_removal')}
                        </Link>
                        <Link href={getLangPath('/video-to-text', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                          {t('nav.video_to_text')}
                        </Link>
                        <Link href={getLangPath('/video-to-speech', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                          {t('nav.video_to_speech')}
                        </Link>
                        <Link href={getLangPath('/old-video-restoration', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                          {t('nav.old_video_restoration')}
                        </Link>
                </div>
              )}
            </div>

            {/* Mobile Audio & Subtitle Tools Dropdown */}
            <div>
              <button 
                onClick={() => setMobileAudioToolsOpen(!mobileAudioToolsOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                {t('nav.audio_tools')}
                <svg className={`h-4 w-4 transition-transform ${mobileAudioToolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileAudioToolsOpen && (
                <div className="pl-4 space-y-1">
                  {/* Audio Tools Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                    {t('nav.audio_tools')}
                  </div>
                  <Link href={getLangPath('/audio-clip-merge', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.audio_clip_merge')}
                  </Link>
                  <Link href={getLangPath('/audio-format-conversion', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.audio_format_conversion')}
                  </Link>
                  <Link href={getLangPath('/vocal-separation', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.vocal_separation')}
                  </Link>
                  <Link href={getLangPath('/audio-to-text', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.audio_to_text')}
                  </Link>
                  <Link href={getLangPath('/audio-to-subtitles', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.audio_to_subtitles')}
                  </Link>
                  <Link href={getLangPath('/audio-repair', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.audio_repair')}
                  </Link>

                  {/* Subtitle Tools Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1 mt-2">
                    {t('nav.subtitle_tools')}
                  </div>
                  <Link href={getLangPath('/text-to-subtitles', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.text_to_subtitles')}
                  </Link>
                  <Link href={getLangPath('/subtitles-to-text', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.subtitles_to_text')}
                  </Link>
                  <Link href={getLangPath('/subtitle-format-conversion', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.subtitle_format_conversion')}
                  </Link>
                  <Link href={getLangPath('/subtitle-translation', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.subtitle_translation')}
                  </Link>
                  <Link href={getLangPath('/subtitle-merge', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.subtitle_merge')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Other Tools Dropdown - CSV, eBook & PDF */}
            <div>
              <button 
                onClick={() => setMobileOtherToolsOpen(!mobileOtherToolsOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                {t('nav.other_tools')}
                <svg className={`h-4 w-4 transition-transform ${mobileOtherToolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileOtherToolsOpen && (
                <div className="pl-4 space-y-1">
                  {/* CSV Tools Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                    {t('nav.csv_tools')}
                  </div>
                  <Link href={getLangPath('/csv-merge', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.csv_merge')}
                  </Link>
                  <Link href={getLangPath('/csv-split', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.csv_split')}
                  </Link>
                  <Link href={getLangPath('/csv-deduplicate', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.csv_deduplicate')}
                  </Link>
                  
                  {/* eBook Tools Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1 mt-2">
                    {t('nav.ebook_tools')}
                  </div>
                  <Link href={getLangPath('/ebook-merge', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ebook_merge')}
                  </Link>
                  <Link href={getLangPath('/document-to-ebook', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.document_to_ebook')}
                  </Link>
                  <Link href={getLangPath('/ebook-watermark-removal', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ebook_watermark_removal')}
                  </Link>
                  <Link href={getLangPath('/ebook-to-speech', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ebook_to_speech')}
                  </Link>
                  <Link href={getLangPath('/ebook-subtitles', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ebook_subtitles')}
                  </Link>
                  <Link href={getLangPath('/ebook-format-conversion', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.ebook_format_conversion')}
                  </Link>
                  
                  {/* PDF Tools Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1 mt-2">
                    {t('nav.pdf_tools')}
                  </div>
                  <Link href={getLangPath('/pdf-merge', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_merge')}
                  </Link>
                  <Link href={getLangPath('/pdf-split', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_split')}
                  </Link>
                  <Link href={getLangPath('/pdf-deduplicate', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_deduplicate')}
                  </Link>
                  <Link href={getLangPath('/pdf-convert', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_convert')}
                  </Link>
                  <Link href={getLangPath('/pdf-to-audio', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_to_audio')}
                  </Link>
                  <Link href={getLangPath('/pdf-to-text', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_to_text')}
                  </Link>
                  <Link href={getLangPath('/pdf-to-subtitles', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_to_subtitles')}
                  </Link>
                  <Link href={getLangPath('/pdf-translate', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_translate')}
                  </Link>
                  <Link href={getLangPath('/document-to-pdf', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.document_to_pdf')}
                  </Link>
                  <Link href={getLangPath('/pdf-add-watermark', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_add_watermark')}
                  </Link>
                  <Link href={getLangPath('/pdf-remove-watermark', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.pdf_remove_watermark')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile QR Code & Barcode Tools Dropdown */}
            <div>
              <button 
                onClick={() => setMobileQRCodeToolsOpen(!mobileQRCodeToolsOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                {t('nav.qrcode_barcode_tools')}
                <svg className={`h-4 w-4 transition-transform ${mobileQRCodeToolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileQRCodeToolsOpen && (
                <div className="pl-4 space-y-1">
                  {/* QR Code Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                    {t('nav.qrcode_tools')}
                  </div>
                  <Link href={getLangPath('/qrcode-generate', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.qrcode_generate')}
                  </Link>
                  <Link href={getLangPath('/qrcode-recognize', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.qrcode_recognize')}
                  </Link>
                  
                  {/* Barcode Section */}
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1 mt-2">
                    {t('nav.barcode_tools')}
                  </div>
                  <Link href={getLangPath('/barcode-generate', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.barcode_generate')}
                  </Link>
                  <Link href={getLangPath('/barcode-recognize', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.barcode_recognize')}
                  </Link>
                </div>
              )}
            </div>
            
            <Link href={getLangPath('/subscribe', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
              {t('nav.subscribe')}
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <>
                  <Link href={getLangPath('/profile', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.profile')}
                  </Link>
                  <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href={getLangPath('/auth/login', language)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </>
              )}
            </div>

            <div className="pt-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
