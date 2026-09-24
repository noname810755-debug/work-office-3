import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

type Toast = { id: number; message: string; kind: "success" | "error" | "info" };
type Ctx = { show: (m: string, kind?: Toast["kind"]) => void };
const ToastCtx = createContext<Ctx>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const show = useCallback((message: string, kind: Toast["kind"] = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <View pointerEvents="none" style={[styles.container, { top: insets.top + 16 }]}>
        {toasts.map((t) => {
          const bg = t.kind === "success" ? colors.success : t.kind === "error" ? colors.error : colors.surfaceInverse;
          const fg = t.kind === "success" ? colors.onSuccess : t.kind === "error" ? colors.onError : colors.onSurfaceInverse;
          return (
            <View key={t.id} style={[styles.toast, { backgroundColor: bg }]} testID={`toast-${t.kind}`}>
              <Text style={[styles.text, { color: fg }]}>{t.message}</Text>
            </View>
          );
        })}
      </View>
    </ToastCtx.Provider>
  );
}

export function useToast() { return useContext(ToastCtx); }

const styles = StyleSheet.create({
  container: { position: "absolute", left: 16, right: 16, gap: 8, alignItems: "center", zIndex: 9999 },
  toast: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, maxWidth: 480, elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12 },
  text: { fontSize: 14, fontWeight: "500" },
});
