import * as path from "node:path"
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

// Register fonts from local TTF files (CDN URLs are unreliable)
const fontsDir = path.join(process.cwd(), "node_modules/dejavu-fonts-ttf/ttf")

Font.register({
  family: "DejaVu Sans",
  src: path.join(fontsDir, "DejaVuSans.ttf"),
})

Font.register({
  family: "DejaVu Sans Bold",
  src: path.join(fontsDir, "DejaVuSans-Bold.ttf"),
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu Sans",
    fontSize: 11,
    padding: 32,
    backgroundColor: "#ffffff",
  },
  outerFrame: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#1a1a2e",
    padding: 3,
    position: "relative",
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#c9a227",
    padding: 28,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 28,
    letterSpacing: 2,
    color: "#1a1a2e",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  goldLine: {
    width: 120,
    height: 2,
    backgroundColor: "#c9a227",
    marginBottom: 8,
  },
  university: {
    fontSize: 11,
    color: "#444444",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  body: {
    alignItems: "center",
    textAlign: "center",
    marginVertical: 16,
    paddingHorizontal: 32,
  },
  certifyText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 1.7,
    marginBottom: 20,
  },
  strong: {
    fontFamily: "DejaVu Sans Bold",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 8,
  },
  detailItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  detailItemBorder: {
    alignItems: "center",
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  detailLabel: {
    fontSize: 9,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 11,
    color: "#1a1a2e",
    textAlign: "center",
  },
  emailText: {
    fontSize: 9,
    color: "#666666",
    marginTop: 12,
  },
  sigSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 80,
    marginTop: 16,
  },
  sigBox: {
    alignItems: "center",
    width: 160,
  },
  sigLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#1a1a2e",
    paddingTop: 4,
    fontSize: 9,
    color: "#555555",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  issueDate: {
    fontSize: 8,
    color: "#999999",
  },
  verificationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrCode: {
    width: 48,
    height: 48,
  },
  vTextBox: {
    alignItems: "flex-start",
  },
  vCode: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    color: "#1a1a2e",
  },
  vUrl: {
    fontSize: 7,
    color: "#888888",
    marginTop: 2,
  },
})

export interface CertificateData {
  studentName: string
  studentEmail: string
  universityName: string | null
  companyName: string
  offerTitle: string
  internshipType: string
  startDate: Date
  endDate: Date
}

interface CertificateTemplateProps {
  data: CertificateData
  locale?: string
  verificationCode?: string
  qrCodeDataUrl?: string
}

export function InternshipCertificateTemplate({
  data,
  locale = "en",
  verificationCode,
  qrCodeDataUrl,
}: CertificateTemplateProps) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const title =
    locale === "fr"
      ? "CERTIFICAT DE STAGE"
      : locale === "ar"
        ? "شهادة تدريب"
        : "INTERNSHIP CERTIFICATE"

  const subjectLabel =
    locale === "fr" ? "Sujet" : locale === "ar" ? "الموضوع" : "Subject"
  const periodLabel =
    locale === "fr" ? "Période" : locale === "ar" ? "الفترة" : "Period"
  const typeLabel =
    locale === "fr" ? "Type" : locale === "ar" ? "النوع" : "Type"
  const uniSig =
    locale === "fr"
      ? "Signature (Université)"
      : locale === "ar"
        ? "توقيع (الجامعة)"
        : "Signature (University)"
  const compSig =
    locale === "fr"
      ? "Signature (Entreprise)"
      : locale === "ar"
        ? "توقيع (المؤسسة)"
        : "Signature (Company)"

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.goldLine} />
              <Text style={styles.university}>
                {data.universityName || "University"}
              </Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.certifyText}>
                {locale === "fr"
                  ? "Nous certifions par la présente que"
                  : locale === "ar"
                    ? "نشهد بموجب هذا أن"
                    : "This is to certify that"}{" "}
                <Text style={styles.strong}>{data.studentName}</Text>{" "}
                {locale === "fr"
                  ? "a effectué un stage au sein de"
                  : locale === "ar"
                    ? "أتم فترة تدريب لدى"
                    : "has successfully completed an internship at"}{" "}
                <Text style={styles.strong}>{data.companyName}</Text>.
              </Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{subjectLabel}</Text>
                  <Text style={styles.detailValue}>{data.offerTitle}</Text>
                </View>

                <View style={styles.detailItemBorder}>
                  <Text style={styles.detailLabel}>{periodLabel}</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(data.startDate)} — {formatDate(data.endDate)}
                  </Text>
                </View>

                <View style={styles.detailItemBorder}>
                  <Text style={styles.detailLabel}>{typeLabel}</Text>
                  <Text style={styles.detailValue}>{data.internshipType}</Text>
                </View>
              </View>

              <Text style={styles.emailText}>{data.studentEmail}</Text>
            </View>

            {/* Signatures */}
            <View style={styles.sigSection}>
              <View style={styles.sigBox}>
                <Text style={styles.sigLine}>{uniSig}</Text>
              </View>
              <View style={styles.sigBox}>
                <Text style={styles.sigLine}>{compSig}</Text>
              </View>
            </View>

            {/* Bottom row: issue date + verification */}
            <View style={styles.bottomRow}>
              <Text style={styles.issueDate}>
                {locale === "fr"
                  ? `Date de délivrance : ${formatDate(new Date())}`
                  : locale === "ar"
                    ? `تاريخ الإصدار : ${formatDate(new Date())}`
                    : `Date of issue : ${formatDate(new Date())}`}
              </Text>

              {verificationCode && (
                <View style={styles.verificationBox}>
                  {qrCodeDataUrl && (
                    <Image style={styles.qrCode} src={qrCodeDataUrl} />
                  )}
                  <View style={styles.vTextBox}>
                    <Text style={styles.vCode}>{verificationCode}</Text>
                    <Text style={styles.vUrl}>stag.io/verify</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
