// screens/FavoritesScreen.js
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { palette } from '../styles/colors';
import { Animated, Image } from 'react-native';

// ── util: label ภูมิภาค ─────────────────────────────────────────
const REGION_ORDER = ['northern', 'northeastern', 'central', 'southern'];
const labelFor = (key, isZH) => {
  const en = { northern: 'North', northeastern: 'Northeast', central: 'Central', southern: 'South' };
  const zh = { northern: '北部',   northeastern: '东北部',       central: '中部',   southern: '南部' };
  return (isZH ? zh : en)[key] || key;
};

// ── รูปแบบข้อมูล favorites ที่เก็บใน AsyncStorage ───────────────
// [
//   {
//     key: 'central:abc123' หรือ 'central:idx_42' (composite key),
//     regionKey: 'central' | 'northern' | 'northeastern' | 'southern',
//     dishId?: string,     // ถ้ามี id จริง
//     index?: number,      // ถ้าไม่มี id ให้เก็บ index ไว้
//     // preview เก็บไว้ให้แสดงผลเร็ว
//     title_en?: string, title_zh?: string,
//     image?: string,
//     category_en?: string, category_zh?: string,
//     addedAt: number
//   },
//   ...
// ]

// ── helper: AsyncStorage ─────────────────────────────────────────
const STORE_KEY = 'favorites:v1';

async function readFavorites() {
  const raw = await AsyncStorage.getItem(STORE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch { return []; }
}

async function saveFavorites(list) {
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(list ?? []));
}

async function removeFavoriteByKey(key) {
  const curr = await readFavorites();
  const next = curr.filter((x) => x.key !== key);
  await saveFavorites(next);
  return next;
}

// ── FadeInImage (ไม่ต้องติดตั้ง lib เพิ่ม) ─────────────────────
const FadeInImage = ({ style, ...props }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const onLoad = () =>
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  return <Animated.Image {...props} onLoad={onLoad} style={[style, { opacity }]} />;
};

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { i18n, t } = useTranslation();
  const isZH = i18n.language?.startsWith('zh');

  const [items, setItems] = useState([]);       // raw favorites (จาก storage)
  const [display, setDisplay] = useState([]);   // ผสมข้อมูลล่าสุดจาก Firestore แล้ว
  const [loading, setLoading] = useState(false);

  // Header: ปุ่ม EN/ZH ขวาบน
  const toggleLang = () => i18n.changeLanguage(isZH ? 'en' : 'zh');
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('favorites') || 'Favorites',
      headerRight: () => (
        <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.9}>
          <Text style={styles.langBtnText}>{isZH ? 'ZH' : 'EN'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isZH, t]);

  // โหลด favorites ทุกครั้งที่เข้าหน้านี้
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const favs = await readFavorites();
      setItems(favs);

      // สร้างแผนที่ region -> menu[] เพื่ออัปเดตรายละเอียดล่าสุด
      const byRegion = {};
      for (const f of favs) {
        if (!byRegion[f.regionKey]) byRegion[f.regionKey] = null;
      }

      // ดึงเอกสาร region ที่จำเป็น
      for (const regionKey of Object.keys(byRegion)) {
        const ref = doc(db, 'thai_food_guide', regionKey);
        const snap = await getDoc(ref);
        byRegion[regionKey] = snap.exists() && Array.isArray(snap.data()?.menus)
          ? snap.data().menus
          : [];
      }

      // ประกอบเป็นข้อมูลแสดงผล (ใช้ข้อมูลล่าสุดถ้ามี ไม่งั้นใช้ preview)
      const enriched = favs.map((f) => {
        const menus = byRegion[f.regionKey] || [];
        let m = null;
        if (f.dishId) m = menus.find(x => x?.id === f.dishId);
        if (!m && Number.isInteger(f.index)) m = menus[f.index];

        const title = isZH
          ? (m?.dish_zh || f.title_zh || f.title_en || '—')
          : (m?.dish_en || f.title_en || f.title_zh || '—');
        const category = isZH
          ? (m?.category_zh || f.category_zh || f.category_en || '')
          : (m?.category || f.category_en || f.category_zh || '');

        const image = m?.image_main_url || m?.image_detail_url || f.image || null;

        return {
          key: f.key,
          regionKey: f.regionKey,
          dishId: f.dishId,
          index: f.index,
          _title: title,
          _image: image,
          _category: category,
          _raw: m || null,
        };
      });

      setDisplay(enriched);
    } finally {
      setLoading(false);
    }
  }, [isZH]);

  useFocusEffect( // กลับเข้าหน้า → โหลดใหม่ (รองรับกรณีไปกดหัวใจจากหน้ารายละเอียดแล้วกลับมา)
    useCallback(() => { load(); }, [load])
  );

  const onRemove = async (item) => {
    const next = await removeFavoriteByKey(item.key);
    setItems(next);
    setDisplay((d) => d.filter((x) => x.key !== item.key));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('DishDetail', {
          dish: item._raw || undefined, // ถ้ามี raw ส่งไปด้วย
          regionKey: item.regionKey,
          index: item.index,
          dishId: item.dishId,
          from: 'favorites',
        })
      }
    >
      {item._image ? (
        <FadeInImage source={{ uri: item._image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={2}>{item._title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {labelFor(item.regionKey, isZH)}{item._category ? ` · ${item._category}` : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onRemove(item)} style={styles.iconBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} color="#9aa1ad" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {display.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={28} color="#9aa1ad" />
          <Text style={styles.emptyTitle}>{isZH ? '暂无收藏' : 'No favorites yet'}</Text>
          <Text style={styles.emptyHint}>
            {isZH ? '去菜品页面点击心形即可收藏' : 'Tap the heart on a dish to add it here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={display}
          keyExtractor={(it) => it.key}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={loading}
          onRefresh={load}
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16 },

  // Header language pill
  langBtn: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  langBtnText: { fontWeight: '700', color: palette.primary600 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  sep: { height: 1, backgroundColor: palette.border },

  thumb: {
    width: 64, height: 64, borderRadius: 12, marginRight: 12,
    backgroundColor: '#eee',
  },
  thumbPlaceholder: { backgroundColor: '#e5e7eb' },

  title: { fontSize: 16, fontWeight: '700', color: palette.ink },
  meta: { fontSize: 12, color: palette.ink60, marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: palette.border,
    marginRight: 6,
  },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 8, fontWeight: '700', color: palette.ink },
  emptyHint: { marginTop: 2, color: palette.ink60 },
});
