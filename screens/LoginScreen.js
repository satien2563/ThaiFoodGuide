// screens/LoginScreen.js
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { palette } from '../styles/colors';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const isZH = i18n.language?.startsWith('zh');

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLang = () => i18n.changeLanguage(isZH ? 'en' : 'zh');
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isZH ? '登录' : 'Login',
      headerRight: () => (
        <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.9}>
          <Text style={styles.langBtnText}>{isZH ? 'ZH' : 'EN'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isZH]);

  const onLogin = async () => {
    if (!email || !pw) {
      Alert.alert(isZH ? '错误' : 'Error', isZH ? '请输入邮箱与密码' : 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      // ถ้าใช้ AuthGate ไม่ต้องนำทาง; ถ้าใช้แบบธรรมดา:
      navigation.goBack();
    } catch (e) {
      Alert.alert(isZH ? '登录失败' : 'Sign in failed', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!email) {
      Alert.alert(isZH ? '提示' : 'Hint', isZH ? '请输入邮箱以重置密码' : 'Enter your email to reset password');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(isZH ? '已发送' : 'Sent', isZH ? '请检查邮箱重置密码链接' : 'Check your email for reset link');
    } catch (e) {
      Alert.alert(isZH ? '失败' : 'Failed', e?.message || String(e));
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

        <TouchableOpacity onPress={onForgot} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
          <Text style={{ color: palette.primary600, fontWeight: '700' }}>{isZH ? '忘记密码？' : 'Forgot password?'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainBtn, { marginTop: 14 }]} onPress={onLogin} activeOpacity={0.9} disabled={loading}>
          <Text style={styles.mainBtnTxt}>{loading ? (isZH ? '正在登录…' : 'Signing in…') : (isZH ? '登录' : 'Sign in')}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>{isZH ? '没有账户？' : "Don't have an account?"} </Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={{ color: palette.primary600, fontWeight: '800' }}>{isZH ? '注册' : 'Sign up'}</Text>
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
