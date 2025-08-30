import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { palette } from '../styles/colors'



const REGION_ORDER = ["northern", "northeastern", "central", "southern"];

const labelFor = (key, langIsCN) => {
  const mapEN = {
    northern: "North",
    northeastern: "Northeast",
    central: "Central",
    southern: "South",
  };
  const mapCN = {
    northern: "北部",
    northeastern: "东北部",
    central: "中部",
    southern: "南部",
  };
  return langIsCN ? mapCN[key] : mapEN[key];
};

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isZH = i18n.language?.startsWith('zh')
  const [rows, setRows] = useState({
    northern: [],
    northeastern: [],
    central: [],
    southern: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // สลับ EN <-> CN เท่านั้น
  const toggleLang = () => {
    if (i18n.language?.startsWith("zh") || i18n.language === "cn")
      i18n.changeLanguage("en");
    else i18n.changeLanguage("zh");
  };

  // อ่านเมนู recommended ของแต่ละภาค
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const result = {
          northern: [],
          northeastern: [],
          central: [],
          southern: [],
        };

        // ดึงทีละภาคตามลำดับ
        for (const key of REGION_ORDER) {
          const ref = doc(db, "thai_food_guide", key);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            console.warn("Missing region doc:", key);
            continue;
          }
          const data = snap.data() || {};
          const menus = Array.isArray(data.menus) ? data.menus : [];

          const items = menus
            .filter((m) => m?.recommend === "yes" || m?.recommend === true)
            .slice(0, 20) // จำกัดต่อแถว
            .map((m, idx) => ({
              id: m.id || `${key}_${idx}`,
              _title:
                i18n.language?.startsWith("zh") || i18n.language === "cn"
                  ? m.dish_zh || m.dish_en || m.dish_en_th || "—"
                  : m.dish_en || m.dish_zh || m.dish_en_th || "—",
              _image: m.image_main_url || m.image_detail_url || null,
              _raw: m,
            }));

          result[key] = items;
        }

        setRows(result);
      } catch (err) {
        console.error("Fetch recommended by regions error:", err);
        Alert.alert("Firestore Error", String(err?.message || err));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [i18n.language]); // ถ้าสลับภาษา ให้รีเฟรชชื่อเมนู

  // กรองด้วยข้อความค้นหาในแต่ละแถว
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    const r = {};
    for (const key of REGION_ORDER) {
      r[key] = (rows[key] || []).filter((it) =>
        (it._title || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [rows, search]);

  const langIsCN = i18n.language?.startsWith("zh") || i18n.language === "cn";

  // ส่ง regionKey และ index มาเป็น props ด้วย
const DishCard = ({ item, regionKey, index }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    onPress={() =>
      navigation.navigate('DishDetail', {
        dish: item._raw || item,   // ✅ ส่งวัตถุเมนูทั้งก้อน
        regionKey,                 // ✅ ภูมิภาคของแถวนี้ (northern/northeastern/central/southern)
        index,                     // ✅ เผื่อ fallback หาในเอกสาร
        from: 'home',
      })
    }
  >
    {item._image ? (
      <FadeInImage source={{ uri: item._image }} style={styles.cardImage} />
      // ถ้าไม่ใช้ FadeInImage ให้ใช้ Image ของเดิม:
      // <Image source={{ uri: item._image }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, styles.imagePlaceholder]} />
    )}
    <Text style={styles.cardTitle} numberOfLines={1}>
      {item._title}
    </Text>
  </TouchableOpacity>
);



  // const DishCard = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.card}
  //     activeOpacity={0.85}
  //     onPress={() =>
  //       navigation.navigate("DishDetail", {
  //         dishId: item._raw?.id || item.id,
  //         from: "home",
  //       })
  //     }
  //   >
  //     {item._image ? (
  //        <FadeInImage source={{ uri: item._image }} style={styles.cardImage} />
  //       // <Image source={{ uri: item._image }} style={styles.cardImage} />
  //     ) : (
  //       <View style={[styles.cardImage, styles.imagePlaceholder]} />
  //     )}
  //     <Text style={styles.cardTitle} numberOfLines={1}>
  //       {item._title}
  //     </Text>
  //   </TouchableOpacity>
  // );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header + Lang */}
      <View style={styles.hero}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Thai Food Guide</Text>
          <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{isZH ? "ZH" : "EN"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {isZH ? "探索泰国美食" : "Explore Thailand’s flavors"}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          style={{ marginRight: 6, opacity: 0.7 }}
        />
        <TextInput
          style={{ flex: 1, paddingVertical: 8 }}
          placeholder={t("Search for a dish") || "Search for a dish..."}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Recommended (4 แถว ตามลำดับที่กำหนด) */}
      <Text style={styles.section}>{t("recommended") || "Recommended"}</Text>
      {REGION_ORDER.map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.subsection}>{labelFor(key, langIsCN)}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row" }}>
              {(filteredRows[key] || []).map((item, idx) => (
                  <View key={item.id} style={{ marginRight: 12 }}>
                  <DishCard item={item} regionKey={key} index={idx} />
            </View>
              ))}
              {!loading && (filteredRows[key] || []).length === 0 && (
                <View
                  style={[
                    styles.card,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                >
                  <Text style={{ opacity: 0.6 }}>
                    {t("no_items") || "No items"}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      ))}

      {/* Explore by Region (ปุ่ม 2×2) */}
      <Text style={styles.section}>
        {t("explore_by_region") || "Explore by Region"}
      </Text>
      <View style={styles.regionContainer}>
        {REGION_ORDER.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.regionButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Dishes", { region: key })}
          >
            <Text style={styles.regionButtonText}>
              {labelFor(key, langIsCN)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Favorites */}
      <Text style={styles.section}>{t("favorites") || "Favorites"}</Text>
      <View style={styles.favCard}>
        <Ionicons name="heart" size={32} />
        <Text style={{ marginTop: 6, fontWeight: "600" }}>
          {t("favorites") || "Favorites"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: 16,
    paddingTop: 16,                       // ✅ เว้นด้านบน 50px
    paddingBottom: 16,
  },
 // ── HERO (หัวสีเขียว) ─────────────────────────────────
  hero: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { marginTop: 4, color: 'rgba(255,255,255,0.9)' },

  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  langBtnText: { fontWeight: '700', color: palette.primary600 },

  // ── Search ─────────────────────────────────────────────
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: palette.bg,
    marginTop: 8, marginBottom: 6,
  },

  // ── Section Headings ──────────────────────────────────
  section: {
    fontSize: 18, fontWeight: '800', color: palette.ink,
    marginTop: 16, marginBottom: 8,
    // เส้นสีเล็ก ๆ ใต้หัวข้อ
    paddingBottom: 4,
    borderBottomWidth: 3,
    borderBottomColor: palette.accent,
    alignSelf: 'flex-start',
  },
  subsection: {
    fontSize: 16, fontWeight: '700', color: palette.ink,
    marginBottom: 6, opacity: 0.9,
  },

  // ── การ์ดเมนู (Recommended) ───────────────────────────
  card: {
    width: 148,
    padding: 12,
    borderRadius: 16,
    backgroundColor: palette.bg,
    borderWidth: 1, borderColor: palette.border,
  },
  cardImage: {
    width: '100%', height: 78,
    borderRadius: 10, marginBottom: 8,
    backgroundColor: '#eee',
  },
  imagePlaceholder: { backgroundColor: '#ddd' },
  cardTitle: { textAlign: 'center', fontWeight: '700', color: palette.ink },

  // ── Region Buttons (2×2) ──────────────────────────────
  regionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionButton: {
    width: '48%',
    minHeight: 52,
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 14,
    // ปุ่มสีอ่อน
    backgroundColor: '#ecfdf5',      // emerald-50
    borderWidth: 1, borderColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionButtonText: { fontSize: 16, fontWeight: '700', color: palette.primary600 },

  // ── Favorites block ───────────────────────────────────
  favCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
})
const FadeInImage = ({ style, ...props }) => {
  const opacity = React.useRef(new Animated.Value(0)).current
  const onLoad = () =>
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start()
  return <Animated.Image {...props} onLoad={onLoad} style={[style, { opacity }]} />
}

export default HomeScreen;