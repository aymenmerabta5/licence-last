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

Font.register({
  family: "DejaVu Serif",
  src: path.join(fontsDir, "DejaVuSerif.ttf"),
})

Font.register({
  family: "DejaVu Serif Bold",
  src: path.join(fontsDir, "DejaVuSerif-Bold.ttf"),
})

const COLORS = {
  headerBg: "#0f172a",
  headerText: "#ffffff",
  accent: "#d97706",
  accentLight: "#f59e0b",
  cardBg: "#fafaf9",
  cardBorder: "#e7e5e4",
  textPrimary: "#1c1917",
  textSecondary: "#57534e",
  textMuted: "#78716c",
  white: "#ffffff",
  divider: "#e7e5e4",
  labelBg: "#f5f5f4",
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu Sans",
    fontSize: 9,
    lineHeight: 1.4,
    backgroundColor: COLORS.white,
    padding: 0,
    color: COLORS.textPrimary,
  },
  headerBand: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 36,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontFamily: "DejaVu Serif Bold",
    fontSize: 22,
    color: COLORS.headerText,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontFamily: "DejaVu Serif",
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
  },
  headerBadge: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  headerBadgeLabel: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerBadgeValue: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    color: COLORS.headerText,
    marginTop: 2,
  },
  accentBar: {
    height: 4,
    backgroundColor: COLORS.accent,
  },
  body: {
    paddingHorizontal: 36,
    paddingVertical: 8,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },
  partyCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 6,
    padding: 8,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  partyCardStudent: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  partyCardCompany: {
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  partyCardUniversity: {
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
  },
  partyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  partyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  partyTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  rowTight: {
    flexDirection: "row",
    marginBottom: 1,
    alignItems: "flex-start",
  },
  label: {
    width: "38%",
    color: COLORS.textMuted,
    fontSize: 8,
  },
  value: {
    flex: 1,
    fontFamily: "DejaVu Sans Bold",
    fontSize: 8,
    color: COLORS.textPrimary,
  },
  datesSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 28,
  },
  dateCard: {
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minWidth: 140,
  },
  dateConnector: {
    alignItems: "center",
    justifyContent: "center",
  },
  dateConnectorLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.accent,
    marginBottom: 4,
  },
  dateConnectorLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateValue: {
    fontFamily: "DejaVu Serif Bold",
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  detailsSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 10,
    marginBottom: 10,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailsHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  detailsTitle: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.textPrimary,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailsCol: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 3,
  },
  detailsColFull: {
    width: "100%",
    marginBottom: 3,
  },
  detailsLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailsValue: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 9,
    color: COLORS.textPrimary,
  },
  detailsValueLarge: {
    fontFamily: "DejaVu Serif Bold",
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  signaturesSection: {
    marginTop: 4,
    marginBottom: 6,
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  sigCard: {
    flex: 1,
    alignItems: "center",
    paddingTop: 4,
  },
  sigLabel: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  sigLineBox: {
    width: "100%",
    alignItems: "center",
  },
  sigLine: {
    width: "85%",
    height: 1,
    backgroundColor: COLORS.textMuted,
    marginBottom: 5,
  },
  sigName: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  footerBand: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingHorizontal: 36,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qrCode: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  footerCodeBox: {
    flexDirection: "column",
  },
  verificationCode: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 10,
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },
  verificationUrl: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  footerBrand: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 7,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  companyLogoUrl?: string

  // University info
  universityName: string | null
  universityDepartmentName: string | null
  universityAddress: string | null
  universityPhone: string | null
  universityLogoUrl?: string

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
  verificationUrl?: string
}

