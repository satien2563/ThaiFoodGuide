import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function RegionMenuScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { region } = route.params;

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const docRef = doc(db, "thai_food_guide", region);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().menus || [];
        setMenus(data);
      }
    } catch (error) {
      console.error("Error fetching region data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_detail_url }} style={styles.image} />
      <Text style={styles.name}>
        {i18n.language === "zh" ? item.dish_zh : item.dish_en}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {i18n.language === "zh"
          ? item.description_zh
          : item.description_en || ""}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(region)}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#666" />
      ) : (
        <FlatList
          data={menus}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${region}-${index}`}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    elevation: 1,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
