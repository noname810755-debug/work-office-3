import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { AppText } from "@/src/components/app-text";
import { BrandMark } from "@/src/components/brand-mark";
import { Card } from "@/src/components/card";
import { useTheme } from "@/src/theme";

const SUPPORT_EMAIL = "jarvisai9077@gmail.com";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.top, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="settings-back" accessibilityLabel="Go back" style={styles.backButton}><Icon name="arrow-left" size={24} color={colors.onSurface} /></TouchableOpacity>
        <View style={styles.titleRow}><BrandMark size={30} /><AppText variant="h3" style={{ flex: 1 }}>Settings</AppText></View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" }}>
              <Icon name="shield-check" size={22} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="title">Fully offline</AppText>
              <AppText variant="caption">All your data stays on this device. No cloud, no accounts.</AppText>
            </View>
          </View>
        </Card>

        <Row icon="palette-outline" title="Theme" caption="Follows your device (light / dark)" />
        <Row icon="content-save-outline" title="Autosave" caption="Every change is saved automatically" />
        <Row icon="file-document-outline" title="Templates" onPress={() => router.push("/templates" as any)} testID="row-templates" />
        <Row icon="folder-multiple-outline" title="Workspaces" onPress={() => router.push("/workspaces" as any)} testID="row-workspaces" />
        <Row icon="bell-outline" title="Notifications" caption="Local-only app updates" onPress={() => router.push("/notifications" as any)} testID="row-notifications" />
        <Row icon="magnify" title="Global search" onPress={() => router.push("/search" as any)} testID="row-search" />
        <Row icon="trash-can-outline" title="Trash & recovery" onPress={() => router.back()} testID="row-trash" caption="Manage from Home → Trash filter" />

        <AppText variant="label" style={{ marginTop: 12 }}>Legal</AppText>
        <Row icon="shield-lock-outline" title="Privacy Policy" onPress={() => router.push("/legal/privacy" as any)} testID="row-privacy" />
        <Row icon="file-document-outline" title="Terms & Conditions" onPress={() => router.push("/legal/terms" as any)} testID="row-terms" />
        <Row icon="email-outline" title="Support" caption={SUPPORT_EMAIL} onPress={() => { void openSupport(); }} testID="row-support" />

        <View style={{ alignItems: "center", padding: 24 }}>
          <AppText variant="caption">Jarvis Office · v1.0</AppText>
          <AppText variant="caption">Jarvis Office · Docs, Sheets, Slides</AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ icon, title, caption, onPress, testID }: { icon: string; title: string; caption?: string; onPress?: () => void; testID?: string }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={onPress ? 0.8 : 1} disabled={!onPress} style={{ minHeight: 44 }}>
      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Icon name={icon as any} size={22} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <AppText variant="title">{title}</AppText>
            {caption ? <AppText variant="caption">{caption}</AppText> : null}
          </View>
          {onPress ? <Icon name="chevron-right" size={20} color={colors.muted} /> : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

async function openSupport() {
  try {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Jarvis%20Office%20support`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  } catch {
    // Mail apps are optional; keep Settings stable when none is installed.
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  backButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
});
