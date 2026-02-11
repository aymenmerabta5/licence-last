"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { uploadProfileImage, deleteProfileImage } from "@/server/actions/profile-image"
import Image from "next/image"

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  userName: string
  onImageChange?: (url: string | null) => void
}

export function ProfileImageUpload({
  currentImageUrl,
  userName,
  onImageChange,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || "?"
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please select a JPEG, PNG, or WebP image.",
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 2MB.",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)
    setIsDialogOpen(true)
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const result = await uploadProfileImage(formData)

      if (result.success) {
        toast.success("Profile photo updated", {
          description: "Your profile picture has been updated successfully.",
        })
        onImageChange?.(result.url)
        setIsDialogOpen(false)
        setPreviewUrl(null)
        setSelectedFile(null)
      } else {
        toast.error("Upload failed", {
          description: result.error,
        })
      }
    } catch {
      toast.error("Upload failed", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProfileImage()

      if (result.success) {
        toast.success("Profile photo removed", {
          description: "Your profile picture has been removed.",
        })
        onImageChange?.(null)
      } else {
        toast.error("Delete failed", {
          description: result.error,
        })
      }
    } catch {
      toast.error("Delete failed", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* Avatar Display */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger render={<button 
            className="relative group cursor-pointer"
            onClick={!currentImageUrl ? triggerFileInput : undefined}
          >
            <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-serif font-bold transition-all group-hover:bg-primary/20 overflow-hidden">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl ?? ""}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(userName)
              )}
            </div>
            <div className="absolute -bottom-2 -end-2 h-10 w-10 rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform dark:bg-card">
              <Camera className="h-4 w-4" />
            </div>
          </button>} />

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Preview Profile Photo</DialogTitle>
            <DialogDescription>
              Review your new profile picture before uploading.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            <div className="h-40 w-40 rounded-3xl overflow-hidden border-2 border-border">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-5xl font-serif font-bold">
                  {getInitials(userName)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <div className="space-y-2">
        <h4 className="font-bold text-sm">Profile Picture</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          We recommend an image of at least 400x400. GIFs work too! Maximum file size is 2MB.
        </p>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9 px-4 text-[11px] font-bold uppercase tracking-widest gap-2"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            <Camera className="h-3 w-3" />
            Change Photo
          </Button>
          
          {currentImageUrl && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg h-9 px-4 text-[11px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Remove
                </Button>}>
                
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif">Remove Profile Photo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your profile picture will be removed and replaced with your initials.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove Photo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}
