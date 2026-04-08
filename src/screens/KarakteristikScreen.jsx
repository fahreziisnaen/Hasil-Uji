import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { impedanceErrorPct, isDistancePass, isTimePass, fmtErr, fmt } from '../utils/calculations'

function makeZoneRows() {
  return { measuredOhm: '', measuredAngle: '', measuredMs: '' }
}

function defaultData() {
  return {
    z1PhG: makeZoneRows(),
    z1PhPh: makeZoneRows(),
    z2PhG: makeZoneRows(),
    z2PhPh: makeZoneRows(),
    z3PhG: makeZoneRows(),
    z3PhPh: makeZoneRows(),
    z4PhG: makeZoneRows(),
    z4PhPh: makeZoneRows(),
  }
}

const ZONES = [
  { key: 'z1', label: 'Zone 1', ohmKey: 'z1PhGOhm', angleKey: 'z1PhGAngle', msKey: 'z1PhGMs', color: '#16A34A' },
  { key: 'z2', label: 'Zone 2', ohmKey: 'z2PhGOhm', angleKey: 'z2PhGAngle', msKey: 'z2PhGMs', color: '#D97706' },
  { key: 'z3', label: 'Zone 3', ohmKey: 'z3PhGOhm', angleKey: 'z3PhGAngle', msKey: 'z3PhGMs', color: '#DC2626' },
  { key: 'z4', label: 'Zone 4',  ohmKey: 'z4PhGOhm', angleKey: 'z4PhGAngle', msKey: 'z4PhGMs', color: '#7C3AED' },
]

export default function KarakteristikScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const [data, setData] = useState(defaultData())

  useEffect(() => {
    const saved = testResults['karakteristik']?.data
    if (saved) setData(saved)
  }, [testResults])

  function setSubField(zoneKey, field, value) {
    setData(prev => ({
      ...prev,
      [zoneKey]: { ...prev[zoneKey], [field]: value }
    }))
  }

  function overallStatus() {
    const checks = []
    ZONES.forEach(z => {
      const settingOhm = dataForm[z.ohmKey]
      const settingMs = dataForm[z.msKey]
      for (const variant of ['PhG', 'PhPh']) {
        const row = data[`${z.key}${variant}`]
        const setting = variant === 'PhG' ? settingOhm : settingOhm * Math.sqrt(3)
        if (row.measuredOhm !== '') {
          const m = parseFloat(row.measuredOhm)
          if (!isNaN(m)) checks.push(isDistancePass(m, setting))
        }
        if (row.measuredMs !== '') {
          const mt = parseFloat(row.measuredMs)
          if (!isNaN(mt)) checks.push(isTimePass(mt, settingMs))
        }
      }
    })
    if (checks.length === 0) return 'belum'
    return checks.every(Boolean) ? 'lulus' : 'check'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('karakteristik', data, status)
    showToast('Tersimpan ✓')
  }

  return (
    <div className="app-container">
      <AppBar title="Karakteristik" subtitle="Uji Zona Impedansi Distance" onBack={() => navigate('/')} />

      <div className="pt-14 pb-28 overflow-y-auto px-4">

        {/* STATUS */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <div className="mt-1"><ResultBadge status={overallStatus()} /></div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Error Imp ≤ ±5%</p>
            <p>Error Waktu ≤ ±30ms</p>
          </div>
        </div>

        {/* ZONE TABLES */}
        {ZONES.map(z => {
          const settingOhm = dataForm[z.ohmKey] || 0
          const settingAngle = dataForm[z.angleKey] || 75
          const settingMs = dataForm[z.msKey] || 0
          const settingPhPh = settingOhm * Math.sqrt(3)

          return (
            <div key={z.key} className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full" style={{ background: z.color }} />
                <p className="text-xs font-bold tracking-widest" style={{ color: z.color }}>{z.label.toUpperCase()}</p>
                <span className="text-xs text-gray-400">
                  Ph-G: {fmt(settingOhm, 3)}Ω / {settingMs}ms
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-0 px-3 py-2 border-b border-gray-100"
                  style={{ background: '#F8FAFC' }}>
                  <p className="text-xs font-semibold text-gray-500 col-span-1">Tipe</p>
                  <p className="text-xs font-semibold text-gray-500 text-center">Z (Ω)</p>
                  <p className="text-xs font-semibold text-gray-500 text-center">Err Z</p>
                  <p className="text-xs font-semibold text-gray-500 text-center">t (ms)</p>
                  <p className="text-xs font-semibold text-gray-500 text-center">Status</p>
                </div>

                {/* Ph-G Row */}
                <ZoneRow
                  label="Ph-G"
                  settingOhm={settingOhm}
                  settingMs={settingMs}
                  row={data[`${z.key}PhG`]}
                  onChange={(f, v) => setSubField(`${z.key}PhG`, f, v)}
                  color={z.color}
                />

                {/* Ph-Ph Row */}
                <ZoneRow
                  label="Ph-Ph"
                  settingOhm={settingPhPh}
                  settingMs={settingMs}
                  row={data[`${z.key}PhPh`]}
                  onChange={(f, v) => setSubField(`${z.key}PhPh`, f, v)}
                  color={z.color}
                  isLast
                />
              </div>
            </div>
          )
        })}

        <div className="mt-4 p-3 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <p className="text-xs text-yellow-700 font-semibold">Catatan</p>
          <p className="text-xs text-yellow-600 mt-1">
            Ph-Ph = √3 × Ph-G. Waktu operasi: ±30ms dari setting. Impedansi: ±5% dari setting.
          </p>
        </div>
      </div>

      <SaveBar onSave={handleSave} />
      <Toast toast={toast} />
    </div>
  )
}

