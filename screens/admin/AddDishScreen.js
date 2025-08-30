// screens/admin/AddDishScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../../styles/colors";

const REGIONS = [
  { key: "northern", label: "North" },
  { key: "northeastern", label: "Northeast" },
  { key: "central", label: "Central" },
  { key: "southern", label: "South" },
];

const SPICY_LEVELS = [
  { key: "(0) None", label: "None" },
  { key: "(1) Mild", label: "Mild" },
  { key: "(2) Medium", label: "Medium" },
  { key: "(3) Hot", label: "Hot" },
  { key: "(4) Very Hot", label: "Very Hot" },
  { key: "(5) Extreme", label: "Extreme" },
];

const SEASONS = [
  { key: "all year", label: "All year" },
  { key: "summer", label: "Summer" },
  { key: "rainy", label: "Rainy" },
  { key: "cool", label: "Cool" },
];

export default function AddDishScreen() {
  // --- basic fields ---
  const [region, setRegion] = useState("northeastern");
  const [dish_en, setDishEn] = useState("");
  const [dish_zh, setDishZh] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [category, setCategory] = useState("salad");
  const [spicyLevel, setSpicyLevel] = useState("(3) Hot");
  const [season, setSeason] = useState("all year");
  const [recommend, setRecommend] = useState(false);
  const [tags, setTags] = useState("salad, spicy, vegetarian option, northeastern, popular dish");

  // --- long text (dual column EN/ZH) ---
  const [description_en, setDescriptionEn] = useState("");
  const [description_zh, setDescriptionZh] = useState("");

  const [ingredients_en, setIngredientsEn] = useState("");
  const [ingredients_zh, setIngredientsZh] = useState("");

  const [instructions_en, setInstructionsEn] = useState("");
  const [instructions_zh, setInstructionsZh] = useState("");

  // --- other list fields ---
  const [nutrition, setNutrition] = useState("Calories: 150 kcal\nFat: 5g\nProtein: 5g");
  const [dietary_tags, setDietaryTags] = useState("Low Fat\nLow Sugar\nVegetarian Option\nSpicy\nGluten Free");
  const [suitable_for, setSuitableFor] = useState("General Public\nTourists\nVegetarian\nSpicy Food Lovers\nHalal");

  // --- images (URL or pick) ---
  const [image_main_url, setImageMainUrl] = useState("");
  const [image_detail_url, setImageDetailUrl] = useState("");

  const pickImage = async (setter) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) {
      setter(res.assets[0].uri);
    }
  };

  const toLines = (text) =>
    text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const buildPayload = () => {
    // สร้างโครง JSON ให้สอดคล้องกับตัวอย่าง (ไม่รวมเลข no และ dish_th)
    const payload = {
      // "no": (not assigned here)
      dish_en_th: dish_en && dish_zh ? `${dish_en} (${dish_zh})` : dish_en || "", // optional: ใช้รวมเพื่อพรีวิว
      dish_en: dish_en.trim(),
      // dish_th: "", // not used in this form
      dish_zh: dish_zh.trim(),
      pronunciation: pronunciation.trim(),
      description_en: description_en.trim(),
      description_zh: description_zh.trim(),
      ingredients_en: toLines(ingredients_en),
      ingredients_zh: toLines(ingredients_zh),
      instructions_en: toLines(instructions_en),
      instructions_zh: toLines(instructions_zh),
      nutrition: toLines(nutrition),
      dietary_tags: toLines(dietary_tags),
      suitable_for: toLines(suitable_for),
      region: region,
      category: category.trim(),
      spicy_level: spicyLevel,
      image_main_url: image_main_url.trim(),
      image_detail_url: image_detail_url.trim(),
      tags: tags.trim(), // เก็บเป็น string ก่อน (ภายหลังจะแปลง/แตกตามต้องการ)
      recommend: recommend ? "yes" : "no",
      available_season: season,
    };
    return payload;
  };

  const onPreview = () => {
    const payload = buildPayload();
    Alert.alert("Preview JSON", JSON.stringify(payload, null, 2));
  };

  const onSave = () => {
    Alert.alert("Not implemented", "This form currently does not save to Firebase.");
  };

  const onReset = () => {
    setDishEn("");
    setDishZh("");
    setPronunciation("");
    setCategory("");
    setSpicyLevel("(3) Hot");
    setSeason("all year");
    setRecommend(false);
    setTags("");
    setDescriptionEn("");
    setDescriptionZh("");
    setIngredientsEn("");
    setIngredientsZh("");
    setInstructionsEn("");
    setInstructionsZh("");
    setNutrition("");
    setDietaryTags("");
    setSuitableFor("");
    setImageMainUrl("");
    setImageDetailUrl("");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text style={styles.h1}>Add Dish</Text>

      {/* Region */}
      <Text style={styles.label}>Region</Text>
      <View style={styles.rowWrap}>
        {REGIONS.map((r) => {
          const active = region === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              onPress={() => setRegion(r.key)}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Basic info */}
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Basic Information</Text>
      <LabeledInput label="Dish name (EN)" value={dish_en} onChangeText={setDishEn} placeholder="Som Tam Thai" />
      <LabeledInput label="Dish name (ZH)" value={dish_zh} onChangeText={setDishZh} placeholder="泰式青木瓜沙拉" />
      <LabeledInput label="Pronunciation (EN)" value={pronunciation} onChangeText={setPronunciation} placeholder="som tam thai" />
      <LabeledInput label="Category" value={category} onChangeText={setCategory} placeholder="salad / curry / noodles ..." />

      {/* Spicy & Season */}
      <Text style={styles.label}>Spicy level</Text>
      <View style={styles.rowWrap}>
        {SPICY_LEVELS.map((lvl) => {
          const active = spicyLevel === lvl.key;
          return (
            <TouchableOpacity
              key={lvl.key}
              onPress={() => setSpicyLevel(lvl.key)}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{lvl.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Available season</Text>
      <View style={styles.rowWrap}>
        {SEASONS.map((s) => {
          const active = season === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSeason(s.key)}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recommend toggle (simple) */}
      <Text style={styles.label}>Recommend</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.toggleBtn, recommend && styles.toggleOn]}
          onPress={() => setRecommend((v) => !v)}
          activeOpacity={0.85}
        >
          <Ionicons name={recommend ? "checkmark-circle" : "ellipse-outline"} size={18} color={recommend ? "#fff" : palette.ink60} />
          <Text style={[styles.toggleTxt, recommend && { color: "#fff", fontWeight: "800" }]}>{recommend ? "YES" : "NO"}</Text>
        </TouchableOpacity>
      </View>

      {/* Descriptions (two-column EN/ZH) */}
      <Text style={styles.sectionTitle}>Descriptions</Text>
      <DualColumn>
        <LabeledTextarea label="Description (EN)" value={description_en} onChangeText={setDescriptionEn} placeholder="English description..." />
        <LabeledTextarea label="Description (ZH)" value={description_zh} onChangeText={setDescriptionZh} placeholder="中文简介…" />
      </DualColumn>

      {/* Ingredients (two-column EN/ZH) */}
      <Text style={styles.sectionTitle}>Ingredients (one item per line)</Text>
      <DualColumn>
        <LabeledTextarea label="Ingredients (EN)" value={ingredients_en} onChangeText={setIngredientsEn} placeholder={`2 cups shredded green papaya\n1/2 cup shredded carrot\n...`} />
        <LabeledTextarea label="Ingredients (ZH)" value={ingredients_zh} onChangeText={setIngredientsZh} placeholder={`2 杯青木瓜丝\n1/2 杯胡萝卜丝\n...`} />
      </DualColumn>

      {/* Instructions (two-column EN/ZH) */}
      <Text style={styles.sectionTitle}>Instructions (one step per line)</Text>
      <DualColumn>
        <LabeledTextarea label="Instructions (EN)" value={instructions_en} onChangeText={setInstructionsEn} placeholder={`Step 1: ...\nStep 2: ...`} />
        <LabeledTextarea label="Instructions (ZH)" value={instructions_zh} onChangeText={setInstructionsZh} placeholder={`步骤1：...\n步骤2：...`} />
      </DualColumn>

      {/* Other lists */}
      <Text style={styles.sectionTitle}>Nutrition (one item per line)</Text>
      <LabeledTextarea label="Nutrition" value={nutrition} onChangeText={setNutrition} placeholder={`Calories: 150 kcal\nFat: 5g\nProtein: 5g`} />

      <Text style={styles.sectionTitle}>Dietary tags (one tag per line)</Text>
      <LabeledTextarea label="Dietary tags" value={dietary_tags} onChangeText={setDietaryTags} placeholder={`Low Fat\nLow Sugar\nVegetarian Option\n...`} />

      <Text style={styles.sectionTitle}>Suitable for (one item per line)</Text>
      <LabeledTextarea label="Suitable for" value={suitable_for} onChangeText={setSuitableFor} placeholder={`General Public\nTourists\nVegetarian\n...`} />

      {/* Tags (comma-separated) */}
      <LabeledInput label="Tags (comma separated)" value={tags} onChangeText={setTags} placeholder="salad, spicy, vegetarian option, ..." />

      {/* Images */}
      <Text style={styles.sectionTitle}>Images</Text>
      <LabeledInput label="Image main URL" value={image_main_url} onChangeText={setImageMainUrl} placeholder="https://..." />
      {image_main_url ? <Image source={{ uri: image_main_url }} style={styles.preview} /> : <View style={[styles.preview, styles.previewPh]} />}

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickImage(setImageMainUrl)}>
        <Text style={styles.secondaryBtnTxt}>Choose main image</Text>
      </TouchableOpacity>

      <LabeledInput label="Image detail URL" value={image_detail_url} onChangeText={setImageDetailUrl} placeholder="https://..." />
      {image_detail_url ? <Image source={{ uri: image_detail_url }} style={styles.preview} /> : <View style={[styles.preview, styles.previewPh]} />}

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickImage(setImageDetailUrl)}>
        <Text style={styles.secondaryBtnTxt}>Choose detail image</Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={{ height: 8 }} />
      <TouchableOpacity style={styles.mainBtn} onPress={onPreview} activeOpacity={0.9}>
        <Text style={styles.mainBtnTxt}>Preview JSON</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.mainBtn, { backgroundColor: "#6b7280", marginTop: 8 }]} onPress={onSave} activeOpacity={0.9}>
        <Text style={styles.mainBtnTxt}>Save (not implemented)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onReset}>
        <Text style={styles.secondaryBtnTxt}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/** ---- Reusable Fields ---- */
function LabeledInput({ label, ...props }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} />
    </View>
  );
}

