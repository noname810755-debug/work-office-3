import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { AppText } from "@/src/components/app-text";
import { Card } from "@/src/components/card";
import { Button } from "@/src/components/button";
import { useToast } from "@/src/components/toast";
import { useTheme } from "@/src/theme";
import { getFile, getHistory, saveFile, FileMeta } from "@/src/storage/db";

export default function History() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToast();
  const [items, setItems] = useState<{ ts: number; content: any }[]>([]);
  const [meta, setMeta] = useState<FileMeta | null>(null);

  useEffect(() => { (async () => { setItems(await getHistory(String(id))); setMeta(await getFile(String(id))); })(); }, [id]);

  const restore = async (content: any) => {
    if (!meta) return;
    await saveFile({ ...meta, updatedAt: Date.now() }, content);
    toast.show("Version restored", "success");
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.top, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="hist-back"><Icon name="arrow-left" size={24} color={colors.onSurface} /></TouchableOpacity>
        <AppText variant="h3" style={{ flex: 1 }}>Version history</AppText>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}>
        {items.length === 0 ? <Card><AppText style={{ textAlign: "center" }}>No history yet. Edits create automatic snapshots.</AppText></Card> :
          items.map((it, i) => (
            <Card key={it.ts + "-" + i}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="title">{new Date(it.ts).toLocaleString()}</AppText>
                  <AppText variant="caption">Snapshot #{items.length - i}</AppText>
                </View>
                <Button title="Restore" size="sm" onPress={() => restore(it.content)} testID={`restore-${i}`} />
              </View>
            </Card>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
});
