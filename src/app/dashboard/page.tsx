import { SCENARIOS } from '@/lib/scenarios'
import ScenarioCard from '@/components/ScenarioCard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Side Nav */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 flex-col py-8 bg-surface-container-lowest items-center gap-8 z-50 premium-shadow">
        <div className="w-10 h-10 cta-gradient rounded-xl flex items-center justify-center mb-4">
          <span className="text-on-primary text-lg">M</span>
        </div>
        <nav className="flex flex-col gap-4">
          {[
            { icon: '⊞', label: 'dashboard', active: true },
            { icon: '◎', label: 'simulations', active: false },
            { icon: '☰', label: 'library', active: false },
            { icon: '◈', label: 'performance', active: false },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center text-lg
                ${item.active
                  ? 'bg-primary-container/30 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
            >
              {item.icon}
            </a>
          ))}
        </nav>
        <div className="mt-auto">
          <button className="p-3 text-on-surface-variant hover:text-error transition-colors rounded-xl">
            ↪
          </button>
        </div>
      </aside>

      {/* Top Nav */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 lg:pl-24">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tight text-primary">MedSim</span>
          <div className="hidden md:flex items-center gap-1">
            {['Dashboard', 'Simulations', 'Library', 'Performance'].map((item, i) => (
              <a
                key={item}
                href="#"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${i === 0
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
            🔔
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-outline-variant/20">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-on-surface">Pannathat K.</p>
              <p className="text-xs text-on-surface-variant">Medical Student</p>
            </div>
            <div className="w-9 h-9 rounded-full cta-gradient flex items-center justify-center text-on-primary text-sm font-bold border-2 border-primary-container">
              P
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-6 lg:pl-28 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="headline-lg text-on-surface mb-1">
                เลือก scenario การซักประวัติ
              </h1>
              <p className="body-md text-on-surface-variant">
                เลือกผู้ป่วยที่ต้องการฝึกฝนทักษะการวินิจฉัย
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['ทั้งหมด', 'ง่าย', 'ปานกลาง', 'ยาก'].map((f, i) => (
                <button
                  key={f}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
                    ${i === 0
                      ? 'cta-gradient text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>

        {/* Progress Footer */}
        <footer className="mt-12 flex flex-col md:flex-row items-center justify-between p-8 bg-primary rounded-3xl gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(127,243,190,0.2)" strokeWidth="4"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke="#71E4B1"
                  strokeWidth="4" strokeDasharray="175" strokeDashoffset="44"
                  strokeLinecap="round"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-on-primary">
                75%
              </span>
            </div>
            <div>
              <h4 className="title-md text-on-primary">ความก้าวหน้าของคุณ</h4>
              <p className="body-md text-primary-fixed/70">คุณสำเร็จไปแล้ว 12 จาก 16 scenarios พื้นฐาน</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="label-sm text-on-primary/60 mb-1">NEXT MILESTONE</p>
              <p className="label-lg text-on-primary font-bold">Clinical Expert Badge</p>
            </div>
            <div className="w-12 h-12 bg-primary-fixed-dim rounded-2xl flex items-center justify-center text-on-primary-fixed text-xl">
              🏆
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