function ZoneRow({ label, settingOhm, settingMs, row, onChange, color, isLast }) {
  const mOhm = parseFloat(row.measuredOhm)
  const mMs = parseFloat(row.measuredMs)
  const errOhm = row.measuredOhm !== '' && !isNaN(mOhm) ? impedanceErrorPct(mOhm, settingOhm) : null
  const errMs = row.measuredMs !== '' && !isNaN(mMs) ? (mMs - settingMs) : null
  const zPass = errOhm !== null ? isDistancePass(mOhm, settingOhm) : null
  const tPass = errMs !== null ? isTimePass(mMs, settingMs) : null
  const allPass = (zPass === null && tPass === null) ? null
    : (zPass !== false && tPass !== false)

  return (
    <div className={`px-3 py-2.5 ${isLast ? '' : 'border-b border-gray-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold" style={{ color }}>{label}</span>
        <span className="text-xs text-gray-400">Setting: {fmt(settingOhm, 3)}Ω / {settingMs}ms</span>
      </div>
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Measured Z input */}
        <div className="col-span-1">
          <input
            type="number"
            value={row.measuredOhm}
            onChange={e => onChange('measuredOhm', e.target.value)}
            placeholder={fmt(settingOhm, 3)}
            step="0.001"
            className="w-full h-8 rounded border border-gray-200 px-1.5 text-xs text-center"
          />
        </div>
        {/* Error Z */}
        <div className="text-center">
          <span className="text-xs font-medium"
            style={{ color: errOhm === null ? '#94A3B8' : zPass ? '#16A34A' : '#DC2626' }}>
            {errOhm === null ? '-' : fmtErr(errOhm)}
          </span>
        </div>
        {/* Measured time input */}
        <div className="col-span-1">
          <input
            type="number"
            value={row.measuredMs}
            onChange={e => onChange('measuredMs', e.target.value)}
            placeholder={String(settingMs)}
            step="1"
            className="w-full h-8 rounded border border-gray-200 px-1.5 text-xs text-center"
          />
        </div>
        {/* Err time */}
        <div className="text-center">
          <span className="text-xs font-medium"
            style={{ color: errMs === null ? '#94A3B8' : tPass ? '#16A34A' : '#DC2626' }}>
            {errMs === null ? '-' : (errMs >= 0 ? '+' : '') + errMs.toFixed(0) + 'ms'}
          </span>
        </div>
        {/* Status */}
        <div className="flex justify-center">
          {allPass === null ? (
            <span className="text-xs text-gray-300">-</span>
          ) : allPass ? (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: '#DCFCE7', color: '#166534' }}>✓</span>
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: '#FEE2E2', color: '#991B1B' }}>✗</span>
          )}
        </div>
      </div>
    </div>
  )
}

function SaveBar({ onSave }) {
  return (
    <div className="fixed bottom-0 left-0 w-full px-4 py-3 z-40"
      style={{
        background: 'rgba(240,242,245,0.95)',
        backdropFilter: 'blur(8px)',
        maxWidth: 480,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
      <button onClick={onSave}
        className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
        style={{ background: '#1A3A6B' }}>
        <Save size={18} />
        Simpan Hasil
      </button>
    </div>
  )
}
