import Mannequin3D from "@/components/Mannequin3D";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  background: "#F1EBFD",
  primary: "#6F66FF",
  pill: "#E4DCFA",
  textDark: "#2A1B6B",
  orange: "#FF8A00",
  white: "#FFFFFF",
  success: "#22C55E",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
};

/* Formate un nombre de secondes en MM:SS (ou HH:MM:SS si >= 1h) */
function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/* Ligne d'état d'une permission */
function PermissionRow({
  icon,
  label,
  granted,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  granted: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.permRow, !isLast && styles.permRowBorder]}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.permLabel}>{label}</Text>
      <Ionicons
        name={granted ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={granted ? COLORS.success : COLORS.mutedLight}
      />
    </View>
  );
}

export default function HomeScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [elapsed, setElapsed] = useState(0); // secondes écoulées depuis le début
  const insets = useSafeAreaInsets();

  // Durée envoyée depuis l'écran d'accueil (en secondes) – absente si "Continuer sans durée"
  const params = useLocalSearchParams<{ duration?: string | string[] }>();
  const rawDuration = Array.isArray(params.duration)
    ? params.duration[0]
    : params.duration;
  const parsedDuration = parseInt(rawDuration ?? "0", 10);
  const duration =
    Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 0;
  const hasDuration = duration > 0;

  // Valeur affichée dans le minuteur :
  // - avec durée : compte à rebours à partir de la durée choisie
  // - sans durée : chronomètre qui démarre à 00:00
  const displayedSeconds = hasDuration
    ? Math.max(duration - elapsed, 0)
    : elapsed;

  // Permissions caméra / micro
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  // Minuteur : avance d'une seconde tant qu'on enregistre
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Arrêt automatique quand le compte à rebours atteint 0
  useEffect(() => {
    if (isRecording && hasDuration && elapsed >= duration) {
      cameraRef.current?.stopRecording();
    }
  }, [elapsed, isRecording, hasDuration, duration]);

  const startRecording = async () => {
    // recordAsync n'est pas disponible sur le Web
    if (Platform.OS === "web") {
      alert("L'enregistrement vidéo sera disponible sur l'application mobile.");
      return;
    }

    // On attend que la caméra soit prête et on évite un double départ
    if (!cameraReady || isRecording || !cameraRef.current) return;

    try {
      setElapsed(0);
      setRecording(true);
      const video = await cameraRef.current.recordAsync(
        hasDuration ? { maxDuration: duration } : undefined,
      );
      console.log("Vidéo enregistrée :", video?.uri);
    } catch (error: any) {
      alert(error?.message ?? String(error));
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  // Chargement des permissions
  if (!camPerm || !micPerm) return <View style={styles.center} />;

  if (!camPerm.granted || !micPerm.granted) {
    const canAsk = camPerm.canAskAgain && micPerm.canAskAgain;

    const handlePress = async () => {
      if (!canAsk) {
        Linking.openSettings();
        return;
      }
      await requestCamPerm();
      await requestMicPerm();
    };

    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="videocam" size={40} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Autorisations requises</Text>
        <Text style={styles.subtitle}>
          Pour enregistrer une vidéo avec le son, nous avons besoin d'accéder à
          votre caméra et à votre micro.
        </Text>

        <View style={styles.permList}>
          <PermissionRow
            icon="camera-outline"
            label="Caméra"
            granted={camPerm.granted}
          />
          <PermissionRow
            icon="mic-outline"
            label="Micro"
            granted={micPerm.granted}
            isLast
          />
        </View>

        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={handlePress}
        >
          <Text style={styles.btnText}>
            {canAsk ? "Autoriser l'accès" : "Ouvrir les réglages"}
          </Text>
        </TouchableOpacity>

        {!canAsk && (
          <Text style={styles.hint}>
            L'accès a été refusé. Activez-le dans les réglages de votre
            appareil.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Zone principale */}
      <View style={styles.content}>
        {/* MANNEQUIN 3D */}
        <View style={styles.mannequinStage}>
          <Mannequin3D />
        </View>

        {/* Petite caméra en haut à gauche */}
        <View style={[styles.camera, { top: insets.top + 12 }]}>
          <CameraView
            style={{ flex: 1 }}
            mode="video"
            facing="front"
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          />
        </View>

        {/* Minuteur */}
        <View style={[styles.times, { top: insets.top + 12 }]}>
          <Text style={styles.timerText}>{formatTime(displayedSeconds)}</Text>
          <View
            style={[
              styles.redDot,
              !isRecording && { backgroundColor: COLORS.mutedLight },
            ]}
          />
        </View>

        {/* Graphique en bas */}
        <View style={styles.chart}>
          <View style={styles.chartLine} />
        </View>
      </View>

      {/* Barre du bas */}
      <View
        style={[
          styles.bottomBar,
          { height: 140 + insets.bottom, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Retour */}
        <TouchableOpacity style={styles.bottomItem}>
          <View style={styles.sideCircle}>
            <Ionicons name="arrow-back" size={26} color="#cd0101" />
          </View>
        </TouchableOpacity>

        {/* Enregistrer */}
        <TouchableOpacity
          style={styles.recordWrapper}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View
            style={[
              styles.spark,
              { top: 2, right: 14, transform: [{ rotate: "15deg" }] },
            ]}
          />
          <View
            style={[
              styles.spark,
              { top: 10, right: 2, transform: [{ rotate: "55deg" }] },
            ]}
          />
          <View
            style={[
              styles.spark,
              { top: 24, right: -6, transform: [{ rotate: "75deg" }] },
            ]}
          />

          <LinearGradient
            colors={["#6038e6", "#4A22C4"]}
            style={styles.recordRing}
          >
            <View style={styles.recordButton}>
              <Image
                style={styles.recordIcon}
                source={require("../../assets/images/Aura.png")}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Paramètres */}
        <TouchableOpacity style={styles.bottomItem}>
          <View style={styles.sideCircle}>
            <Ionicons name="settings-sharp" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ---------- Écran de permissions ---------- */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: COLORS.background,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary + "26", // ~15% d'opacité
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.textDark,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: COLORS.muted,
    marginBottom: 28,
  },

  permList: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 28,
  },

  permRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },

  permRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.pill,
  },

  permLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },

  btn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  btnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  hint: {
    marginTop: 16,
    fontSize: 13,
    textAlign: "center",
    color: COLORS.mutedLight,
  },

  /* ---------- Écran principal ---------- */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  mannequinStage: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 180,
    overflow: "hidden",
  },

  timerText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "bold",
  },

  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.orange,
  },

  recordIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },

  /* Contenu */
  content: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  camera: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 110,
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: COLORS.pill,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },

  times: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.pill,
  },

  /* Graphique */
  chart: {
    position: "absolute",
    bottom: 170,
    left: 0,
    right: 0,
    height: 130,
    justifyContent: "center",
    backgroundColor: "#f8f8f90f",
  },

  chartLine: {
    height: 4,
    marginHorizontal: 50,
    backgroundColor: COLORS.orange,
    borderRadius: 2,
  },

  /* Barre du bas */
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },

  bottomItem: {
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },

  recordWrapper: {
    alignItems: "center",
  },

  recordButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  sideCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B3A8C",
  },

  recordRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C55FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  spark: {
    position: "absolute",
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
  },
});