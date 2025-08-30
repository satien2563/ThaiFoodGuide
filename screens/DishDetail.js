// src/screens/DishDetail.js
import React, {
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { palette } from "../styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_KEY = "favorites:v1";

async function upsertFavorite({
  regionKey,
  dishId,
  index,
  title_en,
  title_zh,
  image,
  category_en,
  category_zh,
}) {
  const key = `${regionKey}:${dishId || `idx_${index}`}`;
  const raw = await AsyncStorage.getItem(STORE_KEY);
  const list = raw ? JSON.parse(raw) : [];
  const exists = list.find((x) => x.key === key);
  if (exists) return list; // มีแล้ว ไม่ซ้ำ

  const next = [
    ...list,
    {
      key,
      regionKey,
      dishId,
      index,
      title_en,
      title_zh,
      image,
      category_en,
      category_zh,
      addedAt: Date.now(),
    },
  ];
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}

async function removeFavoriteByKey(key) {
  const raw = await AsyncStorage.getItem(STORE_KEY);
  const list = raw ? JSON.parse(raw) : [];
  const next = list.filter((x) => x.key !== key);
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}

export default function DishDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { i18n, t } = useTranslation();
  const isZH = i18n.language?.startsWith("zh");

  //สำหรับกดใจ
  const key = `${regionKey}:${dish?.id || `idx_${index}`}`;
  const isFav = useRef(false);

  // route.params รองรับทั้ง 3 แบบ: { dish } หรือ { regionKey, dishId } หรือ { regionKey, index }
  const { dish: dishFromRoute, regionKey, dishId, index } = route.params || {};
  const [dish, setDish] = useState(dishFromRoute || null);
  const [fav, setFav] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t("dish_detail") || "Dish Detail" });
  }, [navigation, t]);

  useEffect(() => {
    const loadIfNeeded = async () => {
      if (dishFromRoute) return; // ได้วัตถุมาจาก Home แล้ว
      if (!regionKey) return;

      try {
        const ref = doc(db, "thai_food_guide", regionKey);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const menus = Array.isArray(snap.data().menus) ? snap.data().menus : [];

        let found = null;
        if (dishId) {
          found = menus.find((m) => m?.id === dishId);
        }
        if (!found && typeof index === "number") {
          found = menus[index];
        }
        // เผื่อหาไม่เจอด้วย id/index ให้ลองเทียบชื่อ
        if (!found && dishId) {
          found = menus.find(
            (m) => m?.dish_en === dishId || m?.dish_zh === dishId
          );
        }
        if (found) setDish(found);
      } catch (e) {
        console.warn("Load dish detail error:", e);
      }
    };
    loadIfNeeded();
  }, [dishFromRoute, regionKey, dishId, index]);

  const title = useMemo(() => {
    if (!dish) return "—";
    return isZH
      ? dish.dish_zh || dish.dish_en || dish.dish_en_th || "—"
      : dish.dish_en || dish.dish_zh || dish.dish_en_th || "—";
  }, [dish, isZH]);

  const category = useMemo(() => {
    if (!dish) return "";
    return isZH
      ? dish.category_zh || dish.category || ""
      : dish.category || dish.category_en || "";
  }, [dish, isZH]);

  const imageUrl = useMemo(() => {
    if (!dish) return null;
    return dish.image_main_url || dish.image_detail_url || null;
  }, [dish]);

  const ingredients = useMemo(() => {
    if (!dish) return [];
    const field = isZH
      ? dish.ingredients_zh ?? dish.ingredients_cn
      : dish.ingredients_en;
    if (Array.isArray(field)) return field.filter(Boolean);
    if (typeof field === "string") {
      // รองรับ string คั่นด้วยคอมมา/จุลภาค
      return field
        .split(/[,/•;|\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [dish, isZH]);

  const description = useMemo(() => {
    if (!dish) return "";
    return isZH
      ? dish.description_zh || dish.description_en || ""
      : dish.description_en || dish.description_zh || "";
  }, [dish, isZH]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${title}\n${description?.slice(0, 140) || ""}`,
        url: imageUrl || undefined,
        title,
      });
    } catch (e) {
      Alert.alert("Share error", String(e?.message || e));
    }
  };

  // …ตอนกดหัวใจ:
  // const onToggleFav = async () => {
  //   if (!dish) return;
  //   const payload = {
  //     regionKey,
  //     dishId: dish.id,
  //     index,
  //     title_en: dish.dish_en || dish.dish_en_th,
  //     title_zh: dish.dish_zh,
  //     image: dish.image_main_url || dish.image_detail_url,
  //     category_en: dish.category || dish.category_en,
  //     category_zh: dish.category_zh,
  //   };
  //   if (isFav.current) {
  //     await removeFavoriteByKey(key);
  //     setFav(false);
  //     isFav.current = false;
  //   } else {
  //     await upsertFavorite(payload);
  //     setFav(true);
  //     isFav.current = true;
  //   }
  // };

  // คีย์เฉพาะจานนี้
  const favKey = React.useMemo(
    () => `${regionKey}:${dish?.id ?? `idx_${index ?? 0}`}`,
    [regionKey, dish?.id, index]
  );

  // โหลดสถานะเริ่มต้นจาก AsyncStorage
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("favorites:v1");
      const list = raw ? JSON.parse(raw) : [];
      setFav(list.some((x) => x.key === favKey));
    })();
  }, [favKey]);

  // กดหัวใจสลับสถานะ
  const onToggleFav = async () => {
    const raw = await AsyncStorage.getItem("favorites:v1");
    const list = raw ? JSON.parse(raw) : [];

    if (fav) {
      const next = list.filter((x) => x.key !== favKey);
      await AsyncStorage.setItem("favorites:v1", JSON.stringify(next));
      setFav(false);
    } else {
      const payload = {
        key: favKey,
        regionKey,
        dishId: dish?.id,
        index,
        title_en: dish?.dish_en || dish?.dish_en_th,
        title_zh: dish?.dish_zh,
        image: dish?.image_main_url || dish?.image_detail_url,
        category_en: dish?.category || dish?.category_en,
        category_zh: dish?.category_zh,
        addedAt: Date.now(),
      };
      if (!list.some((x) => x.key === favKey)) {
        await AsyncStorage.setItem(
          "favorites:v1",
          JSON.stringify([...list, payload])
        );
      }
      setFav(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* ภาพใหญ่ */}
      <View style={styles.heroImageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]} />
        )}
      </View>

      {/* เนื้อหา */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.title}>{title}</Text>
        {!!category && <Text style={styles.category}>{category}</Text>}

        {/* Ingredients */}
        <Text style={styles.h2}>{t("ingredients") || "Ingredients"}</Text>
        {ingredients.length === 0 ? (
          <Text style={styles.muted}>{t("no_items") || "—"}</Text>
        ) : (
          <View style={{ marginTop: 6 }}>
            {ingredients.map((ing, i) => (
              <View key={`${i}-${ing}`} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={styles.bulletText}>{ing}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <Text style={[styles.h2, { marginTop: 16 }]}>
          {t("description") || "Description"}
        </Text>
        <Text style={styles.desc}>{description || "—"}</Text>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onToggleFav}
          activeOpacity={0.8}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={26}
            color={fav ? palette.primary600 : palette.ink}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={onShare}
          activeOpacity={0.9}
        >
          <Ionicons name="share-outline" size={20} color="#111" />
          <Text style={styles.shareText}>{t("share") || "Share"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark-outline" size={24} color={palette.ink} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // ภาพใหญ่ด้านบน
  heroImageWrap: { paddingHorizontal: 16, paddingTop: 16 },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  heroPlaceholder: { backgroundColor: "#f3f4f6" },

  // ตัวอักษร
  title: { fontSize: 24, fontWeight: "800", marginTop: 16, color: palette.ink },
  category: { marginTop: 4, color: palette.ink60 },
  h2: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: palette.accent,
    alignSelf: "flex-start",
  },
  bulletRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.ink,
    marginRight: 8,
  },
  bulletText: { flex: 1, color: palette.ink },
  desc: { marginTop: 8, lineHeight: 20, color: palette.ink },

  // แถบปุ่มล่าง
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: "#e6e9ef",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e9ef",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  shareBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  shareText: { fontWeight: "700", color: "#111" },
});
