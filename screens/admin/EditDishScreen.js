// screens/admin/EditDishScreen.js
import React, { useEffect, useMemo, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { palette } from "../../styles/colors";

/** ---------- Sample dish (prefill) ---------- **/
const SAMPLE_DISH = {
  no: 1,
  dish_en_th: "Som Tam Thai (ส้มตำไทย)",
  dish_en: "Som Tam Thai (Thai-Style Spicy Green Papaya Salad)",
  dish_th: "ส้มตำไทย",
  dish_zh: "泰式青木瓜沙拉",
  pronunciation: "som tam thai",
  description_en:
    "Som Tam Thai is a vibrant Northeastern Thai green papaya salad. The shredded papaya is pounded with chilies, garlic, lime juice, fish sauce, and palm sugar, then tossed with tomatoes, long beans, and peanuts. A beloved street food known for its refreshing and spicy flavors.",
  description_zh:
    "泰式青木瓜沙拉，将青木瓜丝与辣椒、大蒜、青柠汁、鱼露和棕榈糖捣拌，加入番茄、长豆和花生，酸辣开胃，是广受欢迎的街头小吃。",
  ingredients_en: [
    "2 cups shredded green papaya",
    "1/2 cup shredded carrot",
    "6-8 cherry tomatoes, halved",
    "6-8 long beans, cut into 2-inch pieces",
    "2-3 cloves garlic",
    "3-5 bird’s eye chilies",
    "2 tablespoons fish sauce",
    "1 tablespoon palm sugar",
    "1 tablespoon tamarind juice",
    "2 tablespoons lime juice",
    "2 tablespoons roasted peanuts",
    "Fresh vegetables (optional, for serving)",
    "Rice noodles (optional, for serving)",
  ],
  ingredients_zh: [
    "2 杯青木瓜丝",
    "1/2 杯胡萝卜丝",
    "6-8 个小番茄，对半切",
    "6-8 根长豆，切段",
    "2-3 瓣大蒜",
    "3-5 个小米椒",
    "2 汤匙鱼露",
    "1 汤匙棕榈糖",
    "1 汤匙罗望子汁",
    "2 汤匙青柠汁",
    "2 汤匙烤花生",
    "新鲜蔬菜（可选）",
    "米粉（可选）",
  ],
  instructions_en: [
    "Step 1: Pound garlic and chilies. Add fish sauce, palm sugar, tamarind juice, and lime juice.",
    "Step 2: Add shredded green papaya, carrots, tomatoes, long beans. Mix gently.",
    "Step 3: Transfer to a plate. Top with peanuts. Serve with fresh vegetables or rice noodles.",
  ],
  instructions_zh: [
    "步骤1：将蒜末和辣椒捣碎，加入鱼露、棕榈糖、罗望子汁和青柠汁调味。",
    "步骤2：加入切丝的青木瓜、胡萝卜、小番茄和长豆，轻轻拌匀。",
    "步骤3：盛盘，撒上花生。可搭配新鲜蔬菜或米粉食用。",
  ],
  nutrition: [
    "Calories: 150 kcal",
    "Fat: 5g",
    "Protein: 5g",
    "Carbohydrates: 23g",
    "Sugar: 8g",
    "Sodium: 582mg",
  ],
  dietary_tags: ["Low Fat", "Low Sugar", "Vegetarian Option", "Spicy", "Gluten Free"],
  suitable_for: ["General Public", "Tourists", "Vegetarian", "Spicy Food Lovers", "Halal"],
  region: "northeastern",
  category: "salad",
  spicy_level: "(3) Hot",
  image_main_url:
    "https://firebasestorage.googleapis.com/v0/b/thaifoodguide-f109f.firebasestorage.app/o/northeastern%2F01-Som-Tam-main.jpg?alt=media",
  image_detail_url:
    "https://firebasestorage.googleapis.com/v0/b/thaifoodguide-f109f.firebasestorage.app/o/northeastern%2F01-Som-Tam-thumb.jpg?alt=media",
  tags: "salad, spicy, vegetarian option, northeastern, popular dish",
  recommend: "yes",
  available_season: "all year",
};

/** ---------- Options ---------- **/
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

export default function EditDishScreen() {
  // ── States (prefilled from SAMPLE_DISH) ─────────────────────────
  const [region, setRegion] = useState(SAMPLE_DISH.region);
  const [dish_en, setDishEn] = useState(SAMPLE_DISH.dish_en);
  const [dish_zh, setDishZh] = useState(SAMPLE_DISH.dish_zh);
  const [pronunciation, setPronunciation] = useState(SAMPLE_DISH.pronunciation || "");
  const [category, setCategory] = useState(SAMPLE_DISH.category || "");
  const [spicyLevel, setSpicyLevel] = useState(SAMPLE_DISH.spicy_level || "(3) Hot");
  const [season, setSeason] = useState(SAMPLE_DISH.available_season || "all year");
  const [recommend, setRecommend] = useState(
    String(SAMPLE_DISH.recommend || "").toLowerCase() === "yes"
  );
  const [tags, setTags] = useState(SAMPLE_DISH.tags || "");

  const [description_en, setDescriptionEn] = useState(SAMPLE_DISH.description_en || "");
  const [description_zh, setDescriptionZh] = useState(SAMPLE_DISH.description_zh || "");

  const [ingredients_en, setIngredientsEn] = useState(
    (SAMPLE_DISH.ingredients_en || []).join("\n")
  );
  const [ingredients_zh, setIngredientsZh] = useState(
    (SAMPLE_DISH.ingredients_zh || []).join("\n")
  );
  const [instructions_en, setInstructionsEn] = useState(
    (SAMPLE_DISH.instructions_en || []).join("\n")
  );
  const [instructions_zh, setInstructionsZh] = useState(
    (SAMPLE_DISH.instructions_zh || []).join("\n")
  );

  const [nutrition, setNutrition] = useState((SAMPLE_DISH.nutrition || []).join("\n"));
  const [dietary_tags, setDietaryTags] = useState(
    (SAMPLE_DISH.dietary_tags || []).join("\n")
  );
  const [suitable_for, setSuitableFor] = useState(
    (SAMPLE_DISH.suitable_for || []).join("\n")
  );

  const [image_main_url, setImageMainUrl] = useState(SAMPLE_DISH.image_main_url || "");
  const [image_detail_url, setImageDetailUrl] = useState(SAMPLE_DISH.image_detail_url || "");

  // ── Helpers ──────────────────────────────────────────────────────
  const toLines = (text) =>
    text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const buildPayload = useMemo(
    () => () => ({
      no: SAMPLE_DISH.no, // keep original for reference
      dish_en_th: dish_en && dish_zh ? `${dish_en} (${dish_zh})` : dish_en || "",
      dish_en: dish_en.trim(),
      // dish_th is not edited here
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
      region,
      category: category.trim(),
      spicy_level: spicyLevel,
      image_main_url: image_main_url.trim(),
      image_detail_url: image_detail_url.trim(),
      tags: tags.trim(),
      recommend: recommend ? "yes" : "no",
      available_season: season,
    }),
    [
      dish_en,
      dish_zh,
      pronunciation,
      description_en,
      description_zh,
      ingredients_en,
      ingredients_zh,
      instructions_en,
      instructions_zh,
      nutrition,
      dietary_tags,
      suitable_for,
      region,
      category,
      spicyLevel,
      image_main_url,
      image_detail_url,
      tags,
      recommend,
      season,
    ]
  );

  const onPreview = () => {
    const payload = buildPayload();
    Alert.alert("Preview JSON", JSON.stringify(payload, null, 2));
  };

  const onSave = () => {
    Alert.alert(
      "Not implemented",
      "This Edit form currently does not save to Firebase."
    );
  };

  const onResetToSample = () => {
    setRegion(SAMPLE_DISH.region);
    setDishEn(SAMPLE_DISH.dish_en);
    setDishZh(SAMPLE_DISH.dish_zh);
    setPronunciation(SAMPLE_DISH.pronunciation || "");
    setCategory(SAMPLE_DISH.category || "");
    setSpicyLevel(SAMPLE_DISH.spicy_level || "(3) Hot");
    setSeason(SAMPLE_DISH.available_season || "all year");
    setRecommend(String(SAMPLE_DISH.recommend || "").toLowerCase() === "yes");
    setTags(SAMPLE_DISH.tags || "");
    setDescriptionEn(SAMPLE_DISH.description_en || "");
    setDescriptionZh(SAMPLE_DISH.description_zh || "");
    setIngredientsEn((SAMPLE_DISH.ingredients_en || []).join("\n"));
    setIngredientsZh((SAMPLE_DISH.ingredients_zh || []).join("\n"));
    setInstructionsEn((SAMPLE_DISH.instructions_en || []).join("\n"));
    setInstructionsZh((SAMPLE_DISH.instructions_zh || []).join("\n"));
    setNutrition((SAMPLE_DISH.nutrition || []).join("\n"));
    setDietaryTags((SAMPLE_DISH.dietary_tags || []).join("\n"));
    setSuitableFor((SAMPLE_DISH.suitable_for || []).join("\n"));
    setImageMainUrl(SAMPLE_DISH.image_main_url || "");
    setImageDetailUrl(SAMPLE_DISH.image_detail_url || "");
  };

  const pickImage = async (setter) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setter(res.assets[0].uri);
  };

  // ── UI ───────────────────────────────────────────────────────────
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text style={styles.h1}>Edit Dish</Text>
      {/* <Text style={styles.note}>Editing sample dish data (not connected to Firebase yet).</Text> */}

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

      {/* Basic information */}
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Basic Information</Text>
      <LabeledInput label="Dish name (EN)" value={dish_en} onChangeText={setDishEn} />
      <LabeledInput label="Dish name (ZH)" value={dish_zh} onChangeText={setDishZh} />
      <LabeledInput label="Pronunciation (EN)" value={pronunciation} onChangeText={setPronunciation} />
      <LabeledInput label="Category" value={category} onChangeText={setCategory} />

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

      {/* Recommend toggle */}
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

      {/* Descriptions EN/ZH */}
      <Text style={styles.sectionTitle}>Descriptions</Text>
      <DualColumn>
        <LabeledTextarea label="Description (EN)" value={description_en} onChangeText={setDescriptionEn} />
        <LabeledTextarea label="Description (ZH)" value={description_zh} onChangeText={setDescriptionZh} />
      </DualColumn>

      {/* Ingredients EN/ZH */}
      <Text style={styles.sectionTitle}>Ingredients (one item per line)</Text>
      <DualColumn>
        <LabeledTextarea label="Ingredients (EN)" value={ingredients_en} onChangeText={setIngredientsEn} />
        <LabeledTextarea label="Ingredients (ZH)" value={ingredients_zh} onChangeText={setIngredientsZh} />
      </DualColumn>

      {/* Instructions EN/ZH */}
      <Text style={styles.sectionTitle}>Instructions (one step per line)</Text>
      <DualColumn>
        <LabeledTextarea label="Instructions (EN)" value={instructions_en} onChangeText={setInstructionsEn} />
        <LabeledTextarea label="Instructions (ZH)" value={instructions_zh} onChangeText={setInstructionsZh} />
      </DualColumn>

      {/* Other lists */}
      <Text style={styles.sectionTitle}>Nutrition (one item per line)</Text>
      <LabeledTextarea label="Nutrition" value={nutrition} onChangeText={setNutrition} />

      <Text style={styles.sectionTitle}>Dietary tags (one tag per line)</Text>
      <LabeledTextarea label="Dietary tags" value={dietary_tags} onChangeText={setDietaryTags} />

      <Text style={styles.sectionTitle}>Suitable for (one item per line)</Text>
      <LabeledTextarea label="Suitable for" value={suitable_for} onChangeText={setSuitableFor} />

      {/* Tags */}
      <LabeledInput label="Tags (comma separated)" value={tags} onChangeText={setTags} />

      {/* Images */}
      <Text style={styles.sectionTitle}>Images</Text>
      <LabeledInput label="Image main URL" value={image_main_url} onChangeText={setImageMainUrl} />
      {image_main_url ? <Image source={{ uri: image_main_url }} style={styles.preview} /> : <View style={[styles.preview, styles.previewPh]} />}
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickImage(setImageMainUrl)}>
        <Text style={styles.secondaryBtnTxt}>Choose main image</Text>
      </TouchableOpacity>

      <LabeledInput label="Image detail URL" value={image_detail_url} onChangeText={setImageDetailUrl} />
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
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onResetToSample}>
        <Text style={styles.secondaryBtnTxt}>Reset to sample</Text>
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
      <TextInput {...props} style={[styles.input, { height: 120, textAlignVertical: "top" }]} multiline />
    </View>
  );
}
function DualColumn({ children }) {
  const arr = React.Children.toArray(children);
  return <View style={styles.dual}>{arr}</View>;
}

/** ---- Styles ---- */
const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 4 },
  note: { color: "#6b7280", marginBottom: 8 },

  label: { fontSize: 12, fontWeight:"800", color: "#000", marginBottom: 4 }, // ✅ labels = black
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
  toggleTxt: { color: "#6b7280", fontWeight: "700" },

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
