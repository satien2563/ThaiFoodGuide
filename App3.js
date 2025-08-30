import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { I18nextProvider } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { palette }  from './styles/colors';
import DishDetail from "./screens/DishDetail";

// นำเข้าหน้าที่ยังไม่ใช้งานออกไปก่อน
// import LoginScreen from './screens/LoginScreen';
// import RegionMenuScreen from './screens/RegionMenuScreen';

import i18n from "./i18n";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: "#10b981" }, // เขียวหลัก
        headerTitleStyle: { color: "#fff", fontWeight: "700" },
        headerTintColor: "#fff",

        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e7eb" },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Search":
              iconName = "search-outline";
              break;
            case "Favorites":
              iconName = "heart-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          {/* ถ้าต้องการใช้งานทีหลัง สามารถเพิ่มกลับมาได้ */}
          {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
          {/* <Stack.Screen name="RegionMenu" component={RegionMenuScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}
