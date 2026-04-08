import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'

function defaultARData() {
  return {
    // Single Phase AR rows
    spar: [
      { faultType: 'Fase R-G', expectedDead: '', measuredDead: '', expectedReclose: '', measuredReclose: '' },
      { faultType: 'Fase S-G', expectedDead: '', measuredDead: '', expectedReclose: '', measuredReclose: '' },
      { faultType: 'Fase T-G', expectedDead: '', measuredDead: '', expectedReclose: '', measuredReclose: '' },
    ],
    // Three Phase AR rows
    tpar: [
      { faultType: 'Fase R-S-T', expectedDead: '', measuredDead: '', expectedReclose: '', measuredReclose: '' },
    ],
  }
}

function defaultSynchroData() {
  return {
    rows: [
      { kondisi: 'Vin Normal / Vout Normal (sinkron)', expectedResult: 'CLOSE', actualResult: '', measuredDeltaV: '', measuredDeltaF: '', measuredDeltaA: '' },
      { kondisi: 'Vin Normal / Vout Normal (tidak sinkron)', expectedResult: 'BLOCK', actualResult: '', measuredDeltaV: '', measuredDeltaF: '', measuredDeltaA: '' },
      { kondisi: 'Vin Normal / Vout Mati', expectedResult: 'BLOCK', actualResult: '', measuredDeltaV: '', measuredDeltaF: '', measuredDeltaA: '' },
      { kondisi: 'Vin Mati / Vout Normal', expectedResult: 'BLOCK', actualResult: '', measuredDeltaV: '', measuredDeltaF: '', measuredDeltaA: '' },
    ]
  }
}