function LabeledTextarea({ label, ...props }) {
  return (
    <View style={{ marginTop: 10, flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, { height: 120, textAlignVertical: "top" }]}
        multiline
      />
    </View>
  );
}

function DualColumn({ children }) {
  // children ต้องมี 2 ตัว (EN / ZH)
  const arr = React.Children.toArray(children);
  return <View style={styles.dual}>{arr}</View>;
}

/** ---- Styles ---- */
const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 8 },

  label: { fontSize: 12, fontWeight:"800", color: "#111827", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    marginTop: 14,
    fontWeight: "900",
    color: "#111827",
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: palette.accent,
    alignSelf: "flex-start",
  },

  row: { flexDirection: "row", alignItems: "center" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 2 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  chipTxt: { color: "#111827", fontWeight: "600" },
  chipTxtActive: { color: palette.primary600 },

  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  toggleOn: { backgroundColor: palette.primary, borderColor: palette.primary },
  toggleTxt: { color: palette.ink60, fontWeight: "700" },

  dual: { flexDirection: "row", gap: 12, marginTop: 8 },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  previewPh: { backgroundColor: "#f3f4f6" },

  mainBtn: {
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  mainBtnTxt: { color: "#fff", fontWeight: "800" },

  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnTxt: { color: "#111827", fontWeight: "800" },
});
