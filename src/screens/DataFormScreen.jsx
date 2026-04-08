import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import AppBar from '../components/AppBar'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import { useToast, Toast } from '../components/Toast'
import { useStore } from '../store/useStore'
import { loadBlinderRecommended, loadBlinderAngle, fmt } from '../utils/calculations'

const UPT_OPTIONS = [
  { value: 'Bali', label: 'UPT Bali' },
  { value: 'Gresik', label: 'UPT Gresik' },
  { value: 'Madiun', label: 'UPT Madiun' },
  { value: 'Malang', label: 'UPT Malang' },
  { value: 'Probolinggo', label: 'UPT Probolinggo' },
  { value: 'Surabaya', label: 'UPT Surabaya' },
]

const ULTG_OPTIONS = [
  { value: '', label: '-- Pilih ULTG --' },
  { value: 'ULTG Surabaya', label: 'ULTG Surabaya' },
  { value: 'ULTG Gresik', label: 'ULTG Gresik' },
  { value: 'ULTG Sidoarjo', label: 'ULTG Sidoarjo' },
  { value: 'ULTG Mojokerto', label: 'ULTG Mojokerto' },
  { value: 'ULTG Kediri', label: 'ULTG Kediri' },
  { value: 'ULTG Malang', label: 'ULTG Malang' },
  { value: 'ULTG Pasuruan', label: 'ULTG Pasuruan' },
  { value: 'ULTG Probolinggo', label: 'ULTG Probolinggo' },
  { value: 'ULTG Jember', label: 'ULTG Jember' },
  { value: 'ULTG Madiun', label: 'ULTG Madiun' },
  { value: 'ULTG Blitar', label: 'ULTG Blitar' },
  { value: 'ULTG Denpasar', label: 'ULTG Denpasar' },
  { value: 'ULTG Bali Timur', label: 'ULTG Bali Timur' },
  { value: 'ULTG Bali Selatan', label: 'ULTG Bali Selatan' },
]

const TEGANGAN_OPTIONS = [
  { value: 500, label: '500 kV' },
  { value: 150, label: '150 kV' },
  { value: 66, label: '66 kV' },
  { value: 25, label: '25 kV' },
]

const CURVE_OPTIONS = [
  { value: 'C SI',  label: 'C SI – IEC Standard Inverse' },
  { value: 'C VI',  label: 'C VI – IEC Very Inverse' },
  { value: 'C EI',  label: 'C EI – IEC Extremely Inverse' },
  { value: 'C LTI', label: 'C LTI – IEC Long Time Inverse' },
  { value: 'C STI', label: 'C STI – IEC Short Time Inverse' },
  { value: 'A MI',  label: 'A MI – ANSI Moderately Inverse' },
  { value: 'A I',   label: 'A I – ANSI Inverse' },
  { value: 'A VI',  label: 'A VI – ANSI Very Inverse' },
  { value: 'A EI',  label: 'A EI – ANSI Extremely Inverse' },
  { value: 'DT',    label: 'DT – Definite Time' },
]

const TABS = [
  'Administrasi',
  'Relay Distance',
  'Setting Distance',
  'Relay OCR',
  'AR & Skema',
  'Synchro & Blinder',
]

