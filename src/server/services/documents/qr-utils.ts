import "server-only"

import QRCode from "qrcode"

/**
 * Generates a QR code as a PNG data URL for embedding in @react-pdf/renderer templates.
 * The QR code encodes the full verification URL.
 */
export async function generateQRCodeDataUrl(verificationUrl: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  })
}
