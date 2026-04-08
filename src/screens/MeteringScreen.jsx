import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { meteringErrorPct, isMeteringPass, fmtErr, fmt } from '../utils/calculations'

function defaultMeteringData() {
  return {
    // 50% injection
    i50: { ia: '', ib: '', ic: '' },
    v50: { va: '', vb: '', vc: '' },
    // 100% injection
    i100: { ia: '', ib: '', ic: '' },
    v100: { va: '', vb: '', vc: '' },
  }
}

export default function MeteringScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()

  const ctRatio = dataForm.ctP / dataForm.ctS
  const vtRatio = dataForm.vtMainP / dataForm.vtMainS
  const inominalSec = dataForm.ctS === 1 ? 1 : 5
  const vnominalSec = dataForm.vtMainS || 100

  // Nominal secondary values
  const iNom = inominalSec         // 1A or 5A secondary
  const vNom = vnominalSec / Math.sqrt(3) // Phase voltage secondary

  const ref50I = iNom * 0.5
  const ref100I = iNom * 1.0
  const ref50V = vNom * 0.5
  const ref100V = vNom * 1.0

  const [data, setData] = useState(defaultMeteringData)

  useEffect(() => {
    const saved = testResults['metering']?.data
    if (saved) setData(saved)
  }, [testResults])

  function setField(level, type, phase, value) {
    setData(prev => ({
      ...prev,
      [`${level}`]: { ...prev[level], [phase]: value }
    }))
  }

  // Determine overall pass/fail
  function overallStatus() {
    const checks = []
    const levels = [
      { key: 'i50', type: 'current', ref: ref50I },
      { key: 'i100', type: 'current', ref: ref100I },
      { key: 'v50', type: 'voltage', ref: ref50V },
      { key: 'v100', type: 'voltage', ref: ref100V },
    ]
    for (const { key, ref } of levels) {
      const obj = data[key]
      for (const val of Object.values(obj)) {
        if (val !== '' && val !== null) {
          const n = parseFloat(val)
          if (!isNaN(n)) {
            const err = meteringErrorPct(n, ref)
            checks.push(isMeteringPass(err))
          }
        }
      }
    }
    if (checks.length === 0) return 'belum'
    return checks.every(Boolean) ? 'lulus' : 'check'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('metering', data, status)
    showToast('Tersimpan ✓')
  }

  const status = overallStatus()

  return (
    <div className="app-container">
      <AppBar title="Metering" subtitle="Uji Akurasi Metering" onBack={() => navigate('/')} />

      <div className="pt-14 pb-28 overflow-y-auto px-4">

        {/* STATUS + SETTINGS */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Status Pengujian</p>
              <div className="mt-1"><ResultBadge status={status} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">CT Ratio / VT Ratio</p>
              <p className="text-sm font-bold text-gray-700">{ctRatio}A / {(vtRatio).toFixed(0)}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoChip label="I Nominal Sek" value={`${fmt(iNom, 1)} A`} />
            <InfoChip label="V Nominal Sek (Ph)" value={`${fmt(vNom, 2)} V`} />
          </div>
        </div>

        {/* CURRENT MEASUREMENT */}
        <div className="mt-4">
          <SectionTitle title="Pengukuran Arus" color="#DC2626" />
          <MeteringTable
            title="Injeksi 50% (In)"
            refValue={ref50I}
            unit="A"
            phases={['ia', 'ib', 'ic']}
            labels={['Ia (A)', 'Ib (A)', 'Ic (A)']}
            values={data.i50}
            onChange={(phase, val) => setField('i50', 'current', phase, val)}
          />
          <div className="mt-3">
            <MeteringTable
              title="Injeksi 100% (In)"
              refValue={ref100I}
              unit="A"
              phases={['ia', 'ib', 'ic']}
              labels={['Ia (A)', 'Ib (A)', 'Ic (A)']}
              values={data.i100}
              onChange={(phase, val) => setField('i100', 'current', phase, val)}
            />
          </div>
        </div>

        {/* VOLTAGE MEASUREMENT */}
        <div className="mt-4">
          <SectionTitle title="Pengukuran Tegangan" color="#7C3AED" />
          <MeteringTable
            title="Injeksi 50% (Vn)"
            refValue={ref50V}
            unit="V"
            phases={['va', 'vb', 'vc']}
            labels={['Va (V)', 'Vb (V)', 'Vc (V)']}
            values={data.v50}
            onChange={(phase, val) => setField('v50', 'voltage', phase, val)}
          />
          <div className="mt-3">
            <MeteringTable
              title="Injeksi 100% (Vn)"
              refValue={ref100V}
              unit="V"
              phases={['va', 'vb', 'vc']}
              labels={['Va (V)', 'Vb (V)', 'Vc (V)']}
              values={data.v100}
              onChange={(phase, val) => setField('v100', 'voltage', phase, val)}
            />
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <p className="text-xs text-blue-700 font-semibold">Kriteria Kelulusan</p>
          <p className="text-xs text-blue-600 mt-1">Error ≤ ±5% → LULUS | Error &gt; ±5% → CHECK</p>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <SaveBar onSave={handleSave} />
      <Toast toast={toast} />
    </div>
  )
}

function MeteringTable({ title, refValue, unit, phases, labels, values, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-600">{title}</p>
        <p className="text-xs text-gray-400">Ref: {fmt(refValue, 3)} {unit}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {phases.map((ph, i) => {
          const val = values[ph]
          const n = parseFloat(val)
          const err = isNaN(n) || val === '' ? null : meteringErrorPct(n, refValue)
          const pass = err !== null ? isMeteringPass(err) : null
          return (
            <div key={ph} className="px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 w-10 flex-shrink-0">{labels[i]}</span>
              <input
                type="number"
                value={val}
                onChange={e => onChange(ph, e.target.value)}
                placeholder={fmt(refValue, 3)}
                step="0.001"
                className="flex-1 h-9 rounded-lg border border-gray-200 px-2 text-sm text-center"
              />
              <span className="text-xs w-14 text-right flex-shrink-0 font-medium"
                style={{ color: err === null ? '#94A3B8' : pass ? '#16A34A' : '#DC2626' }}>
                {err === null ? '-' : fmtErr(err)}
              </span>
              <div className="w-12 flex-shrink-0 flex justify-end">
                {pass === null ? (
                  <span className="text-xs text-gray-300">-</span>
                ) : pass ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#DCFCE7', color: '#166534' }}>✓</span>
                ) : (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#FEE2E2', color: '#991B1B' }}>✗</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-lg p-2" style={{ background: '#F8FAFC' }}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-700">{value}</p>
    </div>
  )
}

function SectionTitle({ title, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-full" style={{ background: color }} />
      <p className="text-xs font-bold tracking-widest" style={{ color }}>{title}</p>
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
