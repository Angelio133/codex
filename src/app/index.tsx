import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("0");

  // Garde uniquement les chiffres et limite la valeur max
  const sanitize = (value: string, max: number) => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits === "") return "";
    return String(Math.min(parseInt(digits, 10), max));
  };

  const toNumber = (v: string) => parseInt(v || "0", 10);

  const totalSeconds =
    toNumber(hours) * 3600 + toNumber(minutes) * 60 + toNumber(seconds);

  // Avec durée : on envoie la durée à l'écran caméra
  const startWithDuration = () => {
    if (totalSeconds === 0) return;
    router.push({
      pathname: "./camera",
      params: { duration: String(totalSeconds) },
    });
  };

  // Sans durée : aucun paramètre, la caméra démarre le minuteur à 00:00
  const continueWithoutDuration = () => {
    router.push({ pathname: "./camera" });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Halo décoratif */}
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo + titre */}
            <View style={styles.hero}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/images/Aura.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Aural</Text>
              <Text style={styles.subtitle}>
                Apprendre et ameliorer votre moindre gèste sur un ecran en art
                oratoire
              </Text>

              {/* Choix de la durée (optionnel) */}
              <View style={styles.durationCard}>
                <Text style={styles.durationLabel}>
                  Durée de la session (optionnel)
                </Text>
                <View style={styles.durationRow}>
                  <View style={styles.durationField}>
                    <TextInput
                      style={styles.durationInput}
                      value={hours}
                      onChangeText={(t) => setHours(sanitize(t, 23))}
                      onBlur={() => setHours(String(toNumber(hours)))}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <Text style={styles.durationUnit}>heures</Text>
                  </View>

                  <Text style={styles.durationSeparator}>:</Text>

                  <View style={styles.durationField}>
                    <TextInput
                      style={styles.durationInput}
                      value={minutes}
                      onChangeText={(t) => setMinutes(sanitize(t, 59))}
                      onBlur={() => setMinutes(String(toNumber(minutes)))}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <Text style={styles.durationUnit}>min</Text>
                  </View>

                  <Text style={styles.durationSeparator}>:</Text>

                  <View style={styles.durationField}>
                    <TextInput
                      style={styles.durationInput}
                      value={seconds}
                      onChangeText={(t) => setSeconds(sanitize(t, 59))}
                      onBlur={() => setSeconds(String(toNumber(seconds)))}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <Text style={styles.durationUnit}>sec</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.footer}>
            {/* Commencer avec la durée choisie */}
            <Pressable
              disabled={totalSeconds === 0}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                totalSeconds === 0 && styles.buttonDisabled,
              ]}
              onPress={startWithDuration}
            >
              <Text style={styles.buttonText}>Commencer</Text>
            </Pressable>

            {/* Continuer sans durée */}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={continueWithoutDuration}
            >
              <Text style={styles.secondaryButtonText}>
                Continuer sans durée
              </Text>
            </Pressable>

            <Text style={styles.hint}>Aucune inscription requise</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // Décor
  blobTop: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E0E7FF",
    opacity: 0.8,
  },
  blobBottom: {
    position: "absolute",
    bottom: -140,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#EDE9FE",
    opacity: 0.8,
  },

  // Hero
  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#1E1B4B",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#6B7280",
    maxWidth: 280,
  },

  // Durée
  durationCard: {
    marginTop: 28,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  durationLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationField: {
    alignItems: "center",
  },
  durationInput: {
    width: 64,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F3F2FF",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1B4B",
  },
  durationUnit: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
  },
  durationSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4F46E5",
    marginHorizontal: 8,
    marginBottom: 20,
  },

  // Footer
  footer: {
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  hint: {
    marginTop: 14,
    fontSize: 13,
    color: "#9CA3AF",
  },
});