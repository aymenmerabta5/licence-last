import { headers } from "next/headers"
import { getLocale, getTranslations } from "next-intl/server"

export default async function AgreementPreviewPage() {
  await headers()
  const locale = await getLocale()
  const t = await getTranslations("preview.agreement")

  // Fake data for demonstration
  const data = {
    studentName: "Ranim Taieb",
    studentEmail: "ranim.taieb@univ-constantine2.dz",
    studentPhone: "+213 555 894 378",
    studentNumber: "stu55522321",
    studentDepartment: "Computer Science (MI)",
    studentAddress: "123 University Housing, Constantine",
    companyName: "Mirou Technologies",
    companyAddress: "Dalfhanding 4843, Algiers Business District",
    companyPhone: "+213 21 45 67 89",
    companyRepresentativeName: "Ahmed Benali",
    companyContactEmail: "contact@mirou.dz",
    universityName: "University of Constantine 2",
    universityDepartmentName: "Faculty of NTIC",
    universityAddress: "Ali Mendjeli, 25000 Constantine, Algeria",
    universityPhone: "+213 31 77 50 00",
    offerTitle: "Full-Stack React Developer Intern — PFE",
    internshipType: "pfe",
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-10-10"),
    workMode: "hybrid",
    durationWeeks: 16,
  }

  const verificationCode = "INTX-E6M2-D37Y"
  const generatedDate = new Date()

  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const shortDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const internshipTypeLabel: Record<string, string> = {
    pfe: t("internshipTypePfe"),
    immersion: t("internshipTypeImmersion"),
    summer: t("internshipTypeSummer"),
    practical: t("internshipTypePractical"),
  }

  const workModeLabel =
    data.workMode === "remote"
      ? t("workModeRemote")
      : data.workMode === "hybrid"
        ? t("workModeHybrid")
        : data.workMode === "onsite"
          ? t("workModeOnsite")
          : data.workMode ?? "—"

  return (
    <main className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Document Wrapper */}
        <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Header Band */}
          <div className="flex items-center justify-between bg-slate-900 px-8 py-6">
            <div>
              <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-white">
                {t("internshipAgreement")}
              </h1>
              <p className="mt-1 font-serif text-sm text-slate-400">
                {data.universityName} — {data.universityDepartmentName}
              </p>
            </div>
            <div className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                {t("verification")}
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-white">
                {verificationCode}
              </p>
            </div>
          </div>

          {/* Accent Bar */}
          <div className="h-1 bg-amber-500" />

          {/* Body */}
          <div className="p-8">
            {/* Parties */}
            <div className="grid grid-cols-3 gap-4">
              {/* Trainee */}
              <div className="rounded-lg border border-stone-200 bg-stone-50">
                <div className="border-s-4 border-blue-600 p-4">
                  <div className="mb-3 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      {t("trainee")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("name")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("email")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentEmail}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("phone")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentPhone}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("studentId")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentNumber}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("department")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentDepartment}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("address")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.studentAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company */}
              <div className="rounded-lg border border-stone-200 bg-stone-50">
                <div className="border-s-4 border-emerald-600 p-4">
                  <div className="mb-3 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      {t("company")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("name")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.companyName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("address")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.companyAddress}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("phone")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.companyPhone}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("representative")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.companyRepresentativeName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("email")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.companyContactEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* University */}
              <div className="rounded-lg border border-stone-200 bg-stone-50">
                <div className="border-s-4 border-violet-600 p-4">
                  <div className="mb-3 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-violet-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      {t("university")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("name")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.universityName} — {data.universityDepartmentName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("address")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.universityAddress}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-[38%] text-[11px] text-stone-500">
                        {t("phone")}
                      </span>
                      <span className="flex-1 text-[11px] font-semibold text-stone-900">
                        {data.universityPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="min-w-[160px] rounded-lg border border-stone-200 bg-stone-50 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {t("startDate")}
                </p>
                <p className="mt-1 font-serif text-lg font-bold text-stone-900">
                  {formatDate(data.startDate)}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-px w-10 bg-amber-500" />
                <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">
                  {t("weeks", { count: data.durationWeeks })}
                </p>
              </div>
              <div className="min-w-[160px] rounded-lg border border-stone-200 bg-stone-50 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {t("endDate")}
                </p>
                <p className="mt-1 font-serif text-lg font-bold text-stone-900">
                  {formatDate(data.endDate)}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-stone-200 pb-3">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  {t("internshipDetails")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {t("subject")}
                  </p>
                  <p className="mt-0.5 font-serif text-base font-bold text-stone-900">
                    {data.offerTitle}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {t("type")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">
                    {internshipTypeLabel[data.internshipType] ?? data.internshipType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {t("workMode")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">
                    {workModeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {t("duration")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">
                    {t("weeks", { count: data.durationWeeks })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {t("generated")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">
                    {shortDate(generatedDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 grid grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t("theTrainee")}
                </p>
                <div className="mx-auto mt-6 w-4/5 border-t border-stone-400 pt-2">
                  <p className="text-[11px] text-stone-500">
                    {data.studentName}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t("theCompany")}
                </p>
                <div className="mx-auto mt-6 w-4/5 border-t border-stone-400 pt-2">
                  <p className="text-[11px] text-stone-500">
                    {data.companyRepresentativeName}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t("theUniversity")}
                </p>
                <div className="mx-auto mt-6 w-4/5 border-t border-stone-400 pt-2">
                  <p className="text-[11px] text-stone-500">
                    {data.universityName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Band */}
          <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-8 py-4">
            <div className="flex items-center gap-3">
              {/* Fake QR placeholder */}
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white shadow-sm">
                <svg
                  viewBox="0 0 64 64"
                  className="h-8 w-8 text-stone-800"
                  fill="currentColor"
                >
                  <rect x="4" y="4" width="24" height="24" rx="2" />
                  <rect x="36" y="4" width="24" height="24" rx="2" />
                  <rect x="4" y="36" width="24" height="24" rx="2" />
                  <rect x="36" y="36" width="8" height="8" />
                  <rect x="48" y="36" width="8" height="8" />
                  <rect x="36" y="48" width="8" height="8" />
                  <rect x="52" y="52" width="8" height="8" />
                  <rect x="44" y="44" width="4" height="4" />
                  <rect x="52" y="44" width="4" height="4" />
                  <rect x="44" y="52" width="4" height="4" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-sm font-bold tracking-wide text-stone-900">
                  {verificationCode}
                </p>
                <p className="text-[10px] text-stone-500">stag.io/verify</p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-[10px] text-stone-500">
                {t("autoGenerated")}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-stone-700">
                stag.io — {formatDate(generatedDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="mt-4 text-center text-xs text-stone-500">
          {t("previewNote")}
        </p>
      </div>
    </main>
  )
}