export default function ARSynchroScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const [activeTab, setActiveTab] = useState(0)
  const [arData, setARData] = useState(defaultARData())
  const [synData, setSynData] = useState(defaultSynchroData())

  useEffect(() => {
    const saved = testResults['ar-synchro']?.data
    if (saved) {
      if (saved.arData) setARData(saved.arData)
      if (saved.synData) setSynData(saved.synData)
    }
  }, [testResults])

  function setARRow(group, idx, field, value) {
    setARData(prev => {
      const rows = [...prev[group]]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, [group]: rows }
    })
  }

  function setSynRow(idx, field, value) {
    setSynData(prev => {
      const rows = [...prev.rows]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, rows }
    })
  }

  function calcARPass(row) {
    if (!row.measuredDead && !row.measuredReclose) return null
    let pass = true
    if (row.measuredDead !== '' && row.expectedDead !== '') {
      const diff = Math.abs(parseFloat(row.measuredDead) - parseFloat(row.expectedDead))
      if (diff > 100) pass = false // 100ms tolerance for AR dead time
    }
    if (row.measuredReclose !== '' && row.expectedReclose !== '') {
      const diff = Math.abs(parseFloat(row.measuredReclose) - parseFloat(row.expectedReclose))
      if (diff > 100) pass = false
    }
    return pass
  }

  function calcSynPass(row) {
    if (!row.actualResult) return null
    return row.actualResult === row.expectedResult
  }

  function overallStatus() {
    const arChecks = []
    ;[...arData.spar, ...arData.tpar].forEach(row => {
      const p = calcARPass(row)
      if (p !== null) arChecks.push(p)
    })
    const synChecks = []
    synData.rows.forEach(row => {
      const p = calcSynPass(row)
      if (p !== null) synChecks.push(p)
    })
    const all = [...arChecks, ...synChecks]
    if (all.length === 0) return 'belum'
    return all.every(Boolean) ? 'lulus' : 'check'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('ar-synchro', { arData, synData }, status)
    showToast('Tersimpan ✓')
  }

  return (
    <div className="app-container">
      <AppBar title="AR & Synchro" subtitle="Auto Reclosing & Synchrocheck" onBack={() => navigate('/')} />

      {/* TAB BAR */}
      <div className="fixed z-40 flex"
        style={{
          top: 56, maxWidth: 480, width: '100%',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1A3A6B',
        }}>
        {['Auto Reclosing', 'Synchrocheck'].map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className="flex-1 py-2.5 text-xs font-semibold transition-colors"
            style={{
              color: activeTab === i ? 'white' : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === i ? '3px solid #F57C00' : '3px solid transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-[104px] pb-28 overflow-y-auto px-4">

        {/* STATUS */}
        <div className="mt-2 bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <div className="mt-1"><ResultBadge status={overallStatus()} /></div>
          </div>
          {activeTab === 0 ? (
            <div className="text-right text-xs">
              <p className="text-gray-500">Mode AR: <strong>{dataForm.arMode}</strong></p>
              <p className="text-gray-500">DT SPAR: <strong>{dataForm.dtSpar}s</strong> | TPAR: <strong>{dataForm.dtTpar}s</strong></p>
            </div>
          ) : (
            <div className="text-right text-xs">
              <p className="text-gray-500">ΔF: <strong>{dataForm.deltaF}Hz</strong> | ΔV: <strong>{dataForm.deltaV}%</strong></p>
              <p className="text-gray-500">ΔSudut: <strong>{dataForm.deltaSudut}°</strong></p>
            </div>
          )}
        </div>

        {/* AR TAB */}
        {activeTab === 0 && (
          <div className="mt-3 space-y-4">
            {/* SPAR */}
            <div>
              <SectionLabel title="SPAR (Single Phase AR)" color="#0D9488" />
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <TableHeader cols={['Tipe Fault', 'Dead Time\nExp (ms)', 'Dead Time\nUkur (ms)', 'Reclose\nExp (ms)', 'Reclose\nUkur (ms)', 'Pass']} />
                {arData.spar.map((row, i) => (
                  <ARRow key={i} row={row} isLast={i === arData.spar.length - 1}
                    onChange={(f, v) => setARRow('spar', i, f, v)}
                    passResult={calcARPass(row)}
                  />
                ))}
              </div>
            </div>
            {/* TPAR */}
            <div>
              <SectionLabel title="TPAR (Three Phase AR)" color="#7C3AED" />
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <TableHeader cols={['Tipe Fault', 'Dead Time\nExp (ms)', 'Dead Time\nUkur (ms)', 'Reclose\nExp (ms)', 'Reclose\nUkur (ms)', 'Pass']} />
                {arData.tpar.map((row, i) => (
                  <ARRow key={i} row={row} isLast={i === arData.tpar.length - 1}
                    onChange={(f, v) => setARRow('tpar', i, f, v)}
                    passResult={calcARPass(row)}
                  />
                ))}
              </div>
            </div>
            <InfoBox text="Toleransi waktu: ±100ms dari expected. Expected diisi manual sesuai setting relay." />
          </div>
        )}

        {/* SYNCHRO TAB */}
        {activeTab === 1 && (
          <div className="mt-3">
            <SectionLabel title="Uji Synchrocheck" color="#0891B2" />
            <div className="space-y-3">
              {synData.rows.map((row, i) => (
                <SynchroRow key={i} row={row} idx={i + 1}
                  onChange={(f, v) => setSynRow(i, f, v)}
                  passResult={calcSynPass(row)}
                />
              ))}
            </div>
            <InfoBox
              text={`Setting: ΔF ≤ ${dataForm.deltaF}Hz | ΔV ≤ ${dataForm.deltaV}% | ΔSudut ≤ ${dataForm.deltaSudut}°\nMode: ${dataForm.modeSynchro1} / ${dataForm.modeSynchro2}`}
            />
          </div>
        )}
      </div>

      <SaveBar onSave={handleSave} />
      <Toast toast={toast} />
    </div>
  )
}

function TableHeader({ cols }) {
  return (
    <div className="grid px-2 py-2 border-b border-gray-100"
      style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.6fr', background: '#F8FAFC' }}>
      {cols.map((c, i) => (
        <p key={i} className="text-xs font-semibold text-gray-500 text-center leading-tight">{c}</p>
      ))}
    </div>
  )
}

function ARRow({ row, isLast, onChange, passResult }) {
  return (
    <div className={`grid items-center px-2 py-2 gap-1 ${isLast ? '' : 'border-b border-gray-50'}`}
      style={{
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.6fr',
        background: passResult === false ? '#FFF5F5' : passResult === true ? '#F0FFF4' : 'white',
      }}>
      <span className="text-xs text-gray-700 leading-tight">{row.faultType}</span>
      <input type="number" value={row.expectedDead} onChange={e => onChange('expectedDead', e.target.value)}
        placeholder="-" step="1"
        className="h-8 rounded border border-gray-200 px-1 text-xs text-center w-full" />
      <input type="number" value={row.measuredDead} onChange={e => onChange('measuredDead', e.target.value)}
        placeholder="-" step="1"
        className="h-8 rounded border border-gray-200 px-1 text-xs text-center w-full" />
      <input type="number" value={row.expectedReclose} onChange={e => onChange('expectedReclose', e.target.value)}
        placeholder="-" step="1"
        className="h-8 rounded border border-gray-200 px-1 text-xs text-center w-full" />
      <input type="number" value={row.measuredReclose} onChange={e => onChange('measuredReclose', e.target.value)}
        placeholder="-" step="1"
        className="h-8 rounded border border-gray-200 px-1 text-xs text-center w-full" />
      <div className="flex justify-center">
        {passResult === null ? <span className="text-gray-300 text-xs">-</span>
          : passResult
            ? <span className="text-xs px-1 py-0.5 rounded-full font-bold" style={{ background: '#DCFCE7', color: '#166534' }}>✓</span>
            : <span className="text-xs px-1 py-0.5 rounded-full font-bold" style={{ background: '#FEE2E2', color: '#991B1B' }}>✗</span>
        }
      </div>
    </div>
  )
}

function SynchroRow({ row, idx, onChange, passResult }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3"
      style={{
        borderLeft: `4px solid ${passResult === true ? '#16A34A' : passResult === false ? '#DC2626' : '#CBD5E1'}`
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#F0F2F5', color: '#64748B' }}>{idx}</span>
          <p className="text-xs font-semibold text-gray-700 leading-tight">{row.kondisi}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
          style={{
            background: row.expectedResult === 'CLOSE' ? '#DCFCE7' : '#FEE2E2',
            color: row.expectedResult === 'CLOSE' ? '#166534' : '#991B1B',
          }}>
          {row.expectedResult}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        <div>
          <label className="text-xs text-gray-400 block mb-1">ΔV (%)</label>
          <input type="number" value={row.measuredDeltaV} onChange={e => onChange('measuredDeltaV', e.target.value)}
            placeholder="-" step="0.1"
            className="h-8 w-full rounded border border-gray-200 px-2 text-xs text-center" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">ΔF (Hz)</label>
          <input type="number" value={row.measuredDeltaF} onChange={e => onChange('measuredDeltaF', e.target.value)}
            placeholder="-" step="0.01"
            className="h-8 w-full rounded border border-gray-200 px-2 text-xs text-center" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">ΔSudut (°)</label>
          <input type="number" value={row.measuredDeltaA} onChange={e => onChange('measuredDeltaA', e.target.value)}
            placeholder="-" step="0.5"
            className="h-8 w-full rounded border border-gray-200 px-2 text-xs text-center" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Hasil CB</label>
          <select value={row.actualResult} onChange={e => onChange('actualResult', e.target.value)}
            className="h-8 w-full rounded border border-gray-200 px-1 text-xs appearance-none"
            style={{ WebkitAppearance: 'none' }}>
            <option value="">-</option>
            <option value="CLOSE">CLOSE</option>
            <option value="BLOCK">BLOCK</option>
          </select>
        </div>
      </div>
      {passResult !== null && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs font-semibold"
            style={{ color: passResult ? '#16A34A' : '#DC2626' }}>
            {passResult ? '✓ SESUAI' : '✗ TIDAK SESUAI'}
          </span>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ title, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-full" style={{ background: color }} />
      <p className="text-xs font-bold tracking-widest" style={{ color }}>{title}</p>
    </div>
  )
}

function InfoBox({ text }) {
  return (
    <div className="mt-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
      <p className="text-xs text-blue-600 whitespace-pre-line">{text}</p>
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
