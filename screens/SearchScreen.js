// screens/SearchScreen.js
import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { palette } from "../styles/colors";

const REGION_ORDER = ["northern", "northeastern", "central", "southern"];
const labelFor = (key, isZH) => {
  const en = {
    northern: "North",
    northeastern: "Northeast",
    central: "Central",
    southern: "South",
  };
  const zh = {
    northern: "北部",
    northeastern: "东北部",
    central: "中部",
    southern: "南部",
  };
  return (isZH ? zh : en)[key] || key;
};

const FadeInImage = ({ style, ...props }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const onLoad = () =>
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  return (
    <Animated.Image {...props} onLoad={onLoad} style={[style, { opacity }]} />
  );
};

export default function SearchScreen() {
  const { i18n, t } = useTranslation();
  const isZH = i18n.language?.startsWith("zh");
  const navigation = useNavigation();

  // ✅ ปุ่มสลับภาษาใน header (มุมซ้ายบน)
  const toggleLang = () => i18n.changeLanguage(isZH ? "en" : "zh");
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isZH ? "搜索" : "Search",
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

  const [loading, setLoading] = useState(false);
  const [rawRows, setRawRows] = useState({
    northern: [],
    northeastern: [],
    central: [],
    southern: [],
  });

  // search state + debounce
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchRaw.trim()), 250);
    return () => clearTimeout(id);
  }, [searchRaw]);

  // region filter
  const [regionFilter, setRegionFilter] = useState("all"); // 'all' | regionKey

  // โหลดข้อมูลทุกภาคครั้งเดียว
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const result = {};
        for (const key of REGION_ORDER) {
          const ref = doc(db, "thai_food_guide", key);
          const snap = await getDoc(ref);
          const menus =
            snap.exists() && Array.isArray(snap.data()?.menus)
              ? snap.data().menus
              : [];
          result[key] = menus;
        }
        setRawRows(result);
      } catch (e) {
        console.warn("Search fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // แปลงเป็นรายการแบนตามภาษา
  const allItems = useMemo(() => {
    const out = [];
    for (const key of REGION_ORDER) {
      const arr = rawRows[key] || [];
      arr.forEach((m, idx) => {
        const title = isZH
          ? m.dish_zh || m.dish_en || m.dish_en_th || "—"
          : m.dish_en || m.dish_zh || m.dish_en_th || "—";
        out.push({
          id: m.id || `${key}_${idx}`,
          regionKey: key,
          index: idx,
          _title: title,
          _image: m.image_main_url || m.image_detail_url || null,
          _category: isZH
            ? m.category_zh || m.category || ""
            : m.category || m.category_en || "",
          _raw: m,
        });
      });
    }
    return out;
  }, [rawRows, isZH]);

  // กรองตาม region + คำค้น
  const results = useMemo(() => {
    let list = allItems;
    if (regionFilter !== "all")
      list = list.filter((it) => it.regionKey === regionFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (it) =>
          (it._title || "").toLowerCase().includes(q) ||
          (it._category || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a._title.localeCompare(b._title));
  }, [allItems, regionFilter, search]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("DishDetail", {
          dish: item._raw || item,
          regionKey: item.regionKey,
          index: item.index,
          from: "search",
        })
      }
    >
      {item._image ? (
        <FadeInImage source={{ uri: item._image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item._title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {labelFor(item.regionKey, isZH)}
          {item._category ? ` · ${item._category}` : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9aa1ad" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ช่องค้นหา + ชิปกรองภาค */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          color="#6b7280"
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={searchRaw}
          onChangeText={setSearchRaw}
          placeholder={t("Search for a dish...") || "Search for a dish..."}
          style={{ flex: 1, paddingVertical: 8 }}
          returnKeyType="search"
        />
        {searchRaw.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchRaw("")}
            style={styles.clearBtn}
          >
            <Ionicons name="close" size={16} color="#111827" />
          </TouchableOpacity>
        )}
      </View>
<View style={styles.chipsBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignItems: "center" }}
        style={{ marginBottom:8, height:44 }}
      >
        {[
          { key: "all", label: isZH ? "全部" : "All" },
          ...REGION_ORDER.map((k) => ({ key: k, label: labelFor(k, isZH) })),
        ].map((chip) => {
          const active = regionFilter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setRegionFilter(chip.key)}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
        </View>

      {/* เนื้อหา */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={{ marginTop: 8, color: "#6b7280" }}>
            {isZH ? "正在加载…" : "Loading…"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={24} color="#9aa1ad" />
              <Text style={{ marginTop: 6, color: "#9aa1ad" }}>
                {isZH ? "没有找到结果" : "No results found"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16 },

  // Header language pill (เหมือน Home)
  langBtn: {
    marginLeft: 12,
    marginRight: 12,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  langBtnText: { fontWeight: "700", color: palette.primary600 },

  // Search bar
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.bg,
    marginBottom: 8,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    marginLeft: 8,
  },

  // Chips
  chipsWrap: { paddingVertical: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  chipText: { color: "#111827", fontWeight: "600" },
  chipTextActive: { color: palette.primary600 },

  // List rows
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  sep: { height: 1, backgroundColor: palette.border },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  thumbPlaceholder: { backgroundColor: "#e5e7eb" },
  title: { fontSize: 16, fontWeight: "700", color: palette.ink },
  meta: { fontSize: 12, color: palette.ink60, marginTop: 2 },

  // Empty / Loading
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 32 },
});
