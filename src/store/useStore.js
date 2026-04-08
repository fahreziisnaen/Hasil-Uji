import { create } from 'zustand'
import { openDB } from 'idb'

const DB_NAME = 'hasil-uji-har'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const s = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true })
        s.createIndex('date', 'date')
      }
      if (!db.objectStoreNames.contains('dataForms')) {
        db.createObjectStore('dataForms') // key = projectId
      }
      if (!db.objectStoreNames.contains('testResults')) {
        db.createObjectStore('testResults') // key = "projectId_testName"
      }
    }
  })
}

function defaultDataForm() {
  return {
    // Administrasi
    upt: 'Surabaya',
    ultg: '',
    garduInduk: '',
    garduIndukLawan: '',
    teganganKv: 150,
    namaPekerjaan: 'Pemeliharaan 2 Tahunan',
    tanggal: new Date().toISOString().split('T')[0],
    penangungJawab: '',
    pengawas: '',
    pelaksana1: '',
    pelaksana2: '',
    supervisorHarpro: '',
    pelaksanaOrg: '',
    supervisorGI: '',
    // Relay Distance
    merkDistance: 'SIEMENS',
    typeDistance: 'SIPROTEC 7SL87',
    serialDistance: '',
    ctP: 3000,
    ctS: 1,
    lokasiVT: 'Line',
    vtMainP: 150000,
    vtMainS: 100,
    vtSynchroP: 150000,
    vtSynchroS: 100,
    panjangPenghantar: 0,
    jenisKabel: 'OHL',
    impedansiOhm: 0,
    impedansiAngle: 75,
    // Settings Distance Z1
    z1PhGOhm: 0,
    z1PhGAngle: 75,
    z1PhGMs: 0,
    // Z2
    z2PhGOhm: 0,
    z2PhGAngle: 75,
    z2PhGMs: 400,
    // Z3
    z3PhGOhm: 0,
    z3PhGAngle: 75,
    z3PhGMs: 1600,
    // Z4
    z4PhGOhm: 0,
    z4PhGAngle: 75,
    z4PhGMs: 0,
    // Relay OCR
    merkOCR: 'SIEMENS',
    typeOCR: 'SIPROTEC 7SJ64',
    serialOCR: '',
    ctOCRP: 3000,
    ctOCRS: 1,
    // OCR Settings
    iPickup: 0.7,
    tmsOCR: 0.24,
    karOCR: 'C SI',
    iePickup: 0.12,
    tmsGFR: 0.48,
    karGFR: 'C SI',
    // AR
    arMode: '1+3',
    dtSpar: 1,
    dtTpar: 1,
    reclaimTime: 180,
    tEvolving: 100,
    // Scheme
    distanceScheme: 'POTT',
    defMode: 'DEF Internal',
    waktuAidedDEF: 100,
    threshold3I0: 0.05,
    threshold3V0: 0.7,
    // Synchrocheck
    deltaF: 0.17,
    deltaV: 6.5,
    deltaSudut: 20,
    tegRef: 'Phasa R',
    modeSynchro1: 'LBLL',
    modeSynchro2: 'LBDL',
    // Load Blinder
    zblinderOhm: 0,
    lbAngle: 40,
  }
}

export const useStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  dataForm: defaultDataForm(),
  testResults: {},
  isLoading: false,

  async init() {
    set({ isLoading: true })
    try {
      const db = await getDB()
      const projects = await db.getAll('projects')
      projects.sort((a, b) => new Date(b.date) - new Date(a.date))
      if (projects.length > 0) {
        const p = projects[0]
        const form = await db.get('dataForms', p.id) || defaultDataForm()
        const allResults = await db.getAll('testResults')
        const results = {}
        allResults
          .filter(r => r.projectId === p.id)
          .forEach(r => { results[r.testName] = r })
        set({ projects, currentProject: p, dataForm: form, testResults: results })
      } else {
        set({ projects })
      }
    } catch (err) {
      console.error('Init error:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  async createProject(giName, bayName) {
    const db = await getDB()
    const project = {
      giName,
      bayName,
      date: new Date().toISOString(),
      status: 'aktif'
    }
    const id = await db.add('projects', project)
    project.id = id
    const form = { ...defaultDataForm(), garduInduk: giName }
    await db.put('dataForms', form, id)
    set(s => ({
      projects: [project, ...s.projects],
      currentProject: project,
      dataForm: form,
      testResults: {}
    }))
    return project
  },

  async loadProject(id) {
    set({ isLoading: true })
    try {
      const db = await getDB()
      const project = await db.get('projects', id)
      const form = await db.get('dataForms', id) || defaultDataForm()
      const allResults = await db.getAll('testResults')
      const results = {}
      allResults
        .filter(r => r.projectId === id)
        .forEach(r => { results[r.testName] = r })
      set({ currentProject: project, dataForm: form, testResults: results })
    } finally {
      set({ isLoading: false })
    }
  },

  async saveDataForm(form) {
    const { currentProject } = get()
    if (!currentProject) return
    const db = await getDB()
    await db.put('dataForms', form, currentProject.id)
    set({ dataForm: form })
  },

  async saveTestResult(testName, data, status) {
    const { currentProject } = get()
    if (!currentProject) return
    const db = await getDB()
    const result = {
      projectId: currentProject.id,
      testName,
      data,
      status,
      updatedAt: new Date().toISOString()
    }
    await db.put('testResults', result, `${currentProject.id}_${testName}`)
    set(s => ({
      testResults: { ...s.testResults, [testName]: result }
    }))
  },

  async deleteProject(id) {
    const db = await getDB()
    await db.delete('projects', id)
    await db.delete('dataForms', id)
    // Delete all test results for this project
    const allKeys = await db.getAllKeys('testResults')
    for (const key of allKeys) {
      if (String(key).startsWith(`${id}_`)) {
        await db.delete('testResults', key)
      }
    }
    const { projects, currentProject } = get()
    const newProjects = projects.filter(p => p.id !== id)
    if (currentProject?.id === id) {
      set({
        projects: newProjects,
        currentProject: null,
        dataForm: defaultDataForm(),
        testResults: {}
      })
    } else {
      set({ projects: newProjects })
    }
  },

  updateDataForm(field, value) {
    set(s => ({ dataForm: { ...s.dataForm, [field]: value } }))
  },

  getProgress() {
    const results = get().testResults
    const testNames = ['metering', 'karakteristik', 'ocr', 'ar-synchro', 'fault-locator', 'teleproteksi', 'lcd']
    const total = testNames.length
    const passed = testNames.filter(name => results[name]?.status === 'lulus').length
    return { passed, total, pct: total > 0 ? passed / total : 0 }
  }
}))

export { defaultDataForm }
