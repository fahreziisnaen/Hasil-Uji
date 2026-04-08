import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, User, Calendar, Zap } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useStore } from '../store/useStore'

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatDateLong(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

const TEST_ITEMS = {
  karakteristik: [
    { name: 'metering',       label: 'Uji Metering',           path: '/metering' },
    { name: 'karakteristik',  label: 'Karakteristik Distance',  path: '/karakteristik' },
    { name: 'ocr',            label: 'OCR / GFR',              path: '/ocr' },
  ],
  fungsi: [
    { name: 'ar-synchro',    label: 'AR & Synchrocheck',       path: '/ar-synchro' },
    { name: 'fault-locator', label: 'Fault Locator',           path: '/fault-locator' },
    { name: 'teleproteksi',  label: 'Teleproteksi',            path: '/teleproteksi' },
    { name: 'lcd',           label: 'LCD Differential',        path: '/lcd' },
  ]
}

export default function HighlightScreen() {
  const navigate = useNavigate()
  const { dataForm, currentProject, testResults, getProgress } = useStore()
  const progress = getProgress()

  const allTests = [...TEST_ITEMS.karakteristik, ...TEST_ITEMS.fungsi]

  return (
    <div className="app-container">
      <AppBar
        title="Highlight"
        subtitle="Ringkasan Hasil Uji"
        onBack={() => navigate('/')}
      />

      <div className="pt-14 pb-6 overflow-y-auto">

        {/* PROGRESS CARD */}
        <div className="mx-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4" style={{ background: 'linear-gradient(135deg, #1A3A6B, #2952A3)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs">Progress Pengujian</p>
                  <p className="text-white font-bold text-2xl">{progress.passed} <span className="text-white/50 text-lg">/ {progress.total}</span></p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {Math.round(progress.pct * 100)}% selesai
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)' }}>
                  <span className="text-white font-bold text-xl">{Math.round(progress.pct * 100)}</span>
                  <span className="text-white/60 text-xs">%</span>
                </div>
              </div>
              {/* Segment bar */}
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white/20">
                {allTests.map((t, i) => {
                  const status = testResults[t.name]?.status
                  return (
                    <div
                      key={t.name}
                      className="flex-1 rounded-full"
                      style={{
                        background: status === 'lulus' ? '#4ADE80'
                          : status === 'check' ? '#FB923C'
                          : 'rgba(255,255,255,0.2)'
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT INFO */}
        {currentProject && (
          <div className="mx-4 mt-3 bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Informasi Proyek</p>
            <div className="space-y-2">
              <InfoRow icon={<Zap size={14} color="#1A3A6B" />} label="Gardu Induk" value={`GI ${currentProject.giName || dataForm.garduInduk || '-'}`} />
              <InfoRow icon={<Calendar size={14} color="#1A3A6B" />} label="Tanggal" value={formatDateLong(dataForm.tanggal || currentProject.date)} />
              <InfoRow icon={<User size={14} color="#1A3A6B" />} label="Penanggung Jawab" value={dataForm.penangungJawab || '-'} />
              {currentProject.bayName && (
                <InfoRow icon={<Clock size={14} color="#1A3A6B" />} label="Bay" value={currentProject.bayName} />
              )}
            </div>
          </div>
        )}

        {/* UJI KARAKTERISTIK */}
        <div className="mx-4 mt-4">
          <SectionHeader title="UJI KARAKTERISTIK" color="#1A3A6B" />
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {TEST_ITEMS.karakteristik.map((item, i) => (
              <TestRow
                key={item.name}
                no={i + 1}
                label={item.label}
                status={testResults[item.name]?.status}
                isLast={i === TEST_ITEMS.karakteristik.length - 1}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </div>

        {/* UJI FUNGSI */}
        <div className="mx-4 mt-4">
          <SectionHeader title="UJI FUNGSI" color="#16A34A" />
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {TEST_ITEMS.fungsi.map((item, i) => (
              <TestRow
                key={item.name}
                no={TEST_ITEMS.karakteristik.length + i + 1}
                label={item.label}
                status={testResults[item.name]?.status}
                isLast={i === TEST_ITEMS.fungsi.length - 1}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </div>

        {/* SIGNATORIES */}
        <div className="mx-4 mt-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Pengesahan</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: 'Penanggung Jawab', name: dataForm.penangungJawab },
                { role: 'Pengawas', name: dataForm.pengawas },
                { role: 'Pelaksana', name: dataForm.pelaksana1 },
              ].map(s => (
                <div key={s.role} className="text-center">
                  <div className="h-14 border-b border-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 truncate">{s.name || '___________'}</p>
                  <p className="text-xs text-gray-400">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-full" style={{ background: color }} />
      <p className="text-xs font-bold tracking-widest" style={{ color }}>{title}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 flex-shrink-0">{icon}</div>
      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{value}</span>
    </div>
  )
}

function TestRow({ no, label, status, isLast, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors text-left"
      style={{ borderBottom: isLast ? 'none' : '1px solid #F1F5F9' }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#F0F2F5' }}>
        <span className="text-xs font-bold text-gray-500">{no}</span>
      </div>
      <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
      <ResultBadge status={status || 'belum'} />
    </button>
  )
}
