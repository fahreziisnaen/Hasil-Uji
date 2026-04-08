import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { calcOCRTime, isOCRPass, fmt, fmtErr } from '../utils/calculations'

const MULTIPLIERS = [1.1, 2, 5, 10, 20]

function defaultOCRRows() {
  return MULTIPLIERS.map(m => ({ multiplier: m, measured: '' }))
}

function defaultData() {
  return {
    ocrRows: defaultOCRRows(),
    gfrRows: defaultOCRRows(),
  }
}

export default function OCRScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const [activeTab, setActiveTab] = useState(0)
  const [data, setData] = useState(defaultData())

  useEffect(() => {
    const saved = testResults['ocr']?.data
    if (saved) setData(saved)
  }, [testResults])

  const ocrSettings = {
    pickup: dataForm.iPickup || 0.7,
    tms: dataForm.tmsOCR || 0.24,
    curve: dataForm.karOCR || 'C SI',
  }
  const gfrSettings = {
    pickup: dataForm.iePickup || 0.12,
    tms: dataForm.tmsGFR || 0.48,
    curve: dataForm.karGFR || 'C SI',
  }

  function updateRow(type, idx, value) {
    setData(prev => {
      const key = type === 'ocr' ? 'ocrRows' : 'gfrRows'
      const rows = [...prev[key]]
      rows[idx] = { ...rows[idx], measured: value }
      return { ...prev, [key]: rows }
    })
  }

  function calcStatus(rows, settings) {
    const checks = []
    rows.forEach(row => {
      if (row.measured !== '') {
        const m = parseFloat(row.measured)
        const inj = row.multiplier * settings.pickup
        const expected = calcOCRTime(inj, settings.pickup, settings.tms, settings.curve)
        if (!isNaN(m) && isFinite(expected)) {
          checks.push(isOCRPass(m, expected))
        }
      }
    })
    if (checks.length === 0) return 'belum'
    return checks.every(Boolean) ? 'lulus' : 'check'
  }

  function overallStatus() {
    const s1 = calcStatus(data.ocrRows, ocrSettings)
    const s2 = calcStatus(data.gfrRows, gfrSettings)
    if (s1 === 'belum' && s2 === 'belum') return 'belum'
    if (s1 === 'check' || s2 === 'check') return 'check'
    return 'lulus'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('ocr', data, status)
    showToast('Tersimpan ✓')
  }

  const settings = activeTab === 0 ? ocrSettings : gfrSettings
  const rows = activeTab === 0 ? data.ocrRows : data.gfrRows
  const type = activeTab === 0 ? 'ocr' : 'gfr'
  const tabStatus = calcStatus(rows, settings)

  return (
    <div className="app-container">
      <AppBar title="OCR / GFR" subtitle="Overcurrent & Earth Fault" onBack={() => navigate('/')} />

      {/* TAB BAR */}
      <div className="fixed z-40 flex"
        style={{
          top: 56, maxWidth: 480, width: '100%',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1A3A6B',
        }}>
        {['OCR (Arus Lebih)', 'GFR (Earth Fault)'].map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className="flex-1 py-2.5 text-xs font-semibold transition-colors"
            style={{
              color: activeTab === i ? 'white' : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === i ? '3px solid #F57C00' : '3px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-[104px] pb-28 overflow-y-auto px-4">

        {/* SETTINGS CARD */}
        <div className="mt-2 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Status Tab Ini</p>
              <div className="mt-1"><ResultBadge status={tabStatus} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Setting</p>
              <p className="text-xs font-bold text-gray-700">
                I{'>'}: {settings.pickup}A | TMS: {settings.tms} | {settings.curve}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid px-3 py-2 border-b border-gray-100"
            style={{ gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr', background: '#F8FAFC' }}>
            <p className="text-xs font-semibold text-gray-500">×In</p>
            <p className="text-xs font-semibold text-gray-500 text-center">I Inj (A)</p>
            <p className="text-xs font-semibold text-gray-500 text-center">t Exp (s)</p>
            <p className="text-xs font-semibold text-gray-500 text-center">t Ukur (s)</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Err%</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Pass</p>
          </div>

          {rows.map((row, idx) => {
            const inj = row.multiplier * settings.pickup
            const expected = calcOCRTime(inj, settings.pickup, settings.tms, settings.curve)
            const measured = parseFloat(row.measured)
            const err = (row.measured !== '' && !isNaN(measured) && isFinite(expected))
              ? ((measured - expected) / expected * 100) : null
            const pass = err !== null ? isOCRPass(measured, expected) : null

            return (
              <div key={idx}
                className="grid items-center px-3 py-2"
                style={{
                  gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr',
                  borderBottom: idx < rows.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: pass === false ? '#FFF5F5' : pass === true ? '#F0FFF4' : 'white',
                }}
              >
                <span className="text-xs font-bold" style={{ color: '#1A3A6B' }}>×{row.multiplier}</span>
                <span className="text-xs text-gray-600 text-center">{fmt(inj, 3)}</span>
                <span className="text-xs text-gray-600 text-center">
                  {isFinite(expected) ? fmt(expected, 3) : '∞'}
                </span>
                <input
                  type="number"
                  value={row.measured}
                  onChange={e => updateRow(type, idx, e.target.value)}
                  placeholder="-"
                  step="0.001"
                  className="h-8 w-full rounded border border-gray-200 px-1.5 text-xs text-center"
                />
                <span className="text-xs font-medium text-center"
                  style={{ color: err === null ? '#94A3B8' : pass ? '#16A34A' : '#DC2626' }}>
                  {err === null ? '-' : (err >= 0 ? '+' : '') + err.toFixed(1) + '%'}
                </span>
                <div className="flex justify-center">
                  {pass === null ? <span className="text-gray-300 text-xs">-</span>
                    : pass
                      ? <span className="text-xs px-1 py-0.5 rounded-full font-bold"
                          style={{ background: '#DCFCE7', color: '#166534' }}>✓</span>
                      : <span className="text-xs px-1 py-0.5 rounded-full font-bold"
                          style={{ background: '#FEE2E2', color: '#991B1B' }}>✗</span>
                  }
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <p className="text-xs text-blue-700 font-semibold">Rumus IEC: t = TMS × b / ((I/Is)^a - 1)</p>
          <p className="text-xs text-blue-600 mt-1">Toleransi: ±10% dari waktu kalkulasi</p>
        </div>
      </div>

      <SaveBar onSave={handleSave} />
      <Toast toast={toast} />
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
