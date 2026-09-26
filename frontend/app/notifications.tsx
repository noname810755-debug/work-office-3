import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { AppText } from "@/src/components/app-text";
import { BrandMark } from "@/src/components/brand-mark";
import { Card } from "@/src/components/card";
import { useToast } from "@/src/components/toast";
import { useTheme, radius, spacing } from "@/src/theme";
import { listNotifications, LocalNotification, markAllNotificationsRead, markNotificationRead } from "@/src/notifications/local";

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToast();
  const [items, setItems] = useState<LocalNotification[]>([]);

  const load = useCallback(async () => {
    try {
      setItems(await listNotifications());
    } catch {
      setItems([]);
      toast.show("Notifications are temporarily unavailable", "error");
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const markAll = async () => {
    const ok = await markAllNotificationsRead();
    if (!ok) {
      toast.show("Could not update notifications", "error");
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  const openItem = async (item: LocalNotification) => {
    if (!item.read) {
      const ok = await markNotificationRead(item.id);
      if (!ok) {
        toast.show("Could not update notification", "error");
        return;
      }
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.top, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="notifications-back" accessibilityLabel="Go back" style={styles.touchTarget}>
          <Icon name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <BrandMark size={30} />
          <AppText variant="h3">Notifications</AppText>
        </View>
        <TouchableOpacity onPress={markAll} testID="notifications-mark-all" accessibilityLabel="Mark all notifications as read" style={styles.touchTarget}>
          <Icon name="email-open-outline" size={22} color={colors.brandPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.localBanner, { backgroundColor: colors.brandTertiary }]}>
          <Icon name="wifi-off" size={18} color={colors.brandPrimary} />
          <AppText variant="caption" color={colors.onBrandTertiary} style={styles.bannerText}>Local notifications are stored only on this device.</AppText>
        </View>
        {items.length === 0 ? (
          <Card><AppText style={styles.empty}>You are all caught up.</AppText></Card>
        ) : items.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => { void openItem(item); }} activeOpacity={0.82} testID={`notification-${item.id}`}>
            <Card style={[styles.notification, { borderColor: item.read ? colors.border : colors.brandPrimary }]}>
              <View style={[styles.dot, { backgroundColor: item.read ? colors.borderStrong : colors.brandPrimary }]} />
              <View style={styles.copy}>
                <AppText variant="title">{item.title}</AppText>
                <AppText style={styles.body}>{item.body}</AppText>
                <AppText variant="caption">{new Date(item.createdAt).toLocaleString()}</AppText>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  touchTarget: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, gap: spacing.md },
  localBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.md },
  bannerText: { flex: 1 },
  notification: { flexDirection: "row", gap: 10, padding: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  copy: { flex: 1, gap: 4 },
  body: { lineHeight: 20 },
  empty: { textAlign: "center" },
});