export default function DataFormScreen() {
  const navigate = useNavigate()
  const { dataForm, saveDataForm, currentProject } = useStore()
  const { toast, showToast } = useToast()
  const [activeTab, setActiveTab] = useState(0)
  const [form, setForm] = useState(dataForm)

  useEffect(() => {
    setForm(dataForm)
  }, [dataForm])

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const setNumField = useCallback((field, value) => {
    const n = parseFloat(value)
    setForm(prev => ({ ...prev, [field]: isNaN(n) ? value : n }))
  }, [])

  async function handleSave() {
    await saveDataForm(form)
    showToast('Tersimpan ✓')
  }

  const recLB = loadBlinderRecommended(form.teganganKv, form.ctP)
  const recAngle = loadBlinderAngle()

  return (
    <div className="app-container">
      <AppBar
        title="Data Form"
        subtitle="Input Data Pengujian"
        onBack={() => navigate('/')}
      />

      {/* TAB BAR */}
      <div
        className="fixed z-40 overflow-x-auto flex"
        style={{
          top: 56,
          maxWidth: 480,
          width: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A3A6B',
        }}
      >
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className="flex-shrink-0 px-3 py-2.5 text-xs font-semibold transition-colors relative whitespace-nowrap"
            style={{
              color: activeTab === i ? 'white' : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === i ? '3px solid #F57C00' : '3px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="pt-[104px] pb-28 overflow-y-auto px-4">

        {/* TAB 0: ADMINISTRASI */}
        {activeTab === 0 && (
          <div className="space-y-4 mt-2">
            <SectionCard title="Identitas Pekerjaan">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="UPT"
                  value={form.upt}
                  onChange={v => setField('upt', v)}
                  options={UPT_OPTIONS}
                />
                <SelectField
                  label="ULTG"
                  value={form.ultg}
                  onChange={v => setField('ultg', v)}
                  options={ULTG_OPTIONS}
                />
              </div>
              <InputField label="Gardu Induk" value={form.garduInduk} onChange={v => setField('garduInduk', v)} placeholder="Nama GI" />
              <InputField label="Gardu Induk Lawan" value={form.garduIndukLawan} onChange={v => setField('garduIndukLawan', v)} placeholder="GI ujung lawan" />
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Tegangan (kV)"
                  value={form.teganganKv}
                  onChange={v => setNumField('teganganKv', v)}
                  options={TEGANGAN_OPTIONS}
                />
                <InputField label="Tanggal" type="date" value={form.tanggal} onChange={v => setField('tanggal', v)} />
              </div>
              <InputField label="Nama Pekerjaan" value={form.namaPekerjaan} onChange={v => setField('namaPekerjaan', v)} />
            </SectionCard>

            <SectionCard title="Personil">
              <InputField label="Penanggung Jawab" value={form.penangungJawab} onChange={v => setField('penangungJawab', v)} placeholder="Nama PJ" />
              <InputField label="Pengawas" value={form.pengawas} onChange={v => setField('pengawas', v)} placeholder="Nama pengawas" />
              <InputField label="Pelaksana 1" value={form.pelaksana1} onChange={v => setField('pelaksana1', v)} placeholder="Nama pelaksana" />
              <InputField label="Pelaksana 2" value={form.pelaksana2} onChange={v => setField('pelaksana2', v)} placeholder="Nama pelaksana" />
              <InputField label="Supervisor HAR PRO" value={form.supervisorHarpro} onChange={v => setField('supervisorHarpro', v)} />
              <InputField label="Pelaksana Organisasi" value={form.pelaksanaOrg} onChange={v => setField('pelaksanaOrg', v)} />
              <InputField label="Supervisor GI" value={form.supervisorGI} onChange={v => setField('supervisorGI', v)} />
            </SectionCard>
          </div>
        )}

        {/* TAB 1: RELAY DISTANCE */}
        {activeTab === 1 && (
          <div className="space-y-4 mt-2">
            <SectionCard title="Identitas Relay Distance">
              <InputField label="Merk" value={form.merkDistance} onChange={v => setField('merkDistance', v)} placeholder="SIEMENS / ABB / GE..." />
              <InputField label="Type / Model" value={form.typeDistance} onChange={v => setField('typeDistance', v)} placeholder="SIPROTEC 7SL87..." />
              <InputField label="Serial Number" value={form.serialDistance} onChange={v => setField('serialDistance', v)} placeholder="S/N..." />
            </SectionCard>

            <SectionCard title="CT (Current Transformer)">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="CT Primer (A)" type="number" value={form.ctP} onChange={v => setNumField('ctP', v)} unit="A" />
                <InputField label="CT Sekunder (A)" type="number" value={form.ctS} onChange={v => setNumField('ctS', v)} unit="A" />
              </div>
            </SectionCard>

            <SectionCard title="VT (Voltage Transformer)">
              <SelectField
                label="Lokasi VT"
                value={form.lokasiVT}
                onChange={v => setField('lokasiVT', v)}
                options={[{ value: 'Line', label: 'Line' }, { value: 'Busbar', label: 'Busbar' }]}
              />
              <p className="text-xs font-semibold text-gray-500 mt-2">VT Main</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Primer (V)" type="number" value={form.vtMainP} onChange={v => setNumField('vtMainP', v)} unit="V" />
                <InputField label="Sekunder (V)" type="number" value={form.vtMainS} onChange={v => setNumField('vtMainS', v)} unit="V" />
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-2">VT Synchrocheck</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Primer (V)" type="number" value={form.vtSynchroP} onChange={v => setNumField('vtSynchroP', v)} unit="V" />
                <InputField label="Sekunder (V)" type="number" value={form.vtSynchroS} onChange={v => setNumField('vtSynchroS', v)} unit="V" />
              </div>
            </SectionCard>

            <SectionCard title="Data Penghantar">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Panjang (km)" type="number" value={form.panjangPenghantar} onChange={v => setNumField('panjangPenghantar', v)} unit="km" />
                <SelectField
                  label="Jenis Kabel"
                  value={form.jenisKabel}
                  onChange={v => setField('jenisKabel', v)}
                  options={[{ value: 'OHL', label: 'OHL (Udara)' }, { value: 'Kabel', label: 'Kabel Tanah' }]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Impedansi (Ω/km)" type="number" value={form.impedansiOhm} onChange={v => setNumField('impedansiOhm', v)} unit="Ω/km" />
                <InputField label="Sudut (°)" type="number" value={form.impedansiAngle} onChange={v => setNumField('impedansiAngle', v)} unit="°" />
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB 2: SETTING DISTANCE */}
        {activeTab === 2 && (
          <div className="space-y-4 mt-2">
            {[
              { z: 'z1', label: 'Zone 1', color: '#16A34A' },
              { z: 'z2', label: 'Zone 2', color: '#D97706' },
              { z: 'z3', label: 'Zone 3', color: '#DC2626' },
              { z: 'z4', label: 'Zone 4 (Reverse)', color: '#7C3AED' },
            ].map(({ z, label, color }) => (
              <div key={z} className="bg-white rounded-xl shadow-sm overflow-hidden"
                style={{ borderLeft: `4px solid ${color}` }}>
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-sm" style={{ color }}>{label}</p>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Ph – G (Phase to Ground)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <InputField label="Ohm" type="number" value={form[`${z}PhGOhm`]}
                      onChange={v => setNumField(`${z}PhGOhm`, v)} unit="Ω" />
                    <InputField label="Sudut" type="number" value={form[`${z}PhGAngle`]}
                      onChange={v => setNumField(`${z}PhGAngle`, v)} unit="°" />
                    <InputField label="Waktu" type="number" value={form[`${z}PhGMs`]}
                      onChange={v => setNumField(`${z}PhGMs`, v)} unit="ms" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">Ph – Ph (Phase to Phase, auto)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ohm</label>
                      <div className="h-11 rounded-lg bg-gray-50 border border-gray-200 px-3 flex items-center text-sm text-gray-500">
                        {fmt(form[`${z}PhGOhm`] * Math.sqrt(3), 3)} Ω
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sudut</label>
                      <div className="h-11 rounded-lg bg-gray-50 border border-gray-200 px-3 flex items-center text-sm text-gray-500">
                        {form[`${z}PhGAngle`]}°
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Waktu</label>
                      <div className="h-11 rounded-lg bg-gray-50 border border-gray-200 px-3 flex items-center text-sm text-gray-500">
                        {form[`${z}PhGMs`]} ms
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: RELAY OCR */}
        {activeTab === 3 && (
          <div className="space-y-4 mt-2">
            <SectionCard title="Identitas Relay OCR">
              <InputField label="Merk" value={form.merkOCR} onChange={v => setField('merkOCR', v)} placeholder="SIEMENS / ABB..." />
              <InputField label="Type / Model" value={form.typeOCR} onChange={v => setField('typeOCR', v)} placeholder="SIPROTEC 7SJ64..." />
              <InputField label="Serial Number" value={form.serialOCR} onChange={v => setField('serialOCR', v)} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="CT Primer (A)" type="number" value={form.ctOCRP} onChange={v => setNumField('ctOCRP', v)} unit="A" />
                <InputField label="CT Sekunder (A)" type="number" value={form.ctOCRS} onChange={v => setNumField('ctOCRS', v)} unit="A" />
              </div>
            </SectionCard>

            <SectionCard title="Setting OCR (Phase I>)">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="I> Pickup (A sek)" type="number" value={form.iPickup} onChange={v => setNumField('iPickup', v)} unit="A" step="0.01" />
                <InputField label="TMS" type="number" value={form.tmsOCR} onChange={v => setNumField('tmsOCR', v)} step="0.01" />
              </div>
              <SelectField
                label="Karakteristik"
                value={form.karOCR}
                onChange={v => setField('karOCR', v)}
                options={CURVE_OPTIONS}
              />
            </SectionCard>

            <SectionCard title="Setting GFR (Earth Ie>)">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Ie> Pickup (A sek)" type="number" value={form.iePickup} onChange={v => setNumField('iePickup', v)} unit="A" step="0.01" />
                <InputField label="TMS GFR" type="number" value={form.tmsGFR} onChange={v => setNumField('tmsGFR', v)} step="0.01" />
              </div>
              <SelectField
                label="Karakteristik GFR"
                value={form.karGFR}
                onChange={v => setField('karGFR', v)}
                options={CURVE_OPTIONS}
              />
            </SectionCard>
          </div>
        )}

        {/* TAB 4: AR & SKEMA */}
        {activeTab === 4 && (
          <div className="space-y-4 mt-2">
            <SectionCard title="Auto Reclosing (AR)">
              <SelectField
                label="Mode AR"
                value={form.arMode}
                onChange={v => setField('arMode', v)}
                options={[
                  { value: '1', label: '1-Fasa' },
                  { value: '3', label: '3-Fasa' },
                  { value: '1+3', label: '1+3 Fasa' },
                  { value: 'Off', label: 'Off (Disable)' },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="DT SPAR (s)" type="number" value={form.dtSpar} onChange={v => setNumField('dtSpar', v)} unit="s" step="0.1" />
                <InputField label="DT TPAR (s)" type="number" value={form.dtTpar} onChange={v => setNumField('dtTpar', v)} unit="s" step="0.1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Reclaim Time (s)" type="number" value={form.reclaimTime} onChange={v => setNumField('reclaimTime', v)} unit="s" />
                <InputField label="t Evolving (ms)" type="number" value={form.tEvolving} onChange={v => setNumField('tEvolving', v)} unit="ms" />
              </div>
            </SectionCard>

            <SectionCard title="Skema Proteksi Distance">
              <SelectField
                label="Distance Scheme"
                value={form.distanceScheme}
                onChange={v => setField('distanceScheme', v)}
                options={[
                  { value: 'PUTT',  label: 'PUTT – Permissive Underreach' },
                  { value: 'POTT',  label: 'POTT – Permissive Overreach' },
                  { value: 'BLOCKING', label: 'BLOCKING' },
                  { value: 'BASIC', label: 'BASIC (No Teleprotection)' },
                  { value: 'WEAK IN FEED', label: 'WEAK IN FEED' },
                ]}
              />
            </SectionCard>

            <SectionCard title="DEF (Directional Earth Fault)">
              <SelectField
                label="Mode DEF"
                value={form.defMode}
                onChange={v => setField('defMode', v)}
                options={[
                  { value: 'DEF Internal',  label: 'DEF Internal' },
                  { value: 'DEF Eksternal', label: 'DEF Eksternal' },
                ]}
              />
              <InputField label="Waktu Aided DEF (ms)" type="number" value={form.waktuAidedDEF} onChange={v => setNumField('waktuAidedDEF', v)} unit="ms" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Threshold 3I0 (A)" type="number" value={form.threshold3I0} onChange={v => setNumField('threshold3I0', v)} unit="A" step="0.01" />
                <InputField label="Threshold 3V0 (V)" type="number" value={form.threshold3V0} onChange={v => setNumField('threshold3V0', v)} unit="V" step="0.1" />
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB 5: SYNCHRO & BLINDER */}
        {activeTab === 5 && (
          <div className="space-y-4 mt-2">
            <SectionCard title="Synchrocheck Settings">
              <div className="grid grid-cols-3 gap-3">
                <InputField label="ΔF (Hz)" type="number" value={form.deltaF} onChange={v => setNumField('deltaF', v)} unit="Hz" step="0.01" />
                <InputField label="ΔV (%)" type="number" value={form.deltaV} onChange={v => setNumField('deltaV', v)} unit="%" step="0.5" />
                <InputField label="ΔSudut (°)" type="number" value={form.deltaSudut} onChange={v => setNumField('deltaSudut', v)} unit="°" step="1" />
              </div>
              <SelectField
                label="Tegangan Referensi"
                value={form.tegRef}
                onChange={v => setField('tegRef', v)}
                options={[
                  { value: 'Phasa R', label: 'Phasa R' },
                  { value: 'Phasa S', label: 'Phasa S' },
                  { value: 'Phasa T', label: 'Phasa T' },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Mode Synchro 1"
                  value={form.modeSynchro1}
                  onChange={v => setField('modeSynchro1', v)}
                  options={[
                    { value: 'LBLL', label: 'LBLL' },
                    { value: 'LBDL', label: 'LBDL' },
                    { value: 'DBLL', label: 'DBLL' },
                    { value: 'DBDL', label: 'DBDL' },
                  ]}
                />
                <SelectField
                  label="Mode Synchro 2"
                  value={form.modeSynchro2}
                  onChange={v => setField('modeSynchro2', v)}
                  options={[
                    { value: 'LBLL', label: 'LBLL' },
                    { value: 'LBDL', label: 'LBDL' },
                    { value: 'DBLL', label: 'DBLL' },
                    { value: 'DBDL', label: 'DBDL' },
                  ]}
                />
              </div>
            </SectionCard>

            <SectionCard title="Load Blinder">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Z< Blinder (Ω)" type="number" value={form.zblinderOhm} onChange={v => setNumField('zblinderOhm', v)} unit="Ω" step="0.1" />
                <InputField label="LB Angle (°)" type="number" value={form.lbAngle} onChange={v => setNumField('lbAngle', v)} unit="°" step="1" />
              </div>
              <div className="mt-2 p-3 rounded-lg" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                <p className="text-xs font-semibold text-blue-700 mb-1">Rekomendasi</p>
                {isNaN(recLB) ? (
                  <p className="text-xs text-blue-600">Isi data CT Primer &amp; Tegangan kV</p>
                ) : (
                  <>
                    <p className="text-xs text-blue-600">
                      Z<sub>blinder</sub> ≥ <strong>{fmt(recLB, 2)} Ω</strong>
                      <span className="text-blue-400 ml-1">(0.8 × V<sub>LN</sub> / 2×I<sub>CCC</sub>)</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Sudut ≥ <strong>{fmt(recAngle, 1)}°</strong>
                      <span className="text-blue-400 ml-1">(cos⁻¹(0.8) + 4°)</span>
                    </p>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      {/* SAVE BUTTON */}
      <div
        className="fixed bottom-0 left-0 w-full px-4 py-3 z-40"
        style={{
          background: 'rgba(240,242,245,0.95)',
          backdropFilter: 'blur(8px)',
          maxWidth: 480,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <button
          onClick={handleSave}
          className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: '#1A3A6B' }}
        >
          <Save size={18} />
          Simpan Data
        </button>
      </div>

      <Toast toast={toast} />
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
        <p className="font-bold text-xs text-gray-600 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}
