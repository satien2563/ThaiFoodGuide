// components/Food/FoodList.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

export default function FoodList() {
  const [foods, setFoods] = useState([]);

  const fetchFoods = async () => {
    const querySnapshot = await getDocs(collection(db, "foods"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFoods(data);
  };

  React.useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View>
      {foods.map((food) => (
        <Text key={food.id}>{food.name}</Text>
      ))}
    </View>
  );
}
