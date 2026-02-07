"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Briefcase, Calendar, MapPin, Plus, Sparkles, X } from "lucide-react"
import { Link } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function CreateOfferPage() {
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      e.preventDefault()
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()])
      }
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    // Handle success (e.g., toast, redirect)
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/company"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-heading font-serif">
              New Internship Offer
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Find the perfect talent for your team.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/80">
              <CardHeader className="space-y-1 pb-6 border-b border-border/50">
                <CardTitle className="text-xl font-medium">Offer Details</CardTitle>
                <CardDescription>
                  Provide comprehensive information to attract the best candidates.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground/80">
                      Offer Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Junior Frontend Developer"
                      className="h-12 bg-background/50 border-input focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* Type & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-foreground/80">
                        Internship Type
                      </Label>
                      <Select defaultValue="internship">
                        <SelectTrigger className="h-12 bg-background/50 text-left font-medium">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship (PFE)</SelectItem>
                          <SelectItem value="summer">Summer Internship</SelectItem>
                          <SelectItem value="remote">Remote Internship</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-foreground/80">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="e.g. Algiers, Oran, Remote"
                          className="pl-10 h-12 bg-background/50 font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <Label htmlFor="skills" className="text-foreground/80">
                      Required Skills (Press Enter to add)
                    </Label>
                    <div className="relative">
                      <Input
                        id="skills"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="e.g. React, Python, Java"
                        className="h-12 bg-background/50 font-medium"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-10 w-10 text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
                            setSkills([...skills, currentSkill.trim()])
                            setCurrentSkill("")
                          }
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {skills.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">
                          No skills added yet.
                        </span>
                      )}
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="pl-3 pr-1 py-1 text-sm bg-secondary/10 hover:bg-secondary/20 transition-colors border-0"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Start Date (Could be expanded) */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-foreground/80">
                      Duration
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="duration"
                        placeholder="e.g. 6 months"
                        className="pl-10 h-12 bg-background/50 font-medium"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground/80">
                      Description & Responsibilities
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detail the role, responsibilities, and what you're looking for..."
                      className="min-h-[200px] bg-background/50 resize-y font-medium leading-relaxed"
                      required
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-8 flex-1 border-border/50 hover:bg-secondary/5"
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 flex-[2] bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                      disabled={isLoading}
                    >
                      {isLoading ? "Publishing..." : "Publish Offer"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Tips Card */}
            <Card className="bg-secondary/5 border-none shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Listing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Be specific about skills.</strong>{" "}
                  Students search by tags like "React" or "Python".
                </p>
                <p>
                  <strong className="text-foreground">Clarify the goal.</strong>{" "}
                  Mention if this is a PFE (End of Studies Project) or a summer internship.
                </p>
                <p>
                  <strong className="text-foreground">Location matters.</strong>{" "}
                  Specify if it's onsite, remote, or hybrid.
                </p>
              </CardContent>
            </Card>

            {/* Preview Card (Optional enhancement) */}
            <div className="rounded-xl border border-dashed border-border p-6 flex flex-col items-center text-center justify-center text-muted-foreground bg-background/50">
              <span className="text-sm">Preview of your offer card will appear here</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
