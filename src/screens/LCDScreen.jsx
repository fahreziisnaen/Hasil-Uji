import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import ResultBadge from '../components/ResultBadge'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { fmt } from '../utils/calculations'

// LCD Differential test scenarios
// Idiff = |Ia + Ib| where Ib is injected in opposing direction (simplified)
// For a real differential: Idiff = Ia_local + Ia_remote (phasor sum)
// Here we use simplified: inject Ia, vary Ib to get Idiff near pickup

function defaultData() {
  return {
    pickupCurrent: 0.2, // Idiff> pickup in secondary amps
    restraintK: 0.3,    // Slope K
    rows: [
      { ia: '0.5', ib: '0', expectedOp: 'TRIP', actualOp: '', note: 'Idiff tinggi, no restraint' },
      { ia: '0.3', ib: '0.1', expectedOp: 'TRIP', actualOp: '', note: 'Idiff > pickup' },
      { ia: '0.15', ib: '0', expectedOp: 'NO TRIP', actualOp: '', note: 'Idiff < pickup' },
      { ia: '1.0', ib: '0.8', expectedOp: 'NO TRIP', actualOp: '', note: 'Idiff kecil, restraint tinggi' },
      { ia: '2.0', ib: '2.0', expectedOp: 'NO TRIP', actualOp: '', note: 'Load current (no diff)' },
      { ia: '0.8', ib: '0.1', expectedOp: 'TRIP', actualOp: '', note: 'Fault: Idiff besar' },
    ]
  }
}

export default function LCDScreen() {
  const navigate = useNavigate()
  const { testResults, saveTestResult } = useStore()
  const { toast, showToast } = useToast()
  const [data, setData] = useState(defaultData())

  useEffect(() => {
    const saved = testResults['lcd']?.data
    if (saved) setData(saved)
  }, [testResults])

  function setRowField(idx, field, value) {
    setData(prev => {
      const rows = [...prev.rows]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, rows }
    })
  }

  function calcIdiff(ia, ib) {
    const a = parseFloat(ia)
    const b = parseFloat(ib)
    if (isNaN(a) || isNaN(b)) return null
    // Simplified: differential current = |Ia - Ib| (opposing currents)
    return Math.abs(a - b)
  }

  function calcIrestrain(ia, ib) {
    const a = parseFloat(ia)
    const b = parseFloat(ib)
    if (isNaN(a) || isNaN(b)) return null
    // Restraint = (|Ia| + |Ib|) / 2
    return (Math.abs(a) + Math.abs(b)) / 2
  }

  function calcRowPass(row) {
    if (!row.actualOp) return null
    return row.actualOp === row.expectedOp
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
    await saveTestResult('lcd', data, status)
    showToast('Tersimpan ✓')
  }

  return (
    <div className="app-container">
      <AppBar title="LCD Differential" subtitle="Uji Relay Diferensial" onBack={() => navigate('/')} />

      <div className="pt-14 pb-28 overflow-y-auto px-4">

        {/* STATUS + SETTINGS */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1"><ResultBadge status={overallStatus()} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Setting</p>
              <p className="text-xs font-bold text-gray-700">Idiff: {data.pickupCurrent}A | K: {data.restraintK}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Idiff{'>'} Pickup (A sek)</label>
              <input type="number" value={data.pickupCurrent}
                onChange={e => setData(prev => ({ ...prev, pickupCurrent: parseFloat(e.target.value) || 0.2 }))}
                step="0.01"
                className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm text-center" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Slope K (restraint)</label>
              <input type="number" value={data.restraintK}
                onChange={e => setData(prev => ({ ...prev, restraintK: parseFloat(e.target.value) || 0.3 }))}
                step="0.01" min="0" max="1"
                className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm text-center" />
            </div>
          </div>
        </div>

        {/* TEST TABLE */}
        <div className="mt-4 space-y-3">
          {data.rows.map((row, idx) => {
            const idiff = calcIdiff(row.ia, row.ib)
            const irestrain = calcIrestrain(row.ia, row.ib)
            const pass = calcRowPass(row)

            // Calculate if theoretically should trip based on diff characteristic
            const shouldTrip = idiff !== null && irestrain !== null
              ? idiff >= data.pickupCurrent || (idiff >= data.restraintK * irestrain)
              : null

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden"
                style={{ borderLeft: `4px solid ${pass === true ? '#16A34A' : pass === false ? '#DC2626' : '#CBD5E1'}` }}>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#F0F2F5', color: '#64748B' }}>{idx + 1}</span>
                    <p className="text-xs text-gray-600">{row.note}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: row.expectedOp === 'TRIP' ? '#FEE2E2' : '#F0F9FF',
                      color: row.expectedOp === 'TRIP' ? '#991B1B' : '#1D4ED8',
                    }}>
                    Exp: {row.expectedOp}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Ia (A)</label>
                      <input type="number" value={row.ia}
                        onChange={e => setRowField(idx, 'ia', e.target.value)}
                        step="0.01"
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs text-center" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Ib (A)</label>
                      <input type="number" value={row.ib}
                        onChange={e => setRowField(idx, 'ib', e.target.value)}
                        step="0.01"
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs text-center" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Idiff (A)</label>
                      <div className="h-9 rounded-lg border border-gray-200 px-2 flex items-center justify-center text-xs font-bold"
                        style={{
                          background: idiff !== null && idiff >= data.pickupCurrent ? '#FFF5F5' : '#F0FFF4',
                          color: idiff !== null && idiff >= data.pickupCurrent ? '#991B1B' : '#166534',
                        }}>
                        {idiff !== null ? fmt(idiff, 3) : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Irest (A)</label>
                      <div className="h-9 rounded-lg border border-gray-200 px-2 flex items-center justify-center text-xs"
                        style={{ background: '#F8FAFC', color: '#64748B' }}>
                        {irestrain !== null ? fmt(irestrain, 3) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Operasi Relay (Aktual)</label>
                      <select value={row.actualOp}
                        onChange={e => setRowField(idx, 'actualOp', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-2 text-sm appearance-none"
                        style={{ WebkitAppearance: 'none' }}>
                        <option value="">-- Pilih --</option>
                        <option value="TRIP">TRIP</option>
                        <option value="NO TRIP">NO TRIP</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      {pass === null ? (
                        <span className="text-sm text-gray-300 font-medium">Belum diisi</span>
                      ) : pass ? (
                        <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#16A34A' }}>
                          ✓ SESUAI
                        </span>
                      ) : (
                        <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#DC2626' }}>
                          ✗ TIDAK SESUAI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <p className="text-xs text-blue-700 font-semibold">Karakteristik Diferensial</p>
          <p className="text-xs text-blue-600 mt-1">
            Idiff = |Ia - Ib| (injeksi berlawanan arah)<br />
            Trip jika: Idiff ≥ Idiff{'>'} = {data.pickupCurrent}A<br />
            Atau jika: Idiff ≥ K × Irestrain = {data.restraintK} × Irestrain
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
