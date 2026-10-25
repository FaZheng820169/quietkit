import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tools } from './pages/Tools'
import { ImageCompressor } from './pages/ImageCompressor'
import { ImageConverter } from './pages/ImageConverter'
import { AvifConverter } from './pages/AvifConverter'
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
import { PdfCompress } from './pages/PdfCompress'
import { PdfCompare } from './pages/PdfCompare'
import { Batch } from './pages/Batch'
import { ImageOcr } from './pages/ImageOcr'
import { PdfFormFill } from './pages/PdfFormFill'
import { PdfSign } from './pages/PdfSign'
import { QrCode } from './pages/QrCode'
import { Favicon } from './pages/Favicon'
import { PasswordGenerator } from './pages/PasswordGenerator'
import { WatermarkImage } from './pages/WatermarkImage'
import { ColorConverter } from './pages/ColorConverter'
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
import { WatermarkPdfGuide } from './pages/guides/WatermarkPdfGuide'
import { CompressPdfGuide } from './pages/guides/CompressPdfGuide'
import { RemovePdfMetadataGuide } from './pages/guides/RemovePdfMetadataGuide'
import { JpgToPdfGuide } from './pages/guides/JpgToPdfGuide'
import { ComparePdfGuide } from './pages/guides/ComparePdfGuide'
import { ExifGuide } from './pages/guides/ExifGuide'
import { ConvertPngToJpg } from './pages/guides/ConvertPngToJpg'
import { WhatIsWebp } from './pages/guides/WhatIsWebp'
import { SocialMediaImageSizes } from './pages/guides/SocialMediaImageSizes'
import { HeicToJpg } from './pages/guides/HeicToJpg'
import { AvifToJpgGuide } from './pages/guides/AvifToJpgGuide'
import { ResizeImageGuide } from './pages/guides/ResizeImageGuide'
import { RemovePdfPagesGuide } from './pages/guides/RemovePdfPagesGuide'
import { RotatePdfGuide } from './pages/guides/RotatePdfGuide'
import { ReorderPdfGuide } from './pages/guides/ReorderPdfGuide'
import { ExtractPdfTextGuide } from './pages/guides/ExtractPdfTextGuide'
import { ConvertImagesGuide } from './pages/guides/ConvertImagesGuide'
import { StripPhotoMetadataGuide } from './pages/guides/StripPhotoMetadataGuide'
import { PageNumbersGuide } from './pages/guides/PageNumbersGuide'
import { ResizePdfGuide } from './pages/guides/ResizePdfGuide'
import { BatchFolderGuide } from './pages/guides/BatchFolderGuide'
import { OcrImageGuide } from './pages/guides/OcrImageGuide'
import { FillPdfFormGuide } from './pages/guides/FillPdfFormGuide'
import { SignPdfGuide } from './pages/guides/SignPdfGuide'
import { QrCodeGuide } from './pages/guides/QrCodeGuide'
import { FaviconGuide } from './pages/guides/FaviconGuide'
import { PasswordGeneratorGuide } from './pages/guides/PasswordGeneratorGuide'
import { WatermarkImageGuide } from './pages/guides/WatermarkImageGuide'
import { ColorConverterGuide } from './pages/guides/ColorConverterGuide'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/avif-converter" element={<AvifConverter />} />
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
          <Route path="/tools/pdf-compress" element={<PdfCompress />} />
          <Route path="/tools/pdf-compare" element={<PdfCompare />} />
          <Route path="/tools/batch" element={<Batch />} />
          <Route path="/tools/image-ocr" element={<ImageOcr />} />
          <Route path="/tools/pdf-form-fill" element={<PdfFormFill />} />
          <Route path="/tools/pdf-sign" element={<PdfSign />} />
          <Route path="/tools/qr-code" element={<QrCode />} />
          <Route path="/tools/favicon" element={<Favicon />} />
          <Route path="/tools/password-generator" element={<PasswordGenerator />} />
          <Route path="/tools/image-watermark" element={<WatermarkImage />} />
          <Route path="/tools/color-converter" element={<ColorConverter />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/remove-location-from-photo" element={<RemoveLocationPhoto />} />
          <Route path="/guides/compress-image-to-100kb" element={<CompressTo100kb />} />
          <Route path="/guides/merge-pdf-without-upload" element={<MergePdfGuide />} />
          <Route path="/guides/split-pdf-without-upload" element={<SplitPdfGuide />} />
          <Route path="/guides/pdf-to-jpg-without-upload" element={<PdfToJpgGuide />} />
          <Route path="/guides/watermark-pdf-without-upload" element={<WatermarkPdfGuide />} />
          <Route path="/guides/compress-pdf-without-upload" element={<CompressPdfGuide />} />
          <Route path="/guides/remove-pdf-metadata" element={<RemovePdfMetadataGuide />} />
          <Route path="/guides/jpg-to-pdf-without-upload" element={<JpgToPdfGuide />} />
          <Route path="/guides/compare-pdf-without-upload" element={<ComparePdfGuide />} />
          <Route path="/guides/exif-viewer" element={<ExifGuide />} />
          <Route path="/guides/convert-png-to-jpg" element={<ConvertPngToJpg />} />
          <Route path="/guides/what-is-webp" element={<WhatIsWebp />} />
          <Route path="/guides/social-media-image-sizes" element={<SocialMediaImageSizes />} />
          <Route path="/guides/heic-to-jpg" element={<HeicToJpg />} />
          <Route path="/guides/avif-to-jpg" element={<AvifToJpgGuide />} />
          <Route path="/guides/resize-image-without-upload" element={<ResizeImageGuide />} />
          <Route path="/guides/remove-pdf-pages-without-upload" element={<RemovePdfPagesGuide />} />
          <Route path="/guides/rotate-pdf-without-upload" element={<RotatePdfGuide />} />
          <Route path="/guides/reorder-pdf-pages-without-upload" element={<ReorderPdfGuide />} />
          <Route path="/guides/extract-text-from-pdf-without-upload" element={<ExtractPdfTextGuide />} />
          <Route path="/guides/convert-images-without-upload" element={<ConvertImagesGuide />} />
          <Route path="/guides/remove-exif-metadata-without-upload" element={<StripPhotoMetadataGuide />} />
          <Route path="/guides/add-page-numbers-to-pdf-without-upload" element={<PageNumbersGuide />} />
          <Route path="/guides/resize-pdf-pages-without-upload" element={<ResizePdfGuide />} />
          <Route path="/guides/batch-process-folder-without-upload" element={<BatchFolderGuide />} />
          <Route path="/guides/ocr-image-without-upload" element={<OcrImageGuide />} />
          <Route path="/guides/fill-pdf-form-without-upload" element={<FillPdfFormGuide />} />
          <Route path="/guides/sign-pdf-without-upload" element={<SignPdfGuide />} />
          <Route path="/guides/qr-code-without-upload" element={<QrCodeGuide />} />
          <Route path="/guides/favicon-without-upload" element={<FaviconGuide />} />
          <Route path="/guides/password-generator-without-upload" element={<PasswordGeneratorGuide />} />
          <Route path="/guides/watermark-image-without-upload" element={<WatermarkImageGuide />} />
          <Route path="/guides/color-converter-without-upload" element={<ColorConverterGuide />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
