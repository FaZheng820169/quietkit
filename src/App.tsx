import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tools } from './pages/Tools'
import { ImageCompressor } from './pages/ImageCompressor'
import { ImageConverter } from './pages/ImageConverter'
import { ImageResizer } from './pages/ImageResizer'
import { MetadataCleaner } from './pages/MetadataCleaner'
import { PdfMerge } from './pages/PdfMerge'
import { PdfPages } from './pages/PdfPages'
import { PdfRotate } from './pages/PdfRotate'
import { PdfReorder } from './pages/PdfReorder'
import { JpgToPdf } from './pages/JpgToPdf'
import { PdfText } from './pages/PdfText'
import { PdfPageNumbers } from './pages/PdfPageNumbers'
import { PdfWatermark } from './pages/PdfWatermark'
import { PdfMetadata } from './pages/PdfMetadata'
import { PdfResize } from './pages/PdfResize'
import { PdfSplit } from './pages/PdfSplit'
import { PdfToJpg } from './pages/PdfToJpg'
import { Pricing } from './pages/Pricing'
import { Privacy } from './pages/Privacy'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'
import { Guides } from './pages/guides/Guides'
import { RemoveLocationPhoto } from './pages/guides/RemoveLocationPhoto'
import { CompressTo100kb } from './pages/guides/CompressTo100kb'
import { MergePdfGuide } from './pages/guides/MergePdfGuide'
import { SplitPdfGuide } from './pages/guides/SplitPdfGuide'
import { PdfToJpgGuide } from './pages/guides/PdfToJpgGuide'
import { ExifGuide } from './pages/guides/ExifGuide'
import { ConvertPngToJpg } from './pages/guides/ConvertPngToJpg'
import { WhatIsWebp } from './pages/guides/WhatIsWebp'
import { SocialMediaImageSizes } from './pages/guides/SocialMediaImageSizes'
import { HeicToJpg } from './pages/guides/HeicToJpg'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/image-resizer" element={<ImageResizer />} />
          <Route path="/tools/metadata-cleaner" element={<MetadataCleaner />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
          <Route path="/tools/pdf-remove-pages" element={<PdfPages />} />
          <Route path="/tools/pdf-rotate" element={<PdfRotate />} />
          <Route path="/tools/pdf-reorder" element={<PdfReorder />} />
          <Route path="/tools/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/tools/pdf-text" element={<PdfText />} />
          <Route path="/tools/pdf-page-numbers" element={<PdfPageNumbers />} />
          <Route path="/tools/pdf-watermark" element={<PdfWatermark />} />
          <Route path="/tools/pdf-metadata" element={<PdfMetadata />} />
          <Route path="/tools/pdf-resize" element={<PdfResize />} />
          <Route path="/tools/pdf-split" element={<PdfSplit />} />
          <Route path="/tools/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/remove-location-from-photo" element={<RemoveLocationPhoto />} />
          <Route path="/guides/compress-image-to-100kb" element={<CompressTo100kb />} />
          <Route path="/guides/merge-pdf-without-upload" element={<MergePdfGuide />} />
          <Route path="/guides/split-pdf-without-upload" element={<SplitPdfGuide />} />
          <Route path="/guides/pdf-to-jpg-without-upload" element={<PdfToJpgGuide />} />
          <Route path="/guides/exif-viewer" element={<ExifGuide />} />
          <Route path="/guides/convert-png-to-jpg" element={<ConvertPngToJpg />} />
          <Route path="/guides/what-is-webp" element={<WhatIsWebp />} />
          <Route path="/guides/social-media-image-sizes" element={<SocialMediaImageSizes />} />
          <Route path="/guides/heic-to-jpg" element={<HeicToJpg />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
