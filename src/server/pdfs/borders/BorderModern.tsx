import { StyleSheet, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  bar: {
    width: 6,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 28,
    justifyContent: "space-between",
  },
})

export default function BorderModern({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={styles.bar} />
      <View style={styles.content}>{children}</View>
    </View>
  )
}
