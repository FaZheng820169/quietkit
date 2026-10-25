import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tools } from './pages/Tools'
import { ImageCompressor } from './pages/ImageCompressor'
import { ImageConverter } from './pages/ImageConverter'
import { MetadataCleaner } from './pages/MetadataCleaner'
import { PdfMerge } from './pages/PdfMerge'
import { Pricing } from './pages/Pricing'
import { Privacy } from './pages/Privacy'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'
import { Guides } from './pages/guides/Guides'
import { RemoveLocationPhoto } from './pages/guides/RemoveLocationPhoto'
import { CompressTo100kb } from './pages/guides/CompressTo100kb'
import { MergePdfGuide } from './pages/guides/MergePdfGuide'
import { ExifGuide } from './pages/guides/ExifGuide'
import { ConvertPngToJpg } from './pages/guides/ConvertPngToJpg'
import { WhatIsWebp } from './pages/guides/WhatIsWebp'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/metadata-cleaner" element={<MetadataCleaner />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/remove-location-from-photo" element={<RemoveLocationPhoto />} />
          <Route path="/guides/compress-image-to-100kb" element={<CompressTo100kb />} />
          <Route path="/guides/merge-pdf-without-upload" element={<MergePdfGuide />} />
          <Route path="/guides/exif-viewer" element={<ExifGuide />} />
          <Route path="/guides/convert-png-to-jpg" element={<ConvertPngToJpg />} />
          <Route path="/guides/what-is-webp" element={<WhatIsWebp />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
