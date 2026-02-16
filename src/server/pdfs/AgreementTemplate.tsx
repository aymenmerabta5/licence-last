import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import * as path from "node:path"

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
    paddingTop: 50,
    paddingHorizontal: 50,
    // Reserve space for fixed verification + footer blocks.
    paddingBottom: 165,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 18,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "35%",
    color: "#555555",
  },
  value: {
    width: "65%",
    fontFamily: "DejaVu Sans Bold",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridColumn: {
    width: "48%",
  },
  gridColumnTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 11,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    padding: 6,
  },
  datesSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  dateBox: {
    textAlign: "center",
  },
  dateLabel: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 4,
  },
  dateValue: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 12,
  },
  signaturesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBox: {
    width: "30%",
    textAlign: "center",
  },
  signatureLabel: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    marginBottom: 40,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 4,
    fontSize: 9,
    color: "#666666",
  },
  verificationBar: {
    position: "absolute",
    bottom: 78,
    left: 50,
    right: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 8,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  verificationText: {
    fontSize: 8,
    color: "#666666",
  },
  verificationCode: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    color: "#333333",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 1.3,
    color: "#999999",
  },
})

export interface AgreementData {
  // Student info
  studentName: string
  studentEmail: string
  studentPhone: string | null
  studentNumber: string | null
  studentDepartment: string | null
  studentAddress: string | null

  // Company info
  companyName: string
  companyAddress: string | null
  companyPhone: string | null
  companyRepresentativeName: string | null
  companyContactEmail: string | null

  // University info
  universityName: string | null
  universityDepartmentName: string | null
  universityAddress: string | null
  universityPhone: string | null

  // Placement info
  offerTitle: string
  internshipType: string
  startDate: Date
  endDate: Date
  workMode: string | null
  durationWeeks: number | null
}

interface ConventionDeStageTemplateProps {
  data: AgreementData
  locale?: string
  verificationCode?: string
  qrCodeDataUrl?: string
}

