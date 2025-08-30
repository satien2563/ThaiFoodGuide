// screens/ProfileScreen.js
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palette } from "../styles/colors";

import { auth, storage } from "../config/firebaseConfig";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FAVORITES_KEY = "favorites:v1";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const isZH = i18n.language?.startsWith("zh");

  // auth state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // profile edit
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  // data
  const [favCount, setFavCount] = useState(0);

  // Header: EN/ZH
  const toggleLang = () => i18n.changeLanguage(isZH ? "en" : "zh");
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isZH ? "个人资料" : "Profile",
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleLang}
          style={styles.langBtn}
          activeOpacity={0.9}
        >
          <Text style={styles.langBtnText}>{isZH ? "ZH" : "EN"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isZH]);

  // listen auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
      setDisplayName(u?.displayName || "");
    });
    return unsub;
  }, []);

  // load favorites count
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setFavCount(Array.isArray(list) ? list.length : 0);
    })();
  }, []);

  const initials = useMemo(() => {
    const n = (displayName || user?.email || "G").trim();
    const p = n.split(" ");
    return ((p[0]?.[0] || "G") + (p[1]?.[0] || "")).toUpperCase();
  }, [displayName, user?.email]);

  // ── Actions ───────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert(
        isZH ? "退出失败" : "Sign out failed",
        e?.message || String(e)
      );
    }
  };

  const saveDisplayName = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: displayName || "" });
      setEditingName(false);
      Alert.alert(
        isZH ? "已保存" : "Saved",
        isZH ? "昵称已更新" : "Display name updated"
      );
    } catch (e) {
      Alert.alert(isZH ? "保存失败" : "Save failed", e?.message || String(e));
    }
  };

  const pickAndUploadAvatar = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        isZH ? "权限被拒绝" : "Permission denied",
        isZH ? "请允许访问相册" : "Please allow photo library access"
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    try {
      setUploading(true);
      const blob = await (await fetch(uri)).blob();
      const storageRef = ref(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      Alert.alert(
        isZH ? "已更新" : "Updated",
        isZH ? "头像已更新" : "Avatar updated"
      );
    } catch (e) {
      Alert.alert(isZH ? "上传失败" : "Upload failed", e?.message || String(e));
    } finally {
      setUploading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────
  if (loadingUser) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  // ── Not signed in: CTA card ───────────────────────────
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.heroCard]}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={palette.primary600}
            />
          </View>
          <Text style={styles.heroTitle}>
            {isZH ? "欢迎使用 Thai Food Guide" : "Welcome to Thai Food Guide"}
          </Text>
          <Text style={styles.heroText}>
            {isZH
              ? "登录后可在多设备同步你的收藏。"
              : "Sign in to sync your favorites across devices."}
          </Text>
          {/* <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.mainBtn, styles.flex1]}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.9}
            >
              <Text style={styles.mainBtnTxt}>
                {i18n.t("login") || "Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.flex1]}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryBtnTxt}>
                <Text style={styles.secondaryBtnTxt}>
                  {i18n.t("register") || "Register"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.ctaCol}>
            <TouchableOpacity
              style={[styles.mainBtn, styles.fullBtn]}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.9}
            >
              <Text style={styles.mainBtnTxt}>{i18n.t("login") || "Login"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, styles.fullBtn]}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryBtnTxt}>{i18n.t("register") || "Register"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminBtn, styles.fullBtn]}
              // ถ้าคุณทำ Admin เป็น stack ชื่อ 'Admin' ที่มีหน้าชื่อ 'AdminHome':
              onPress={() => navigation.navigate('Admin', { screen: 'AdminHome' })}
              // ถ้าคุณลงทะเบียน AdminHome เป็นหน้าตรง ๆ ให้ใช้บรรทัดล่างแทน:
              // onPress={() => navigation.navigate('AdminHome')}
              activeOpacity={0.9}
            >
              <Ionicons name="settings-outline" size={16} color={palette.primary600} />
              <Text style={styles.adminBtnTxt}>Admin</Text>
            </TouchableOpacity>
          </View>


        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Thai Food Guide</Text>
          <Text style={styles.aboutText}>
            {isZH
              ? "探索泰国美食，收藏你的最爱。"
              : "Explore Thai cuisine and save your favorites."}
          </Text>
        </View>
      </View>
    );
  }

  // ── Signed in: professional layout ─────────────────────
  return (
    <View style={styles.container}>
      {/* Profile Header Card */}
      <View style={[styles.card, styles.profileCard]}>
        <View style={styles.avatarWrap}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
              <Text style={styles.avatarTxt}>{initials}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.camBtn}
            onPress={pickAndUploadAvatar}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {!editingName ? (
            <>
              <Text style={styles.name} numberOfLines={1}>
                {displayName || user.email}
              </Text>
              <Text style={styles.emailMuted} numberOfLines={1}>
                {user.email}
              </Text>

              <View style={styles.inlineRow}>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => setEditingName(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={palette.primary600}
                  />
                  <Text style={styles.ghostBtnTxt}>
                    {isZH ? "编辑昵称" : "Edit name"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>{isZH ? "昵称" : "Display name"}</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                placeholder={isZH ? "输入昵称" : "Enter display name"}
              />
              <View style={styles.inlineRow}>
                <TouchableOpacity
                  style={[styles.mainBtn, { marginRight: 8 }]}
                  onPress={saveDisplayName}
                  activeOpacity={0.9}
                >
                  <Text style={styles.mainBtnTxt}>
                    {isZH ? "保存" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setDisplayName(user?.displayName || "");
                    setEditingName(false);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.secondaryBtnTxt}>
                    {isZH ? "取消" : "Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={[styles.card, styles.rowBetween]}>
        <View style={styles.statLeft}>
          <Ionicons
            name="heart-outline"
            size={18}
            color={palette.primary600}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.rowLabel}>
            {isZH ? "已收藏菜品" : "Saved dishes"}:{" "}
            <Text style={{ fontWeight: "800" }}>{favCount}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Favorites")}
          style={styles.linkBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.linkBtnTxt}>{isZH ? "管理" : "Manage"}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={palette.primary600}
          />
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {isZH ? "偏好设置" : "Preferences"}
        </Text>
      </View>
      <View style={[styles.card, { paddingVertical: 8 }]}>
        <SettingRow
          icon="language-outline"
          label={isZH ? "语言" : "Language"}
          right={
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segBtn, !isZH && styles.segBtnActive]}
                onPress={() => i18n.changeLanguage("en")}
              >
                <Text style={[styles.segTxt, !isZH && styles.segTxtActive]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segBtn, isZH && styles.segBtnActive]}
                onPress={() => i18n.changeLanguage("zh")}
              >
                <Text style={[styles.segTxt, isZH && styles.segTxtActive]}>
                  中文
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Account */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isZH ? "账号" : "Account"}</Text>
      </View>
      <View style={[styles.card, { paddingVertical: 8 }]}>
        <SettingRow
          icon="log-out-outline"
          label={isZH ? "退出登录" : "Sign out"}
          danger
          onPress={handleSignOut}
        />
      </View>

      {/* Uploading overlay */}
      {uploading && (
        <View style={styles.overlay}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.overlayText}>
            {isZH ? "正在上传头像…" : "Uploading avatar…"}
          </Text>
        </View>
      )}
    </View>
  );
}

