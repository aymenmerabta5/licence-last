import { StyleSheet, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#2d2d2d",
    padding: 4,
  },
  inner: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    padding: 28,
    justifyContent: "space-between",
  },
})

export default function BorderFormal({ children }: { children: ReactNode }) {
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  )
}
