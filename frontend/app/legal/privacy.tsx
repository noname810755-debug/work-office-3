import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { AppText } from "@/src/components/app-text";
import { useTheme } from "@/src/theme";

const CONTENT = `Jarvis Office respects your privacy.

1. LOCAL-FIRST DESIGN
Jarvis Office is an offline productivity suite for Docs, Sheets and Slides. All the files, spreadsheets, presentations, workspaces, notes, images and other content you create are stored locally on your device. We never upload your documents, spreadsheet data, presentation content, images or any private information to remote servers.

2. NO ACCOUNTS
Jarvis Office does not require you to sign in or create an account. There is no server-side profile associated with your usage.

3. NO ANALYTICS
Jarvis Office does not include third-party analytics, crash-reporting SDKs, advertising SDKs or tracking pixels that transmit your document content or private data.

4. AI FEATURES
AI features in Jarvis Office run entirely on your device using deterministic on-device logic (summarization, rewriting, formula generation, chart suggestions and other productivity heuristics). No prompt, document, spreadsheet or presentation content is transmitted to any AI service.

5. PERMISSIONS
When you use device features such as file import, image OCR or the camera, Jarvis Office will request the specific permission at the moment you use that feature. Access is used only to fulfil the requested operation and the data does not leave the device.

6. DATA RETENTION
Your files remain on your device until you delete them. Files moved to Trash can be restored or permanently deleted from Trash.

7. CHILDREN'S PRIVACY
Jarvis Office does not collect personal information from anyone, including children under 13.

8. CHANGES
We may update this Privacy Policy from time to time. The latest version will always be visible inside the app under Settings → Privacy Policy.

9. CONTACT
For any privacy questions, please contact jarvisai9077@gmail.com.

Last updated: February 2026.`;

export default function Privacy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.top, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="privacy-back"><Icon name="arrow-left" size={24} color={colors.onSurface} /></TouchableOpacity>
        <AppText variant="h3" style={{ flex: 1 }}>Privacy Policy</AppText>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        <AppText style={{ lineHeight: 22 }}>{CONTENT}</AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
});
