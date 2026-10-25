import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tools } from './pages/Tools'
import { ImageCompressor } from './pages/ImageCompressor'
import { MetadataCleaner } from './pages/MetadataCleaner'
import { PdfMerge } from './pages/PdfMerge'
import { Pricing } from './pages/Pricing'
import { Privacy } from './pages/Privacy'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/metadata-cleaner" element={<MetadataCleaner />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
