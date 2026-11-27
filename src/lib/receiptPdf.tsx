import { Font, pdf } from '@react-pdf/renderer'
import { ReceiptDocument } from '../components/receipt/ReceiptDocument'
import type { ReceiptData } from './receipt'
import logo from '../assets/sabco_logo.png'

let registered = false
export function registerReceiptFonts(base: string) {
  Font.register({ family: 'ReceiptNoto', fonts: [
    { src: `${base}/NotoSans-Regular.ttf` },
    { src: `${base}/NotoSans-Bold.ttf`, fontWeight: 700 },
  ] })
  Font.registerHyphenationCallback(word => word.length > 30 ? word.match(/.{1,20}/gu) || [word] : [word])
}

/** Lazily loaded once a receipt is requested; preview, print and download use this same PDF. */
export async function generateReceiptPdf(receipt: ReceiptData) {
  if (!registered) {
    registerReceiptFonts(`${window.location.origin}${import.meta.env.BASE_URL}fonts`)
    registered = true
  }
  return pdf(<ReceiptDocument receipt={receipt} logo={logo} />).toBlob()
}
