import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../styles/colors';

const items = [
  { icon: 'add-circle-outline', label: 'Add Dish', to: 'AddDish' },
  { icon: 'create-outline',     label: 'Edit Dish', to: 'EditDish' },
  { icon: 'trash-outline',      label: 'Delete Dish', to: 'DeleteDish' },
  { icon: 'people-outline',     label: 'Manage Users', to: 'ManageUsers' },
];

export default function AdminHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>
      <View style={styles.grid}>
        {items.map((it) => (
          <TouchableOpacity
            key={it.label}
            style={styles.card}
            onPress={() => navigation.navigate(it.to)}
            activeOpacity={0.9}
          >
            <Ionicons name={it.icon} size={26} color={palette.primary600} />
            <Text style={styles.cardTxt}>{it.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  title:{ fontSize:22, fontWeight:'800', marginBottom:12, color:'#111827' },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  card:{
    width:'48%', borderWidth:1, borderColor:'#e5e7eb', borderRadius:16,
    paddingVertical:22, backgroundColor:'#fff', alignItems:'center', marginBottom:12,
  },
  cardTxt:{ marginTop:8, fontWeight:'700', color:'#111827' },
});
