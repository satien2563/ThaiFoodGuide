// App.js
import React, { useTransition } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { I18nextProvider } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DishDetail from "./screens/DishDetail";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { palette } from "./styles/colors";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

// Admin
import AdminHome from "./screens/admin/AdminHome";
import AddDishScreen from "./screens/admin/AddDishScreen";
import EditDishScreen from "./screens/admin/EditDishScreen";
import DeleteDishScreen from "./screens/admin/DeleteDishScreen";
import ManageUsersScreen from "./screens/admin/ManageUsersScreen";
import { use } from "react";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

//สร้างส่วนหัวสีเขียว
const greenHeader = {
  headerStyle: { backgroundColor: palette.primary },
  headerTitleStyle: { color: "#fff", fontWeight: "700" },
  headerTintColor: "#fff",
};

/** Stack ของแท็บ Home (มี DishDetail) */
function HomeStackScreen() {
 const { t } = useTranslation();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.primary },
        headerTitleStyle: { color: "#fff", fontWeight: "700" },
        headerTintColor: "#fff",
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: t("home") }}
      />
      <HomeStack.Screen
        name="DishDetail"
        component={DishDetail}
        options={{ title: "Dish Detail" }} // หรือทำ key แปลเองภายหลัง
      />
    </HomeStack.Navigator>
  );
}
/** Stack สำหรับส่วนผู้ดูแลระบบ */
function AdminStackScreen() {
  return (
    <AdminStack.Navigator
    screenOptions={{
        headerStyle: { backgroundColor: palette.primary }, // ✅ เขียว
        headerTitleStyle: { color: '#fff', fontWeight: '700' }, // ชื่อหัวข้อสีขาว
        headerTintColor: '#fff', // สีไอคอน back ฯลฯ
      }}
    >
      <AdminStack.Screen name="AdminHome" component={AdminHome} options={{ title: "Admin" }} />
      <AdminStack.Screen name="AddDish" component={AddDishScreen} options={{ title: "Add Dish" }} />
      <AdminStack.Screen name="EditDish" component={EditDishScreen} options={{ title: "Edit Dish" }} />
      <AdminStack.Screen name="DeleteDish" component={DeleteDishScreen} options={{ title: "Delete Dish" }} />
      <AdminStack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ title: "Manage Users" }} />
    </AdminStack.Navigator>
  );
}

/** แท็บหลักของแอป */
function MainTabs() {
  const {t} = useTranslation();

  const tabGreen = {
    headerShown: true,
    headerStyle: { backgroundColor: palette.primary },
    headerTitleStyle: { color: "#fff", fontWeight: "700" },
    headerTintColor: "#fff",

    // ✅ ปรับแถบล่างเป็นพื้นเขียว ตัวอักษร/ไอคอนสีขาว
    tabBarStyle: { backgroundColor: palette.primary, borderTopColor: "transparent" },
    tabBarActiveTintColor: "#fff",
    tabBarInactiveTintColor: "rgba(255,255,255,0.85)", // ขาวจางนิดๆอ่านง่าย
    tabBarLabelStyle: { fontWeight: "600" },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabGreen,
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";
          if (route.name === "Search") iconName = "search-outline";
          else if (route.name === "Favorites") iconName = "heart-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ headerShown: false, tabBarLabel: t("home") }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: t("search"), tabBarLabel: t("search") }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: t("favorites"), tabBarLabel: t("favorites") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("profile"), tabBarLabel: t("profile") }}
      />
    </Tab.Navigator>
  );
}
export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={palette.primary} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          {/* ✅ Admin stack อยู่ที่ root stack */}
          <Stack.Screen name="Admin" component={AdminStackScreen} />
          {/* หน้าพิเศษอื่น ๆ */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: "Login", ...greenHeader }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: "Register", ...greenHeader }} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}
