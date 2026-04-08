import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { expectedKm, meteringErrorPct, isFaultLocatorPass, fmtErr, fmt } from '../utils/calculations'

const DEFAULT_FAULT_PCTS = [10, 20, 30, 50, 70, 80, 90]

function defaultData() {
  return {
    rows: DEFAULT_FAULT_PCTS.map(pct => ({
      faultPct: pct,
      relayDisplay: '',
    }))
  }
}

export default function FaultLocatorScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const [data, setData] = useState(defaultData())

  const lineLength = dataForm.panjangPenghantar || 0

  useEffect(() => {
    const saved = testResults['fault-locator']?.data
    if (saved) setData(saved)
  }, [testResults])

  function setRowField(idx, field, value) {
    setData(prev => {
      const rows = [...prev.rows]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, rows }
    })
  }

  function overallStatus() {
    const checks = []
    data.rows.forEach(row => {
      if (row.relayDisplay !== '') {
        const measured = parseFloat(row.relayDisplay)
        if (!isNaN(measured)) {
          const expected = expectedKm(row.faultPct, lineLength)
          if (expected > 0) {
            checks.push(isFaultLocatorPass(measured, expected))
          }
        }
      }
    })
    if (checks.length === 0) return 'belum'
    return checks.every(Boolean) ? 'lulus' : 'check'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('fault-locator', data, status)
    showToast('Tersimpan ✓')
  }

  return (
    <div className="app-container">
      <AppBar title="Fault Locator" subtitle="Uji Lokasi Gangguan" onBack={() => navigate('/')} />

      <div className="pt-14 pb-28 overflow-y-auto px-4">

        {/* STATUS + INFO */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1"><ResultBadge status={overallStatus()} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Panjang Penghantar</p>
              <p className="text-xl font-bold" style={{ color: '#1A3A6B' }}>
                {lineLength} <span className="text-sm font-normal text-gray-500">km</span>
              </p>
            </div>
          </div>
          {lineLength === 0 && (
            <div className="mt-3 p-2 rounded-lg" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
              <p className="text-xs text-orange-700">
                Isi panjang penghantar di Data Form → Tab Relay Distance
              </p>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid px-3 py-2 border-b border-gray-100"
            style={{ gridTemplateColumns: '0.8fr 1.2fr 1.3fr 1fr 0.7fr', background: '#F8FAFC' }}>
            <p className="text-xs font-semibold text-gray-500">%</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Exp (km)</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Relay (km)</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Error</p>
            <p className="text-xs font-semibold text-gray-500 text-center">Pass</p>
          </div>

          {data.rows.map((row, idx) => {
            const expKm = expectedKm(row.faultPct, lineLength)
            const measured = parseFloat(row.relayDisplay)
            const err = (row.relayDisplay !== '' && !isNaN(measured) && expKm > 0)
              ? meteringErrorPct(measured, expKm) : null
            const pass = err !== null ? isFaultLocatorPass(measured, expKm) : null

            return (
              <div key={idx}
                className="grid items-center px-3 py-2 gap-1"
                style={{
                  gridTemplateColumns: '0.8fr 1.2fr 1.3fr 1fr 0.7fr',
                  borderBottom: idx < data.rows.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: pass === false ? '#FFF5F5' : pass === true ? '#F0FFF4' : 'white',
                }}
              >
                <span className="text-xs font-bold" style={{ color: '#1A3A6B' }}>{row.faultPct}%</span>
                <span className="text-xs text-gray-600 text-center">
                  {lineLength > 0 ? fmt(expKm, 3) : '-'}
                </span>
                <input
                  type="number"
                  value={row.relayDisplay}
                  onChange={e => setRowField(idx, 'relayDisplay', e.target.value)}
                  placeholder={lineLength > 0 ? fmt(expKm, 3) : '-'}
                  step="0.001"
                  className="h-8 w-full rounded border border-gray-200 px-1.5 text-xs text-center"
                />
                <span className="text-xs font-medium text-center"
                  style={{ color: err === null ? '#94A3B8' : pass ? '#16A34A' : '#DC2626' }}>
                  {err === null ? '-' : fmtErr(err)}
                </span>
                <div className="flex justify-center">
                  {pass === null ? <span className="text-gray-300 text-xs">-</span>
                    : pass
                      ? <span className="text-xs px-1 py-0.5 rounded-full font-bold" style={{ background: '#DCFCE7', color: '#166534' }}>✓</span>
                      : <span className="text-xs px-1 py-0.5 rounded-full font-bold" style={{ background: '#FEE2E2', color: '#991B1B' }}>✗</span>
                  }
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <p className="text-xs text-blue-700 font-semibold">Kriteria</p>
          <p className="text-xs text-blue-600 mt-1">
            Expected (km) = (% fault / 100) × panjang penghantar<br />
            Toleransi: ±5% dari jarak expected
          </p>
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
