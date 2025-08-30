import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./components/Auth/LoginScreen";
import RegisterScreen from "./components/Auth/RegisterScreen";
import AppNavigator from "./navigation/AppNavigator"; // ← Bottom Tab

import './i18n'; // ← โหลดการตั้งค่า i18n
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null); // จัดการเองแบบ local state หรือภายหลังใช้ AuthContext ก็ได้

  // 🧪 ชั่วคราว: ตัวอย่าง Login สำเร็จ → จำลองการ login
  const isLoggedIn = user !== null;

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="MainApp">
              {props => <AppNavigator {...props} user={user} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Login">
                {props => <LoginScreen {...props} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {props => <RegisterScreen {...props} setUser={setUser} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}
