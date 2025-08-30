import React, { useState } from "react";
import { View, Button, TextInput, Alert } from "react-native";
import { db } from "../../config/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import uuid from 'react-native-uuid'; // ใช้สำหรับสร้าง userId เอง

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ใช้เก็บไว้เพื่ออ้างอิง หรือส่งไป API ภายนอกในอนาคต
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      // สร้าง userId เอง (ไม่ใช้จาก Firebase Auth)
      const userId = uuid.v4();

      await setDoc(doc(collection(db, "users"), userId), {
        name,
        email,
        password, // ❗อย่าใส่ในระบบจริงโดยไม่เข้ารหัส
        createdAt: serverTimestamp(),
      });

      Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อยแล้ว");
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="ชื่อ" value={name} onChangeText={setName} />
      <TextInput placeholder="อีเมล" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="สมัครสมาชิก" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
