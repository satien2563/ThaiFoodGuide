import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { db } from '../config/firebaseConfig'; // Web SDK
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [recommendedDishes, setRecommendedDishes] = useState([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const q = query(
          collection(db, 'dishes'),
          where('recommend', '==', true),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const dishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecommendedDishes(dishes);
      } catch (error) {
        console.error('Error fetching recommended dishes:', error);
      }
    };

    fetchRecommended();
  }, []);

  const regions = [
    { key: 'central', label: 'Central', image: require('../assets/images/central.jpg') },
    { key: 'northern', label: 'North', image: require('../assets/images/north.jpg') },
    { key: 'northeastern', label: 'Isaan', image: require('../assets/images/isaan.jpg') },
    { key: 'southern', label: 'South', image: require('../assets/images/south.jpg') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thai Food Guide</Text>

      <Text style={styles.section}>{t('explore_by_region')}</Text>
      <View style={styles.regionContainer}>
        {regions.map((region) => (
          <TouchableOpacity
            key={region.key}
            style={styles.regionCard}
            onPress={() => navigation.navigate('Dishes', { region: region.key })}>
            <Image source={region.image} style={styles.regionImage} />
            <Text style={styles.regionLabel}>{region.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>{t('recommended')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommendedDishes.map(dish => (
          <TouchableOpacity
            key={dish.id}
            style={styles.dishCard}
            onPress={() => navigation.navigate('DishDetail', { dishId: dish.id })}>
            <Image source={{ uri: dish.image_main_url }} style={styles.dishImage} />
            <Text style={styles.dishName}>{dish.dish_en_th}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Map')}>
        <Text style={styles.buttonText}>📍 {t('map')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Favorites')}>
        <Text style={styles.buttonText}>❤️ {t('favorites')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  regionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  regionCard: { width: '48%', marginBottom: 12, alignItems: 'center' },
  regionImage: { width: '100%', height: 100, borderRadius: 8 },
  regionLabel: { marginTop: 8, fontSize: 16 },
  dishCard: { width: 150, marginRight: 12 },
  dishImage: { width: '100%', height: 100, borderRadius: 8 },
  dishName: { marginTop: 4, fontSize: 14 },
  button: {
    marginTop: 16,
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { fontSize: 16 }
});

export default HomeScreen;