export function ConventionDeStageTemplate({
  data,
  locale = "en",
  verificationCode,
  qrCodeDataUrl,
}: ConventionDeStageTemplateProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const internshipTypeLabels: Record<string, string> = {
    pfe: locale === "fr" ? "Projet de Fin d'Études" : "Final Year Project",
    immersion: locale === "fr" ? "Stage d'Immersion" : "Immersion Internship",
    summer: locale === "fr" ? "Stage d'Été" : "Summer Internship",
    practical: locale === "fr" ? "Stage Pratique" : "Practical Training",
  }

  const title =
    locale === "fr"
      ? "CONVENTION DE STAGE"
      : locale === "ar"
        ? "اتفاقية التدريب"
        : "INTERNSHIP AGREEMENT"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {data.universityName || "University"}
          </Text>
        </View>

        {/* Three-column grid for parties */}
        <View style={styles.grid}>
          {/* Student Column */}
          <View style={styles.gridColumn}>
            <Text style={styles.gridColumnTitle}>
              {locale === "fr" ? "STAGIAIRE" : "TRAINEE"}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>{locale === "fr" ? "Nom:" : "Name:"}</Text>
              <Text style={styles.value}>{data.studentName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{data.studentEmail}</Text>
            </View>
            {data.studentPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>{locale === "fr" ? "Tél:" : "Phone:"}</Text>
                <Text style={styles.value}>{data.studentPhone}</Text>
              </View>
            )}
            {data.studentNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Matricule:" : "Student ID:"}
                </Text>
                <Text style={styles.value}>{data.studentNumber}</Text>
              </View>
            )}
            {data.studentDepartment && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Département:" : "Department:"}
                </Text>
                <Text style={styles.value}>{data.studentDepartment}</Text>
              </View>
            )}
          </View>

          {/* Company Column */}
          <View style={styles.gridColumn}>
            <Text style={styles.gridColumnTitle}>
              {locale === "fr" ? "ENTREPRISE" : "COMPANY"}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>{locale === "fr" ? "Nom:" : "Name:"}</Text>
              <Text style={styles.value}>{data.companyName}</Text>
            </View>
            {data.companyAddress && (
              <View style={styles.row}>
                <Text style={styles.label}>{locale === "fr" ? "Adresse:" : "Address:"}</Text>
                <Text style={styles.value}>{data.companyAddress}</Text>
              </View>
            )}
            {data.companyPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>{locale === "fr" ? "Tél:" : "Phone:"}</Text>
                <Text style={styles.value}>{data.companyPhone}</Text>
              </View>
            )}
            {data.companyRepresentativeName && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Représentant:" : "Representative:"}
                </Text>
                <Text style={styles.value}>{data.companyRepresentativeName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Internship Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === "fr" ? "DÉTAILS DU STAGE" : "INTERNSHIP DETAILS"}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>{locale === "fr" ? "Sujet:" : "Subject:"}</Text>
            <Text style={styles.value}>{data.offerTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{locale === "fr" ? "Type:" : "Type:"}</Text>
            <Text style={styles.value}>
              {internshipTypeLabels[data.internshipType] || data.internshipType}
            </Text>
          </View>
          {data.workMode && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {locale === "fr" ? "Mode de travail:" : "Work Mode:"}
              </Text>
              <Text style={styles.value}>
                {data.workMode === "remote"
                  ? locale === "fr"
                    ? "À distance"
                    : "Remote"
                  : data.workMode === "hybrid"
                    ? locale === "fr"
                      ? "Hybride"
                      : "Hybrid"
                    : locale === "fr"
                      ? "Sur site"
                      : "On-site"}
              </Text>
            </View>
          )}
          {data.durationWeeks && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {locale === "fr" ? "Durée:" : "Duration:"}
              </Text>
              <Text style={styles.value}>
                {data.durationWeeks} {locale === "fr" ? "semaines" : "weeks"}
              </Text>
            </View>
          )}
        </View>

        {/* Dates Section */}
        <View style={styles.datesSection}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              {locale === "fr" ? "Date de début" : "Start Date"}
            </Text>
            <Text style={styles.dateValue}>{formatDate(data.startDate)}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              {locale === "fr" ? "Date de fin" : "End Date"}
            </Text>
            <Text style={styles.dateValue}>{formatDate(data.endDate)}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              {locale === "fr" ? "LE STAGIAIRE" : "THE TRAINEE"}
            </Text>
            <Text style={styles.signatureLine}>{data.studentName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              {locale === "fr" ? "L'ENTREPRISE" : "THE COMPANY"}
            </Text>
            <Text style={styles.signatureLine}>
              {data.companyRepresentativeName || data.companyName}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              {locale === "fr" ? "L'UNIVERSITÉ" : "THE UNIVERSITY"}
            </Text>
            <Text style={styles.signatureLine}>
              {data.universityName}
            </Text>
          </View>
        </View>

        {/* Verification */}
        {verificationCode && (
          <View style={styles.verificationBar}>
            {qrCodeDataUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not HTML img
              <Image style={styles.qrCode} src={qrCodeDataUrl} />
            )}
            <View>
              <Text style={styles.verificationCode}>{verificationCode}</Text>
              <Text style={styles.verificationText}>
                {locale === "fr"
                  ? "Vérifiez ce document sur internex.dz/verify"
                  : locale === "ar"
                    ? "تحقق من هذه الوثيقة على internex.dz/verify"
                    : "Verify this document at internex.dz/verify"}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {locale === "fr"
              ? `Cette convention est générée automatiquement par le système Internex.`
              : `This agreement is automatically generated by the Internex system.`}
          </Text>
          <Text>
            {locale === "fr"
              ? `Date de génération: ${formatDate(new Date())}`
              : `Generated on: ${formatDate(new Date())}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
