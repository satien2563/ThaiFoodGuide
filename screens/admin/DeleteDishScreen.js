// screens/admin/DeleteDishScreen.js
import React, { useEffect, useMemo, useState } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { palette } from "../../styles/colors";

const REGION_ORDER = ["northern", "northeastern", "central", "southern"];
const labelFor = (key) => {
  const en = {
    northern: "North",
    northeastern: "Northeast",
    central: "Central",
    southern: "South",
  };
  return en[key] || key;
};

const FadeInImage = ({ style, ...props }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const onLoad = () =>
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  return <Animated.Image {...props} onLoad={onLoad} style={[style, { opacity }]} />;
};

export default function DeleteDishScreen() {
  // loading + raw data per region
  const [loading, setLoading] = useState(false);
  const [rawRows, setRawRows] = useState({
    northern: [],
    northeastern: [],
    central: [],
    southern: [],
  });

  // search + debounce
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchRaw.trim()), 250);
    return () => clearTimeout(id);
  }, [searchRaw]);

  // region filter
  const [regionFilter, setRegionFilter] = useState("all");

  // confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null); // { id, regionKey, index, _title }

  // fetch once (ตามแบบ SearchScreen)
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const result = {};
        for (const key of REGION_ORDER) {
          const ref = doc(db, "thai_food_guide", key);
          const snap = await getDoc(ref);
          const menus =
            snap.exists() && Array.isArray(snap.data()?.menus) ? snap.data().menus : [];
          result[key] = menus;
        }
        setRawRows(result);
      } catch (e) {
        console.warn("Delete fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // flatten to list (EN-first)
  const allItems = useMemo(() => {
    const out = [];
    for (const key of REGION_ORDER) {
      const arr = rawRows[key] || [];
      arr.forEach((m, idx) => {
        const title = m.dish_en || m.dish_zh || m.dish_en_th || "—";
        out.push({
          id: m.id || `${key}_${idx}`,
          regionKey: key,
          index: idx,
          _title: title,
          _image: m.image_main_url || m.image_detail_url || null,
          _category: m.category || "",
          _raw: m,
        });
      });
    }
    return out;
  }, [rawRows]);

  // filter by region + query
  const results = useMemo(() => {
    let list = allItems;
    if (regionFilter !== "all") list = list.filter((it) => it.regionKey === regionFilter);
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

  // open confirm
  const onAskDelete = (item) => {
    setPendingItem(item);
    setConfirmOpen(true);
  };

  // perform delete (local only preview)
  const doDeleteLocal = () => {
    if (!pendingItem) return;
    const { regionKey, index } = pendingItem;
    setRawRows((prev) => {
      const copy = { ...prev };
      const arr = [...(copy[regionKey] || [])];
      if (index >= 0 && index < arr.length) {
        arr.splice(index, 1);
      }
      copy[regionKey] = arr;
      return copy;
    });
    setConfirmOpen(false);
    setPendingItem(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      {item._image ? (
        <FadeInImage source={{ uri: item._image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item._title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {labelFor(item.regionKey)}
          {item._category ? ` · ${item._category}` : ""}
        </Text>
      </View>

      {/* trash icon at right */}
      <TouchableOpacity
        onPress={() => onAskDelete(item)}
        style={styles.trashBtn}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 8 }} />
        <TextInput
          value={searchRaw}
          onChangeText={setSearchRaw}
          placeholder="Search for a dish..."
          style={{ flex: 1, paddingVertical: 8 }}
          returnKeyType="search"
        />
        {searchRaw.length > 0 && (
          <TouchableOpacity onPress={() => setSearchRaw("")} style={styles.clearBtn}>
            <Ionicons name="close" size={16} color="#111827" />
          </TouchableOpacity>
        )}
      </View>

      {/* region chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
        style={{ marginBottom: 8, height: 44 }}
      >
        {[
          { key: "all", label: "All" },
          ...REGION_ORDER.map((k) => ({ key: k, label: labelFor(k) })),
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

      {/* content */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={{ marginTop: 8, color: "#6b7280" }}>Loading…</Text>
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
              <Text style={{ marginTop: 6, color: "#9aa1ad" }}>No results found</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirmOpen(false)}>
          <View />
        </Pressable>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.modalTitle}>Are you sure you want to delete this dish?</Text>
            {pendingItem?.__title || pendingItem?._title ? (
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {pendingItem._title}
              </Text>
            ) : null}

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setConfirmOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnGhostTxt]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]} // 🔴 ปุ่ม Delete สีแดง (primary)
                onPress={doDeleteLocal}
                activeOpacity={0.9}
              >
                <Text style={styles.btnDangerTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ----------------- styles ----------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16 },

  // search
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

  // chips
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

  // list
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
  trashBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.border,
    marginLeft: 8,
  },

  // loading / empty
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 32 },

  // modal
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 16,
  },
  modalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fef3c7",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  modalSubtitle: { marginTop: 4, color: "#6b7280" },
  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 8,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnGhostTxt: { fontWeight: "800", color: "#111827" },

  // ✅ ปุ่ม Delete สีแดง เป็นปุ่มหลัก
  btnDanger: { backgroundColor: "#ef4444" },
  btnDangerTxt: { color: "#fff", fontWeight: "800" },
});
