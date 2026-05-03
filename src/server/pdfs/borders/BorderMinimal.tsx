import { StyleSheet, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 36,
    borderTopWidth: 4,
    borderTopColor: "#1a1a2e",
    justifyContent: "space-between",
  },
})

export default function BorderMinimal({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>
}
