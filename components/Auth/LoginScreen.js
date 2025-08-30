import React from "react";
import { View, TouchableOpacity, Text, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();

  const handleLoginGoogle = async () => {
    // TODO: ใส่ logic การ Login ด้วย Google ที่ใช้ expo-auth-session
    Alert.alert("Login", "กำลังเข้าสู่ระบบด้วย Google (ตัวอย่าง)");
  };

  const handleLoginFacebook = async () => {
    // TODO: ใส่ logic การ Login ด้วย Facebook ที่ใช้ expo-auth-session
    Alert.alert("Login", "กำลังเข้าสู่ระบบด้วย Facebook (ตัวอย่าง)");
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Login with Google" onPress={handleLoginGoogle} />
      <View style={{ height: 12 }} />
      <Button title="Login with Facebook" onPress={handleLoginFacebook} />

      {/* เพิ่มปุ่มไปยังหน้าสมัครสมาชิกหรือข้อมูลเพิ่มเติม */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: "#007BFF" }}>
          ยังไม่มีบัญชี? สมัครสมาชิก
        </Text>
      </TouchableOpacity>
    </View>
  );
}
