import { StyleSheet, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#c9a227",
    padding: 20,
    position: "relative",
    justifyContent: "space-between",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#c9a227",
  },
  tl: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  tr: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  br: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
})

export default function BorderOrnate({ children }: { children: ReactNode }) {
  return (
    <View style={styles.frame}>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
      {children}
    </View>
  )
}
