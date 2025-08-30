// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// หน้าหลักที่แสดงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
export default function HomeScreen() {
  // State สำหรับเก็บข้อมูลผู้ใช้ที่ได้จาก Firestore
  const [userData, setUserData] = useState(null);

  // State สำหรับแสดงสถานะการโหลดข้อมูล (Loading)
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลผู้ใช้จาก Firestore เมื่อหน้าจอโหลดเสร็จ
  useEffect(() => {
    const fetchUserData = async () => {
      // เรียกข้อมูลผู้ใช้ปัจจุบันที่ Login อยู่ (จาก Firebase Authentication)
      const user = auth.currentUser;

      if (user) {
        // อ้างอิงไปยังเอกสารของผู้ใช้ใน Firestore โดยใช้ user.uid
        const docRef = doc(db, "users", user.uid);

        // ดึงข้อมูลผู้ใช้จาก Firestore
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // เก็บข้อมูลลง State ถ้ามีข้อมูลอยู่จริง
          setUserData(docSnap.data());
        } else {
          // แสดงข้อความในกรณีไม่พบข้อมูลผู้ใช้ใน Firestore
          console.log("ไม่พบข้อมูลผู้ใช้");
        }
      }

      // เมื่อดึงข้อมูลเสร็จสิ้น ให้หยุดแสดงสถานะ Loading
      setLoading(false);
    };

    fetchUserData(); // เรียกฟังก์ชันเพื่อดึงข้อมูล
  }, []); // ทำงานเฉพาะตอน Component โหลดครั้งแรก

  // หากข้อมูลกำลังโหลด ให้แสดงตัว Loading
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // เมื่อโหลดข้อมูลเสร็จ แสดงข้อมูลผู้ใช้บนหน้าจอ
  return (
    <View style={{ padding: 20 }}>
      {userData ? (
        <>
          {/* แสดงชื่อผู้ใช้จาก Firestore */}
          <Text style={{ fontSize: 18 }}>ยินดีต้อนรับ: {userData.name}</Text>

          {/* แสดงอีเมลของผู้ใช้ */}
          <Text>อีเมลของคุณคือ: {userData.email}</Text>
        </>
      ) : (
        // แสดงข้อความเมื่อไม่พบข้อมูลผู้ใช้
        <Text>ไม่พบข้อมูลผู้ใช้</Text>
      )}
    </View>
  );
}
