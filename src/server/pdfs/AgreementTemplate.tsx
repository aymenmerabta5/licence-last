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
    fontSize: 9,
    padding: 28,
    lineHeight: 1.35,
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 10,
    color: "#555555",
    marginTop: 3,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  partyColumn: {
    width: "31%",
    borderTopWidth: 2,
    borderTopColor: "#1a1a2e",
    paddingTop: 6,
  },
  partyTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#1a1a2e",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: "40%",
    color: "#555555",
    fontSize: 8,
  },
  value: {
    width: "60%",
    fontFamily: "DejaVu Sans Bold",
    fontSize: 8,
  },
  section: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#1a1a2e",
  },
  datesBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#f7f7f9",
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  dateBlock: {
    alignItems: "center",
    marginHorizontal: 24,
  },
  dateLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    color: "#1a1a2e",
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sigBox: {
    width: "30%",
    alignItems: "center",
  },
  sigLabel: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    marginBottom: 28,
    textTransform: "uppercase",
    color: "#333333",
  },
  sigLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 3,
    fontSize: 8,
    color: "#555555",
    textAlign: "center",
  },
  verificationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 6,
    gap: 8,
  },
  qrCode: {
    width: 40,
    height: 40,
  },
  verificationCode: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    color: "#333333",
  },
  verificationUrl: {
    fontSize: 7,
    color: "#888888",
    marginTop: 1,
  },
  footer: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 7,
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

  const workModeLabel =
    data.workMode === "remote"
      ? locale === "fr"
        ? "À distance"
        : "Remote"
      : data.workMode === "hybrid"
        ? locale === "fr"
          ? "Hybride"
          : "Hybrid"
        : data.workMode === "onsite"
          ? locale === "fr"
            ? "Sur site"
            : "On-site"
          : (data.workMode ?? "")

  const title =
    locale === "fr"
      ? "CONVENTION DE STAGE"
      : locale === "ar"
        ? "اتفاقية التدريب"
        : "INTERNSHIP AGREEMENT"

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {data.universityName || "University"}
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          {/* Student */}
          <View style={styles.partyColumn}>
            <Text style={styles.partyTitle}>
              {locale === "fr" ? "Stagiaire" : "Trainee"}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>
                {locale === "fr" ? "Nom :" : "Name :"}
              </Text>
              <Text style={styles.value}>{data.studentName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{data.studentEmail}</Text>
            </View>
            {data.studentPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Tél :" : "Phone :"}
                </Text>
                <Text style={styles.value}>{data.studentPhone}</Text>
              </View>
            )}
            {data.studentNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Matricule :" : "Student ID :"}
                </Text>
                <Text style={styles.value}>{data.studentNumber}</Text>
              </View>
            )}
            {data.studentDepartment && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Dépt :" : "Dept :"}
                </Text>
                <Text style={styles.value}>{data.studentDepartment}</Text>
              </View>
            )}
            {data.studentAddress && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Adr :" : "Addr :"}
                </Text>
                <Text style={styles.value}>{data.studentAddress}</Text>
              </View>
            )}
          </View>

          {/* Company */}
          <View style={styles.partyColumn}>
            <Text style={styles.partyTitle}>
              {locale === "fr" ? "Entreprise" : "Company"}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>
                {locale === "fr" ? "Nom :" : "Name :"}
              </Text>
              <Text style={styles.value}>{data.companyName}</Text>
            </View>
            {data.companyAddress && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Adr :" : "Addr :"}
                </Text>
                <Text style={styles.value}>{data.companyAddress}</Text>
              </View>
            )}
            {data.companyPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Tél :" : "Phone :"}
                </Text>
                <Text style={styles.value}>{data.companyPhone}</Text>
              </View>
            )}
            {data.companyRepresentativeName && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Repr :" : "Rep :"}
                </Text>
                <Text style={styles.value}>
                  {data.companyRepresentativeName}
                </Text>
              </View>
            )}
            {data.companyContactEmail && (
              <View style={styles.row}>
                <Text style={styles.label}>Email :</Text>
                <Text style={styles.value}>{data.companyContactEmail}</Text>
              </View>
            )}
          </View>

          {/* University */}
          <View style={styles.partyColumn}>
            <Text style={styles.partyTitle}>
              {locale === "fr" ? "Université" : "University"}
            </Text>
            {(data.universityName || data.universityDepartmentName) && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Nom :" : "Name :"}
                </Text>
                <Text style={styles.value}>
                  {data.universityDepartmentName
                    ? `${data.universityName} — ${data.universityDepartmentName}`
                    : (data.universityName ?? "")}
                </Text>
              </View>
            )}
            {data.universityAddress && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Adr :" : "Addr :"}
                </Text>
                <Text style={styles.value}>{data.universityAddress}</Text>
              </View>
            )}
            {data.universityPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Tél :" : "Phone :"}
                </Text>
                <Text style={styles.value}>{data.universityPhone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dates bar */}
        <View style={styles.datesBar}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>
              {locale === "fr" ? "Date de début" : "Start Date"}
            </Text>
            <Text style={styles.dateValue}>{formatDate(data.startDate)}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>
              {locale === "fr" ? "Date de fin" : "End Date"}
            </Text>
            <Text style={styles.dateValue}>{formatDate(data.endDate)}</Text>
          </View>
        </View>

        {/* Internship Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === "fr" ? "Détails du stage" : "Internship details"}
          </Text>
          <View style={[styles.row, { marginBottom: 4 }]}>
            <Text style={[styles.label, { width: "15%" }]}>
              {locale === "fr" ? "Sujet :" : "Subject :"}
            </Text>
            <Text style={[styles.value, { width: "85%" }]}>
              {data.offerTitle}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { width: "15%" }]}>
              {locale === "fr" ? "Type :" : "Type :"}
            </Text>
            <Text style={[styles.value, { width: "30%" }]}>
              {internshipTypeLabels[data.internshipType] || data.internshipType}
            </Text>
            <Text style={[styles.label, { width: "15%", paddingLeft: 16 }]}>
              {locale === "fr" ? "Durée :" : "Duration :"}
            </Text>
            <Text style={[styles.value, { width: "40%" }]}>
              {data.durationWeeks
                ? `${data.durationWeeks} ${locale === "fr" ? "semaines" : "weeks"}`
                : "—"}
            </Text>
          </View>
          {data.workMode && (
            <View style={styles.row}>
              <Text style={[styles.label, { width: "15%" }]}>
                {locale === "fr" ? "Mode :" : "Mode :"}
              </Text>
              <Text style={[styles.value, { width: "30%" }]}>
                {workModeLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Signatures */}
        <View style={styles.signaturesRow}>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>
              {locale === "fr" ? "Le stagiaire" : "The trainee"}
            </Text>
            <Text style={styles.sigLine}>{data.studentName}</Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>
              {locale === "fr" ? "L'entreprise" : "The company"}
            </Text>
            <Text style={styles.sigLine}>
              {data.companyRepresentativeName || data.companyName}
            </Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>
              {locale === "fr" ? "L'université" : "The university"}
            </Text>
            <Text style={styles.sigLine}>{data.universityName}</Text>
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
              <Text style={styles.verificationUrl}>stag.io/verify</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {locale === "fr"
              ? `Cette convention est générée automatiquement par le système Stag — ${formatDate(new Date())}`
              : `This agreement is automatically generated by the Stag system — ${formatDate(new Date())}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
