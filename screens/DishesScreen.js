import React from 'react';
import { View, Text } from 'react-native';

const DishesScreen = ({ route }) => {
  const { region } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Dishes from Region: {region}</Text>
    </View>
  );
};

export default DishesScreen;
