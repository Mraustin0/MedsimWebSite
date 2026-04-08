'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { cn } from '@/components/ui/cn'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (res?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        setIsLoading(false)
        return
      }
      // Middleware will redirect based on role
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error:', err)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      setIsLoading(false)
    }
  }

  const handleKKULogin = () => {
    setIsLoading(true)
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#ffffff] selection:bg-primary-container selection:text-on-primary-container font-sans antialiased text-[#1a1a1a]">
      {/* Material Symbols Import */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
        }
        .minimal-input {
          border: 1px solid #e5e7eb;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .minimal-input:focus {
          border-color: #006948;
          box-shadow: 0 0 0 4px rgba(0, 105, 72, 0.05);
        }
        .subtle-bg {
          background: radial-gradient(circle at top left, #fcfdfc 0%, #ffffff 100%);
        }
      `}} />

      {/* Left Side: Refined Branding & Inspiration */}
      <section className="hidden md:flex flex-[1.2] relative items-center justify-center px-16 pt-24 pb-16 overflow-hidden subtle-bg">
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#7ff3be]/20 via-white to-white"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-16 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">MedSim</span>
          </div>

          <h1 className="text-6xl font-light text-[#1a1a1a] leading-[1.1] mb-8 tracking-tight">
            Elevate your <br/>
            <span className="font-extrabold text-[#006948]">clinical intuition.</span>
          </h1>

          <p className="text-lg text-[#595c5d] leading-relaxed font-normal mb-12 max-w-sm">
            Access high-fidelity simulations designed for the next generation of healthcare professionals.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-[#595c5d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]/40"></span>
              <span className="text-sm font-medium tracking-wide">Real-time adaptive feedback</span>
            </div>
            <div className="flex items-center gap-4 text-[#595c5d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]/40"></span>
              <span className="text-sm font-medium tracking-wide">AI-powered patient personas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Minimalist Login Form */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-white border-l border-[#f5f5f5]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-[#006948] flex items-center justify-center text-white">
              <span className="material-symbols-outlined !text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">MedSim</span>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-3">Sign in</h2>
            <p className="text-[#595c5d] text-sm font-medium">Please enter your credentials to continue.</p>
            {error && <p className="mt-4 text-sm font-bold text-error animate-shake">{error}</p>}
          </div>

          {/* Single Form for All Users (Minimalist) */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#595c5d]/80 ml-0.5" htmlFor="email">Institutional Email</label>
              <input 
                className="w-full px-5 py-4 bg-[#f8f9fa] minimal-input border-transparent rounded-xl text-[#1a1a1a] placeholder:text-[#757778]/40 text-sm outline-none" 
                id="email" 
                placeholder="name@institution.edu" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#595c5d]/80" htmlFor="password">Password</label>
                <button onClick={() => alert('กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน')} className="text-[11px] font-bold uppercase tracking-wider text-[#006948] hover:text-[#005b3e] transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-5 py-4 bg-[#f8f9fa] minimal-input border-transparent rounded-xl text-[#1a1a1a] placeholder:text-[#757778]/40 text-sm outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input className="w-4 h-4 border-[#dadddf] rounded text-[#006948] focus:ring-0 cursor-pointer" id="remember" type="checkbox"/>
              <label className="text-sm font-medium text-[#595c5d] cursor-pointer select-none" htmlFor="remember">Remember me</label>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-[#006948] text-white font-bold rounded-xl shadow-sm hover:bg-[#005b3e] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50" 
              type="submit"
            >
              {isLoading ? 'Processing...' : 'Access Dashboard'}
              {!isLoading && <span className="material-symbols-outlined !text-lg">arrow_right_alt</span>}
            </button>
          </form>

          {/* Institutional SSO (Added to maintain functionality while keeping the style) */}
          <div className="mt-6">
            <button 
              onClick={handleKKULogin}
              disabled={isLoading}
              className="w-full py-4 bg-white text-[#1a1a1a] border border-[#e5e7eb] font-bold rounded-xl shadow-sm hover:bg-[#f8f9fa] active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm tracking-wide disabled:opacity-50"
            >
              <div className="w-6 h-6 bg-[#A13A32] rounded-lg flex items-center justify-center text-white text-[9px] font-bold shadow-md">
                KKU
              </div>
              Sign in with KKU SSO
            </button>
          </div>

          <div className="mt-20 pt-10 border-t border-[#f5f5f5] text-center">
            <p className="text-sm text-[#595c5d] mb-6 font-medium">New to the platform?</p>
            <button className="text-xs font-bold uppercase tracking-widest text-[#006948] border border-[#006948]/20 px-6 py-3 rounded-full hover:bg-[#006948]/5 transition-all">
              Request Access
            </button>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[10px] text-[#757778]/60 font-medium uppercase tracking-[0.2em]">
              © 2024 MedSim Clinical Excellence
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Help Trigger */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-white text-[#595c5d] rounded-full shadow-lg flex items-center justify-center border border-[#f5f5f5] hover:text-[#006948] transition-all group">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">help_outline</span>
      </button>
    </div>
  )
}