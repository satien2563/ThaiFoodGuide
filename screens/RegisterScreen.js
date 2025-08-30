// screens/RegisterScreen.js
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { palette } from '../styles/colors';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const isZH = i18n.language?.startsWith('zh');

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLang = () => i18n.changeLanguage(isZH ? 'en' : 'zh');
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isZH ? '注册' : 'Register',        
      headerRight: () => (
        <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.9}>
          <Text style={styles.langBtnText}>{isZH ? 'ZH' : 'EN'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isZH]);

  const onRegister = async () => {
    if (!email || !pw || !pw2) {
      Alert.alert(isZH ? '错误' : 'Error', isZH ? '请填写所有字段' : 'Please fill all fields');
      return;
    }
    if (pw !== pw2) {
      Alert.alert(isZH ? '错误' : 'Error', isZH ? '两次密码不一致' : 'Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      const defaultName = email.split('@')[0];
      await updateProfile(cred.user, { displayName: defaultName });
      Alert.alert(isZH ? '注册成功' : 'Account created', isZH ? '欢迎使用！' : 'Welcome!');
      navigation.replace('Login');
    } catch (e) {
      Alert.alert(isZH ? '注册失败' : 'Sign up failed', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>{isZH ? '邮箱' : 'Email'}</Text>
        <TextInput
          value={email} onChangeText={setEmail}
          style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"
        />

        <Text style={[styles.label, { marginTop: 8 }]}>{isZH ? '密码' : 'Password'}</Text>
        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
          <TextInput
            value={pw} onChangeText={setPw}
            style={{ flex: 1, paddingVertical: 0 }}
            secureTextEntry={!showPw}
            placeholder={isZH ? '请输入密码' : 'Enter password'}
          />
          <TouchableOpacity onPress={() => setShowPw(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 8 }]}>{isZH ? '确认密码' : 'Confirm password'}</Text>
        <TextInput
          value={pw2} onChangeText={setPw2} style={styles.input} secureTextEntry={!showPw}
          placeholder={isZH ? '再次输入密码' : 'Re-enter password'}
        />

        <TouchableOpacity style={[styles.mainBtn, { marginTop: 14 }]} onPress={onRegister} activeOpacity={0.9} disabled={loading}>
          <Text style={styles.mainBtnTxt}>{loading ? (isZH ? '正在注册…' : 'Signing up…') : (isZH ? '注册' : 'Sign up')}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>{isZH ? '已经有账户？' : 'Already have an account?'} </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={{ color: palette.primary600, fontWeight: '800' }}>{isZH ? '登录' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 16, justifyContent: 'flex-start' },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: '#fff' },
  label: { fontSize: 12, color: '#6b7280' },
  input: {
    marginTop: 4, borderWidth: 1, borderColor: palette.border,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff',
  },
  mainBtn: { backgroundColor: palette.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  mainBtnTxt: { color: '#fff', fontWeight: '800' },
  langBtn: {
    marginRight: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  langBtnText: { fontWeight: '700', color: palette.primary600 },
});
