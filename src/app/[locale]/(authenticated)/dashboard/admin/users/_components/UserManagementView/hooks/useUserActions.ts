"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { orpcClient } from "@/server/orpc/client"

export function useUserActions() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
  }

  const createUser = useMutation({
    mutationFn: (data: { email: string; password: string; name: string; role: "student" | "company_admin" | "university_admin" | "super_admin" }) =>
      orpcClient.adminUsers.create(data),
    onSuccess: () => {
      toast.success("User created")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const setRole = useMutation({
    mutationFn: (data: { userId: string; role: "student" | "company_admin" | "university_admin" | "super_admin" }) =>
      orpcClient.adminUsers.setRole(data),
    onSuccess: () => {
      toast.success("Role updated")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const updateUser = useMutation({
    mutationFn: (data: {
      userId: string
      name?: string
      email?: string
      role?: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.update(data),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const banUser = useMutation({
    mutationFn: (data: { userId: string; banReason?: string; banExpiresIn?: number }) =>
      orpcClient.adminUsers.ban(data),
    onSuccess: () => {
      toast.success("User banned")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const unbanUser = useMutation({
    mutationFn: (data: { userId: string }) =>
      orpcClient.adminUsers.unban(data),
    onSuccess: () => {
      toast.success("User unbanned")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const removeUser = useMutation({
    mutationFn: (data: { userId: string }) =>
      orpcClient.adminUsers.remove(data),
    onSuccess: () => {
      toast.success("User removed")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const setPassword = useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      orpcClient.adminUsers.setPassword(data),
    onSuccess: () => {
      toast.success("Password updated")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  return { createUser, setRole, updateUser, banUser, unbanUser, removeUser, setPassword }
}

export type UserActions = ReturnType<typeof useUserActions>
