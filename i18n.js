// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  // ตรวจ locale ว่าขึ้นต้นด้วย zh หรือไม่ ถ้าใช่ให้ตั้งเป็น zh, ไม่เช่นนั้นใช้ en
    lng: 'en',           // ภาษาเริ่มต้นเป็นอังกฤษเสมอ
    fallbackLng: 'en',   // ถ้า key หาย ให้กลับไปใช้ en
    supportedLngs: ['en', 'zh'],
    interpolation: { escapeValue: false },
});

export default i18n;
