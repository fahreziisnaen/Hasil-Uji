import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'

const SCHEME_SCENARIOS = {
  PUTT: [
    { kondisi: 'Fault dalam zona PUTT (lokal)', expSend: 'Send', expResult: 'TRIP Z1' },
    { kondisi: 'Fault Z2 + Receive signal', expSend: 'Send', expResult: 'TRIP Aided' },
    { kondisi: 'Fault Z2 tanpa Receive', expSend: 'Send', expResult: 'TRIP Z2 (t2)' },
    { kondisi: 'Fault luar zona', expSend: 'No Send', expResult: 'NO TRIP' },
    { kondisi: 'Loss of Guard (lokal)', expSend: 'No Send', expResult: 'BLOCK' },
    { kondisi: 'CS Test (manual)', expSend: 'Send', expResult: 'CS Trip' },
  ],
  POTT: [
    { kondisi: 'Fault internal Z1 (lokal trip)', expSend: 'Send', expResult: 'TRIP Z1' },
    { kondisi: 'Fault Z2 + Receive permissive', expSend: 'Send', expResult: 'TRIP Aided' },
    { kondisi: 'Fault Z2 tanpa Receive', expSend: 'Send', expResult: 'TRIP Z2 (t2)' },
    { kondisi: 'Fault di luar penghantar', expSend: 'No Send', expResult: 'NO TRIP' },
    { kondisi: 'Echo Test (loop back)', expSend: 'Send', expResult: 'Echo Recv' },
    { kondisi: 'CS Test (manual kirim)', expSend: 'Send', expResult: 'CS Trip' },
  ],
  BLOCKING: [
    { kondisi: 'Fault internal (no blocking)', expSend: 'No Block', expResult: 'TRIP Z2' },
    { kondisi: 'Fault eksternal (blocking active)', expSend: 'Block', expResult: 'NO TRIP' },
    { kondisi: 'Fault Z1 (langsung trip)', expSend: 'No Block', expResult: 'TRIP Z1' },
    { kondisi: 'Blocking signal received', expSend: 'Block', expResult: 'BLOCKED' },
    { kondisi: 'Loss of Block signal', expSend: 'No Block', expResult: 'TRIP' },
    { kondisi: 'CS Test (manual)', expSend: 'No Block', expResult: 'CS Trip' },
  ],
  default: [
    { kondisi: 'Fault Z1 (lokal trip)', expSend: 'Send', expResult: 'TRIP Z1' },
    { kondisi: 'Fault Z2 + aided signal', expSend: 'Send', expResult: 'TRIP Aided' },
    { kondisi: 'Fault Z2 tanpa signal', expSend: 'Send', expResult: 'TRIP Z2 (t2)' },
    { kondisi: 'Fault luar penghantar', expSend: 'No Send', expResult: 'NO TRIP' },
    { kondisi: 'CS (Command Send) Test', expSend: 'Send', expResult: 'CS Received' },
    { kondisi: 'CR (Command Receive) Test', expSend: 'Receive', expResult: 'TRIP Aided' },
  ],
}

function defaultData(scheme) {
  const scenarios = SCHEME_SCENARIOS[scheme] || SCHEME_SCENARIOS.default
  return {
    rows: scenarios.map(s => ({
      kondisi: s.kondisi,
      expSend: s.expSend,
      expResult: s.expResult,
      actualSend: '',
      waktuMs: '',
      actualResult: '',
    }))
  }
}

export default function TeleproteksiScreen() {
  const navigate = useNavigate()
  const { dataForm, testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const scheme = dataForm.distanceScheme || 'POTT'
  const [data, setData] = useState(() => defaultData(scheme))

  useEffect(() => {
    const saved = testResults['teleproteksi']?.data
    if (saved) {
      setData(saved)
    } else {
      setData(defaultData(scheme))
    }
  }, [testResults, scheme])

  function setRowField(idx, field, value) {
    setData(prev => {
      const rows = [...prev.rows]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, rows }
    })
  }

  function calcRowPass(row) {
    if (!row.actualSend && !row.actualResult) return null
    const sendOk = row.actualSend === '' || row.actualSend === row.expSend
    const resultOk = row.actualResult === '' || row.actualResult === row.expResult
    if (!row.actualSend && !row.actualResult) return null
    return sendOk && resultOk
  }

  function overallStatus() {
    const checks = []
    data.rows.forEach(row => {
      const p = calcRowPass(row)
      if (p !== null) checks.push(p)
    })
    if (checks.length === 0) return 'belum'
    return checks.every(Boolean) ? 'lulus' : 'check'
  }

  async function handleSave() {
    const status = overallStatus()
    await saveTestResult('teleproteksi', data, status)
    showToast('Tersimpan ✓')
  }

  return (
    <div className="app-container">
      <AppBar title="Teleproteksi" subtitle="Uji Skema Proteksi Jarak Jauh" onBack={() => navigate('/')} />

      <div className="pt-14 pb-28 overflow-y-auto px-4">

        {/* STATUS + SCHEME INFO */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1"><ResultBadge status={overallStatus()} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Skema Proteksi</p>
              <p className="text-base font-bold" style={{ color: '#1A3A6B' }}>{scheme}</p>
              <p className="text-xs text-gray-400">{dataForm.defMode}</p>
            </div>
          </div>
        </div>

        {/* TEST ROWS */}
        <div className="mt-4 space-y-3">
          {data.rows.map((row, idx) => {
            const pass = calcRowPass(row)
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden"
                style={{ borderLeft: `4px solid ${pass === true ? '#16A34A' : pass === false ? '#DC2626' : '#CBD5E1'}` }}>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#F0F2F5', color: '#64748B' }}>{idx + 1}</span>
                    <p className="text-xs font-semibold text-gray-700">{row.kondisi}</p>
                  </div>
                  {pass !== null && (
                    <span className="text-xs font-bold ml-2"
                      style={{ color: pass ? '#16A34A' : '#DC2626' }}>
                      {pass ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                <div className="px-4 py-3">
                  {/* Expected */}
                  <div className="flex gap-4 mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Expected Send</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: '#F0F2F5', color: '#64748B' }}>{row.expSend}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Expected Result</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: '#F0F2F5', color: '#64748B' }}>{row.expResult}</span>
                    </div>
                  </div>
                  {/* Actual inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Actual Send</label>
                      <select value={row.actualSend} onChange={e => setRowField(idx, 'actualSend', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-2 text-xs appearance-none"
                        style={{ WebkitAppearance: 'none' }}>
                        <option value="">-</option>
                        <option value="Send">Send</option>
                        <option value="No Send">No Send</option>
                        <option value="Block">Block</option>
                        <option value="No Block">No Block</option>
                        <option value="Receive">Receive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Waktu (ms)</label>
                      <input type="number" value={row.waktuMs} onChange={e => setRowField(idx, 'waktuMs', e.target.value)}
                        placeholder="-" step="1"
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs text-center" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Actual Result</label>
                      <input type="text" value={row.actualResult} onChange={e => setRowField(idx, 'actualResult', e.target.value)}
                        placeholder={row.expResult}
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <p className="text-xs text-blue-700 font-semibold">Catatan: Skema {scheme}</p>
          <p className="text-xs text-blue-600 mt-1">
            Waktu Aided DEF: {dataForm.waktuAidedDEF}ms | DEF Mode: {dataForm.defMode}
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