export function ConventionDeStageTemplate({
  data,
  locale = "en",
  verificationCode,
  qrCodeDataUrl,
  verificationUrl,
}: ConventionDeStageTemplateProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const shortDate = (date: Date) => {
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
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
      ? "Convention de Stage"
      : locale === "ar"
        ? "اتفاقية التدريب"
        : "Internship Agreement"

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Clean Header: Logo | Title | Logo */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingHorizontal: 36,
            paddingTop: 10,
            paddingBottom: 4,
            borderBottomWidth: 2,
            borderBottomColor: "#d97706",
          }}
        >
          {/* Company Logo */}
          {data.companyLogoUrl ? (
            <Image
              src={data.companyLogoUrl}
              style={{ width: 36, height: 36, objectFit: "contain", marginTop: 2 }}
            />
          ) : (
            <View style={{ width: 36 }} />
          )}

          {/* Center Title */}
          <View style={{ alignItems: "center", flex: 1, paddingHorizontal: 8 }}>
            <Text
              style={{
                fontFamily: "DejaVu Serif",
                fontSize: 9,
                color: "#57534e",
                letterSpacing: 0.5,
              }}
            >
              stag.io
            </Text>
            <Text
              style={{
                fontFamily: "DejaVu Serif Bold",
                fontSize: 16,
                color: "#0f172a",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {title}
            </Text>
          </View>

          {/* University Logo */}
          {data.universityLogoUrl ? (
            <Image
              src={data.universityLogoUrl}
              style={{ width: 36, height: 36, objectFit: "contain", marginTop: 2 }}
            />
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Parties */}
          <View style={styles.partiesRow}>
            {/* Student */}
            <View style={[styles.partyCard, styles.partyCardStudent]}>
              <View style={styles.partyHeader}>
                <View
                  style={[styles.partyDot, { backgroundColor: "#2563eb" }]}
                />
                <Text style={styles.partyTitle}>
                  {locale === "fr" ? "Stagiaire" : "Trainee"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Nom" : "Name"}
                </Text>
                <Text style={styles.value}>{data.studentName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{data.studentEmail}</Text>
              </View>
              {data.studentPhone ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Téléphone" : "Phone"}
                  </Text>
                  <Text style={styles.value}>{data.studentPhone}</Text>
                </View>
              ) : null}
              {data.studentNumber ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Matricule" : "Student ID"}
                  </Text>
                  <Text style={styles.value}>{data.studentNumber}</Text>
                </View>
              ) : null}
              {data.studentDepartment ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Département" : "Department"}
                  </Text>
                  <Text style={styles.value}>{data.studentDepartment}</Text>
                </View>
              ) : null}
              {data.studentAddress ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Adresse" : "Address"}
                  </Text>
                  <Text style={styles.value}>{data.studentAddress}</Text>
                </View>
              ) : null}
            </View>

            {/* Company */}
            <View style={[styles.partyCard, styles.partyCardCompany]}>
              <View style={styles.partyHeader}>
                <View
                  style={[styles.partyDot, { backgroundColor: "#059669" }]}
                />
                <Text style={styles.partyTitle}>
                  {locale === "fr" ? "Entreprise" : "Company"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>
                  {locale === "fr" ? "Nom" : "Name"}
                </Text>
                <Text style={styles.value}>{data.companyName}</Text>
              </View>
              {data.companyAddress ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Adresse" : "Address"}
                  </Text>
                  <Text style={styles.value}>{data.companyAddress}</Text>
                </View>
              ) : null}
              {data.companyPhone ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Téléphone" : "Phone"}
                  </Text>
                  <Text style={styles.value}>{data.companyPhone}</Text>
                </View>
              ) : null}
              {data.companyRepresentativeName ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Représentant" : "Representative"}
                  </Text>
                  <Text style={styles.value}>
                    {data.companyRepresentativeName}
                  </Text>
                </View>
              ) : null}
              {data.companyContactEmail ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{data.companyContactEmail}</Text>
                </View>
              ) : null}
            </View>

            {/* University */}
            <View style={[styles.partyCard, styles.partyCardUniversity]}>
              <View style={styles.partyHeader}>
                <View
                  style={[styles.partyDot, { backgroundColor: "#7c3aed" }]}
                />
                <Text style={styles.partyTitle}>
                  {locale === "fr" ? "Université" : "University"}
                </Text>
              </View>
              {(data.universityName || data.universityDepartmentName) ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Nom" : "Name"}
                  </Text>
                  <Text style={styles.value}>
                    {data.universityDepartmentName
                      ? `${data.universityName} — ${data.universityDepartmentName}`
                      : (data.universityName ?? "")}
                  </Text>
                </View>
              ) : null}
              {data.universityAddress ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Adresse" : "Address"}
                  </Text>
                  <Text style={styles.value}>{data.universityAddress}</Text>
                </View>
              ) : null}
              {data.universityPhone ? (
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {locale === "fr" ? "Téléphone" : "Phone"}
                  </Text>
                  <Text style={styles.value}>{data.universityPhone}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Dates */}
          <View style={styles.datesSection}>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>
                {locale === "fr" ? "Date de début" : "Start Date"}
              </Text>
              <Text style={styles.dateValue}>{formatDate(data.startDate)}</Text>
            </View>
            <View style={styles.dateConnector}>
              <View style={styles.dateConnectorLine} />
              <Text style={styles.dateConnectorLabel}>
                {data.durationWeeks
                  ? `${data.durationWeeks} ${locale === "fr" ? "semaines" : "weeks"}`
                  : locale === "fr"
                    ? "Durée"
                    : "Duration"}
              </Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>
                {locale === "fr" ? "Date de fin" : "End Date"}
              </Text>
              <Text style={styles.dateValue}>{formatDate(data.endDate)}</Text>
            </View>
          </View>

          {/* Internship Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsHeaderDot} />
              <Text style={styles.detailsTitle}>
                {locale === "fr"
                  ? "Détails du Stage"
                  : "Internship Details"}
              </Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailsColFull}>
                <Text style={styles.detailsLabel}>
                  {locale === "fr" ? "Sujet" : "Subject"}
                </Text>
                <Text style={styles.detailsValueLarge}>{data.offerTitle}</Text>
              </View>
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>
                  {locale === "fr" ? "Type" : "Type"}
                </Text>
                <Text style={styles.detailsValue}>
                  {internshipTypeLabels[data.internshipType] ||
                    data.internshipType}
                </Text>
              </View>
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>
                  {locale === "fr" ? "Mode de travail" : "Work Mode"}
                </Text>
                <Text style={styles.detailsValue}>
                  {workModeLabel || "—"}
                </Text>
              </View>
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>
                  {locale === "fr" ? "Durée" : "Duration"}
                </Text>
                <Text style={styles.detailsValue}>
                  {data.durationWeeks
                    ? `${data.durationWeeks} ${locale === "fr" ? "semaines" : "weeks"}`
                    : "—"}
                </Text>
              </View>
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>
                  {locale === "fr" ? "Généré le" : "Generated"}
                </Text>
                <Text style={styles.detailsValue}>
                  {shortDate(new Date())}
                </Text>
              </View>
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.signaturesSection}>
            <View style={styles.signaturesRow}>
              <View style={styles.sigCard}>
                <Text style={styles.sigLabel}>
                  {locale === "fr" ? "Le Stagiaire" : "The Trainee"}
                </Text>
                <View style={styles.sigLineBox}>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>{data.studentName}</Text>
                </View>
              </View>
              <View style={styles.sigCard}>
                <Text style={styles.sigLabel}>
                  {locale === "fr" ? "L'Entreprise" : "The Company"}
                </Text>
                <View style={styles.sigLineBox}>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>
                    {data.companyRepresentativeName || data.companyName}
                  </Text>
                </View>
              </View>
              <View style={styles.sigCard}>
                <Text style={styles.sigLabel}>
                  {locale === "fr" ? "L'Université" : "The University"}
                </Text>
                <View style={styles.sigLineBox}>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>{data.universityName}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Band */}
        <View style={styles.footerBand}>
          <View style={styles.footerLeft}>
            {qrCodeDataUrl ? (
              <Image style={styles.qrCode} src={qrCodeDataUrl} />
            ) : null}
            <View style={styles.footerCodeBox}>
              <Text style={styles.verificationCode}>
                {verificationCode ?? "—"}
              </Text>
              <Text style={styles.verificationUrl}>{verificationUrl ?? "stag.io/verify"}</Text>
            </View>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>
              {locale === "fr"
                ? "Document généré automatiquement par le système Stag"
                : "Automatically generated by the Stag system"}
            </Text>
            <Text style={styles.footerBrand}>
              stag.io — {formatDate(new Date())}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
