import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Plus, FolderOpen, ClipboardList, BarChart2,
  Gauge, Activity, Sliders, RefreshCw, Radio,
  GitBranch, MapPin, ChevronRight, Trash2, X, User
} from 'lucide-react'
import { useStore } from '../store/useStore'

const DAYS_ID = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatDateID(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_ID[d.getMonth()]
  const year = d.getFullYear()
  const dayName = DAYS_ID[d.getDay()]
  return `${day} ${month} ${year} ${dayName}`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function getInitials(name) {
  if (!name) return 'TK'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const MENUS = [
  { path: '/data-form',    title: 'Data Form',        subtitle: 'Input data administrasi',   icon: ClipboardList, color: '#1A3A6B' },
  { path: '/highlight',   title: 'Highlight',         subtitle: 'Ringkasan hasil uji',       icon: BarChart2,     color: '#16A34A' },
  { path: '/metering',    title: 'Metering',          subtitle: 'Uji akurasi metering',      icon: Gauge,         color: '#F57C00' },
  { path: '/karakteristik', title: 'Kar. Distance',   subtitle: 'Uji zona impedansi',        icon: Activity,      color: '#7C3AED' },
  { path: '/ocr',         title: 'OCR / GFR',         subtitle: 'Overcurrent & earth fault', icon: Sliders,       color: '#DC2626' },
  { path: '/ar-synchro',  title: 'AR & Synchro',      subtitle: 'Auto reclosing & synchro',  icon: RefreshCw,     color: '#0D9488' },
  { path: '/teleproteksi', title: 'Teleproteksi',     subtitle: 'Skema proteksi jarak jauh', icon: Radio,         color: '#4F46E5' },
  { path: '/lcd',         title: 'LCD Differ.',        subtitle: 'Differential relay',        icon: GitBranch,     color: '#0891B2' },
  { path: '/fault-locator', title: 'Fault Locator',   subtitle: 'Lokasi gangguan',           icon: MapPin,        color: '#D97706' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { dataForm, currentProject, projects, createProject, loadProject, deleteProject, getProgress } = useStore()

  const [showNewModal, setShowNewModal] = useState(false)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [newGI, setNewGI] = useState('')
  const [newBay, setNewBay] = useState('')
  const [creating, setCreating] = useState(false)

  const progress = getProgress()

  const name = dataForm.penangungJawab || dataForm.pelaksana1 || 'Teknisi HAR'
  const gi = currentProject?.giName || dataForm.garduInduk || '-'

  async function handleCreate() {
    if (!newGI.trim()) return
    setCreating(true)
    try {
      await createProject(newGI.trim(), newBay.trim())
      setShowNewModal(false)
      setNewGI('')
      setNewBay('')
      navigate('/data-form')
    } finally {
      setCreating(false)
    }
  }

  async function handleLoad(id) {
    await loadProject(id)
    setShowOpenModal(false)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('Hapus proyek ini?')) {
      await deleteProject(id)
    }
  }

  return (
    <div className="app-container">
      {/* APP BAR */}
      <div className="fixed z-50 w-full" style={{ maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}>
        <div className="flex items-center px-4 h-14" style={{ background: '#1A3A6B' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Zap size={18} color="#F57C00" fill="#F57C00" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-base leading-tight tracking-wider">HASIL UJI HAR</h1>
            <p className="text-white/60 text-xs">Protection Relay Testing</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95"
              style={{ background: '#F57C00' }}
              title="Proyek Baru"
            >
              <Plus size={18} color="white" />
            </button>
            <button
              onClick={() => setShowOpenModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              title="Buka Proyek"
            >
              <FolderOpen size={16} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div className="pt-14 pb-20 overflow-y-auto">

        {/* PROFILE CARD */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(135deg, #1A3A6B 0%, #2952A3 60%, #1565C0 100%)' }}>
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.35)' }}>
                {getInitials(name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs mb-0.5">{getGreeting()}</p>
                <p className="text-white font-bold text-base leading-tight truncate">{name}</p>
                <p className="text-white/60 text-xs mt-0.5">{formatDateID()}</p>
              </div>
              {/* Role badge */}
              <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: '#F57C00', color: 'white' }}>
                SPV HAR
              </span>
            </div>
            {/* Badges */}
            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                GI: {gi}
              </span>
              {currentProject && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                  ID: #{currentProject.id}
                </span>
              )}
              {dataForm.upt && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                  UPT {dataForm.upt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PROJECT BANNER */}
        <div className="mx-4 mt-3">
          {currentProject ? (
            <div
              className="rounded-xl p-4 cursor-pointer active:scale-98 transition-transform"
              style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}
              onClick={() => navigate('/highlight')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: '#F57C00', color: 'white' }}>AKTIF</span>
                    <span className="text-xs text-gray-500">
                      {formatDateID(currentProject.date)}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    GI {currentProject.giName}
                    {currentProject.bayName ? ` - ${currentProject.bayName}` : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{dataForm.namaPekerjaan}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">Progress</p>
                  <p className="font-bold text-lg" style={{ color: '#F57C00' }}>
                    {progress.passed}<span className="text-sm text-gray-400">/{progress.total}</span>
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full bg-orange-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.pct * 100}%`, background: '#F57C00' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {Math.round(progress.pct * 100)}% selesai • Tap untuk detail
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 cursor-pointer border-2 border-dashed active:scale-98 transition-transform"
              style={{ borderColor: '#CBD5E1', background: 'white' }}
              onClick={() => setShowNewModal(true)}
            >
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: '#F0F2F5' }}>
                  <Plus size={24} color="#94A3B8" />
                </div>
                <p className="font-semibold text-gray-500 text-sm">Belum ada pengujian aktif</p>
                <p className="text-xs text-gray-400 mt-1">Tap untuk membuat proyek baru</p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION HEADER */}
        <div className="mx-4 mt-5 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-gray-700 tracking-widest uppercase">Menu Utama</h2>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="w-6 h-1 rounded-full" style={{ background: '#F57C00' }} />
          </div>
        </div>

        {/* MENU GRID */}
        <div className="mx-4 grid grid-cols-2 gap-3 pb-2">
          {MENUS.map(menu => (
            <button
              key={menu.path}
              onClick={() => navigate(menu.path)}
              className="text-left bg-white rounded-xl shadow-sm active:scale-95 transition-transform overflow-hidden w-full"
              style={{ borderLeft: `4px solid ${menu.color}` }}
            >
              <div className="p-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: menu.color + '18' }}
                >
                  <menu.icon size={20} color={menu.color} strokeWidth={2} />
                </div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{menu.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-tight">{menu.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="fixed bottom-0 left-50 z-40 h-12 flex items-center justify-center"
        style={{
          background: '#1A3A6B',
          maxWidth: 480,
          width: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex items-center gap-1">
          <Zap size={12} color="#F57C00" fill="#F57C00" />
          <span className="text-white/80 text-xs font-medium">HASIL UJI HAR</span>
          <span className="text-white/40 text-xs mx-1">|</span>
          <span className="text-white/50 text-xs">PLN UITJBTB © 2025</span>
        </div>
      </div>

      {/* NEW PROJECT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewModal(false)} />
          <div className="relative bg-white rounded-t-2xl w-full p-5 pb-8 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Proyek Baru</h3>
              <button onClick={() => setShowNewModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={16} color="#666" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Nama Gardu Induk *
                </label>
                <input
                  type="text"
                  value={newGI}
                  onChange={e => setNewGI(e.target.value)}
                  placeholder="contoh: Waru, Krian, Ngagel..."
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Nama Bay / Pekerjaan
                </label>
                <input
                  type="text"
                  value={newBay}
                  onChange={e => setNewBay(e.target.value)}
                  placeholder="contoh: 150kV Bay PLTGU..."
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!newGI.trim() || creating}
              className="w-full h-11 mt-5 rounded-lg font-semibold text-white transition-opacity"
              style={{
                background: newGI.trim() ? '#1A3A6B' : '#94A3B8',
              }}
            >
              {creating ? 'Membuat...' : 'Buat Proyek'}
            </button>
          </div>
        </div>
      )}

      {/* OPEN PROJECT MODAL */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOpenModal(false)} />
          <div className="relative bg-white rounded-t-2xl w-full shadow-xl flex flex-col" style={{ maxHeight: '75vh' }}>
            <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
              <h3 className="font-bold text-gray-800 text-lg">Pilih Proyek</h3>
              <button onClick={() => setShowOpenModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={16} color="#666" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-6">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Belum ada proyek tersimpan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleLoad(p.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer active:scale-98 transition-transform"
                      style={{
                        borderColor: currentProject?.id === p.id ? '#1A3A6B' : '#E2E8F0',
                        background: currentProject?.id === p.id ? '#EFF6FF' : 'white',
                      }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#1A3A6B18' }}>
                        <Zap size={18} color="#1A3A6B" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          GI {p.giName}
                          {p.bayName ? ` - ${p.bayName}` : ''}
                        </p>
                        <p className="text-xs text-gray-400">{formatDateID(p.date)}</p>
                      </div>
                      {currentProject?.id === p.id && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: '#1A3A6B', color: 'white' }}>
                          AKTIF
                        </span>
                      )}
                      <button
                        onClick={e => handleDelete(e, p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95"
                        style={{ background: '#FEE2E2' }}
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
