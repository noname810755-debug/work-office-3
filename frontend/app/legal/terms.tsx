import { useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { AppText } from "@/src/components/app-text";
import { useTheme } from "@/src/theme";

const CONTENT = `Welcome to Office work. By using this app, you agree to the following terms.

1. LICENSE
Office work grants you a personal, non-transferable license to use the app on devices you own or control, for lawful personal or commercial productivity.

2. YOUR CONTENT
You retain all rights to the documents, spreadsheets, presentations and any content you create. Office work does not claim ownership over your files. Because the app is offline, your content is stored on your device.

3. ACCEPTABLE USE
You agree not to use the app to create or store content that is illegal, infringing, abusive, or otherwise violates applicable law. You are responsible for backing up your important files.

4. OFFLINE NATURE
Office work is designed to work fully offline. Certain optional features (such as import/export via device apps) may rely on other apps installed on your device. Use of those apps is governed by their own terms.

5. AI FEATURES
AI features run on your device using deterministic heuristics. AI output may sometimes contain inaccuracies. You are responsible for reviewing AI-generated content before use.

6. NO WARRANTY
Office work is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we disclaim all implied warranties including merchantability and fitness for a particular purpose.

7. LIMITATION OF LIABILITY
To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential or exemplary damages, or for any loss of data. Please back up your files regularly.

8. UPDATES
We may update the app and these terms from time to time. Continued use after an update constitutes acceptance of the revised terms.

9. TERMINATION
You may stop using the app at any time. Deleting the app removes locally stored data associated with the app.

10. CONTACT
For questions, contact jarvisai9077@gmail.com.

Last updated: February 2026.`;

export default function Terms() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.top, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} testID="terms-back"><Icon name="arrow-left" size={24} color={colors.onSurface} /></TouchableOpacity>
        <AppText variant="h3" style={{ flex: 1 }}>Terms & Conditions</AppText>
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
