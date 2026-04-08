import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import HomeScreen from './screens/HomeScreen'
import DataFormScreen from './screens/DataFormScreen'
import HighlightScreen from './screens/HighlightScreen'
import MeteringScreen from './screens/MeteringScreen'
import KarakteristikScreen from './screens/KarakteristikScreen'
import OCRScreen from './screens/OCRScreen'
import ARSynchroScreen from './screens/ARSynchroScreen'
import FaultLocatorScreen from './screens/FaultLocatorScreen'
import TeleproteksiScreen from './screens/TeleproteksiScreen'
import LCDScreen from './screens/LCDScreen'

function App() {
  const init = useStore(s => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/data-form" element={<DataFormScreen />} />
      <Route path="/highlight" element={<HighlightScreen />} />
      <Route path="/metering" element={<MeteringScreen />} />
      <Route path="/karakteristik" element={<KarakteristikScreen />} />
      <Route path="/ocr" element={<OCRScreen />} />
      <Route path="/ar-synchro" element={<ARSynchroScreen />} />
      <Route path="/fault-locator" element={<FaultLocatorScreen />} />
      <Route path="/teleproteksi" element={<TeleproteksiScreen />} />
      <Route path="/lcd" element={<LCDScreen />} />
    </Routes>
  )
}

export default App
