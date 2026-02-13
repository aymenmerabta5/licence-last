import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"

Font.register({
  family: "DejaVu Sans",
  src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/dejavu-sans@1.0.4/DejaVuSans.ttf",
})

Font.register({
  family: "DejaVu Sans Bold",
  src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/dejavu-sans@1.0.4/DejaVuSans-Bold.ttf",
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu Sans",
    fontSize: 12,
    padding: 56,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 28,
    textAlign: "center",
  },
  title: {
    fontFamily: "DejaVu Sans Bold",
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 11,
    color: "#666666",
  },
  body: {
    marginTop: 18,
    marginBottom: 26,
  },
  strong: {
    fontFamily: "DejaVu Sans Bold",
  },
  block: {
    marginBottom: 12,
  },
  footer: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signature: {
    width: "45%",
    textAlign: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 6,
    fontSize: 10,
    color: "#666666",
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
}

export function InternshipCertificateTemplate({
  data,
  locale = "en",
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{data.universityName || "University"}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.block}>
            {locale === "fr"
              ? "Nous certifions par la presente que"
              : locale === "ar"
                ? "نشهد بموجب هذا أن"
                : "This is to certify that"}
          </Text>

          <Text style={styles.block}>
            <Text style={styles.strong}>{data.studentName}</Text>
            {" "}
            {locale === "fr"
              ? "a effectue un stage au sein de"
              : locale === "ar"
                ? "أتم فترة تدريب لدى"
                : "has successfully completed an internship at"}{" "}
            <Text style={styles.strong}>{data.companyName}</Text>.
          </Text>

          <Text style={styles.block}>
            {locale === "fr"
              ? "Sujet / Intitule:"
              : locale === "ar"
                ? "موضوع التدريب:"
                : "Title:"}{" "}
            <Text style={styles.strong}>{data.offerTitle}</Text>
          </Text>

          <Text style={styles.block}>
            {locale === "fr"
              ? "Periode:"
              : locale === "ar"
                ? "الفترة:"
                : "Period:"}{" "}
            <Text style={styles.strong}>{formatDate(data.startDate)}</Text>
            {" "}
            {locale === "fr" ? "au" : locale === "ar" ? "إلى" : "to"}{" "}
            <Text style={styles.strong}>{formatDate(data.endDate)}</Text>
          </Text>

          <Text style={styles.block}>
            {locale === "fr"
              ? `Email stagiaire: ${data.studentEmail}`
              : locale === "ar"
                ? `البريد الإلكتروني: ${data.studentEmail}`
                : `Student email: ${data.studentEmail}`}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.signatureLine}>
              {locale === "fr"
                ? "Signature (Universite)"
                : locale === "ar"
                  ? "توقيع (الجامعة)"
                  : "Signature (University)"}
            </Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.signatureLine}>
              {locale === "fr"
                ? "Signature (Entreprise)"
                : locale === "ar"
                  ? "توقيع (المؤسسة)"
                  : "Signature (Company)"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