/** — Helper components — */
function SettingRow({ icon, label, right, onPress, danger }) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[
        styles.settingRow,
        danger && { borderColor: "#fee2e2", backgroundColor: "#fff" },
      ]}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? "#ef4444" : palette.ink}
          style={{ marginRight: 10 }}
        />
        <Text
          style={[
            styles.settingLabel,
            danger && { color: "#ef4444", fontWeight: "800" },
          ]}
        >
          {label}
        </Text>
      </View>
      {right
        ? right
        : onPress && (
          <Ionicons name="chevron-forward" size={16} color="#9aa1ad" />
        )}
    </TouchableOpacity>
  );
}

/** — Styles — */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  center: { alignItems: "center", justifyContent: "center" },

  // Header language pill
  langBtn: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  langBtnText: { fontWeight: "700", color: palette.primary600 },

  // Cards
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
    marginBottom: 12,
    ...(Platform.OS === "ios"
      ? {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }
      : { elevation: 2 }),
  },

  heroCard: { alignItems: "center", textAlign: "center" },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink,
    textAlign: "center",
  },
  heroText: { marginTop: 6, color: palette.ink60, textAlign: "center" },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    alignSelf: "stretch",
  },
  flex1: { flex: 1 },

  ctaCol: {
  marginTop: 12,
  alignSelf: 'stretch',
  gap: 10,
},
fullBtn: {
  width: '100%',
},
adminBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: palette.border,
},
adminBtnTxt: {
  marginLeft: 6,
  color: palette.primary600,
  fontWeight: '800',
},


  // Profile header
  profileCard: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { width: 72, height: 72, marginRight: 12 },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontWeight: "800", color: palette.primary600, fontSize: 18 },
  camBtn: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary600,
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: { fontSize: 18, fontWeight: "800", color: palette.ink },
  emailMuted: { marginTop: 2, color: palette.ink60 },

  label: { fontSize: 12, color: palette.ink60, marginTop: 4 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  mainBtn: {
    backgroundColor: palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnTxt: { color: "#fff", fontWeight: "800" },

  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnTxt: { color: palette.ink, fontWeight: "800" },

  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
  },
  ghostBtnTxt: { color: palette.primary600, fontWeight: "800" },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontSize: 14, color: palette.ink, fontWeight: "600" },

  // Setting rows
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingLabel: { color: palette.ink, fontWeight: "600" },

  // Language segment
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  segBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  segBtnActive: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  segTxt: { color: palette.ink, fontWeight: "700" },
  segTxtActive: { color: palette.primary600 },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  linkBtnTxt: { color: palette.primary600, fontWeight: "800" },

  // About
  sectionHeader: { marginTop: 8, marginBottom: 6 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: palette.ink,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: palette.accent,
    alignSelf: "flex-start",
  },
  aboutCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
  },
  aboutTitle: { fontWeight: "800", color: palette.ink },
  aboutText: { marginTop: 4, color: palette.ink60 },

  // Overlay
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: { marginTop: 8, color: "#fff", fontWeight: "700" },
});
