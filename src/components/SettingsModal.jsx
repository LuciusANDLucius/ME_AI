import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Pressable,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { POLLINATIONS_MODELS } from '@/constants/ai-presets';
import { DEFAULT_SETTINGS } from '@/services/ai-service';

const ACCENT_COLORS = [
  { id: '#a855f7', name: 'Electric Violet', hex: '#a855f7' },
  { id: '#38bdf8', name: 'Cyber Sky', hex: '#38bdf8' },
  { id: '#10b981', name: 'Emerald', hex: '#10b981' },
  { id: '#ec4899', name: 'Rose Pink', hex: '#ec4899' },
  { id: '#f59e0b', name: 'Amber Gold', hex: '#f59e0b' },
];

const THEME_OPTIONS = [
  { id: 'dark', name: 'Dark Cyber', desc: 'Đen xám công nghệ', bg: '#090d16', border: '#1e293b' },
  { id: 'oled', name: 'OLED Black', desc: 'Đen tuyền tiết kiệm pin', bg: '#000000', border: '#27272a' },
  { id: 'midnight', name: 'Midnight', desc: 'Xanh đen ngân hà', bg: '#0a1128', border: '#1c2541' },
  { id: 'light', name: 'Clean Light', desc: 'Sáng tối giản hiện đại', bg: '#f8fafc', border: '#cbd5e1' },
];

export function SettingsModal({
  visible,
  settings,
  onSaveSettings,
  onSave,
  onClose,
}) {
  const current = settings || DEFAULT_SETTINGS;
  const [accentColor, setAccentColor] = useState(current.accentColor || '#a855f7');
  const [themeMode, setThemeMode] = useState(current.themeMode || 'dark');

  // Text-to-Image Settings
  const [textImageEngine, setTextImageEngine] = useState(
    current.textImageEngine || current.imageEngine || 'gen-pollinations'
  );
  const [pollinationsApiKey, setPollinationsApiKey] = useState(
    current.pollinationsApiKey || DEFAULT_SETTINGS.pollinationsApiKey
  );
  const [pollinationsModel, setPollinationsModel] = useState(
    current.pollinationsModel || DEFAULT_SETTINGS.pollinationsModel
  );

  // Image-to-Image Settings (FLUX.3 Klein Edit)
  const [kieApiKey, setKieApiKey] = useState(current.kieApiKey || DEFAULT_SETTINGS.kieApiKey);
  const [kieResolution, setKieResolution] = useState(current.kieResolution || '1K');
  const [kieOutputFormat, setKieOutputFormat] = useState(current.kieOutputFormat || 'png');

  // Assistant / Gemini
  const [apiKey, setApiKey] = useState(current.geminiApiKey || '');
  const [autoEnhance, setAutoEnhance] = useState(current.autoEnhancePrompt ?? true);

  const [showKieKey, setShowKieKey] = useState(false);
  const [showPollinationsKey, setShowPollinationsKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (visible && settings) {
      setAccentColor(settings.accentColor || '#a855f7');
      setThemeMode(settings.themeMode || 'dark');
      setTextImageEngine(settings.textImageEngine || settings.imageEngine || 'gen-pollinations');
      setPollinationsApiKey(settings.pollinationsApiKey || DEFAULT_SETTINGS.pollinationsApiKey);
      setPollinationsModel(settings.pollinationsModel || DEFAULT_SETTINGS.pollinationsModel);
      setKieApiKey(settings.kieApiKey || DEFAULT_SETTINGS.kieApiKey);
      setKieResolution(settings.kieResolution || '1K');
      setKieOutputFormat(settings.kieOutputFormat || 'png');
      setApiKey(settings.geminiApiKey || '');
      setAutoEnhance(settings.autoEnhancePrompt ?? true);
    }
  }, [visible, settings]);

  const handleSave = () => {
    try {
      const updated = {
        ...settings,
        accentColor: accentColor || '#a855f7',
        themeMode: themeMode || 'dark',
        textImageEngine: textImageEngine || 'gen-pollinations',
        imageEngine: textImageEngine || 'gen-pollinations',
        pollinationsApiKey: (pollinationsApiKey || '').trim() || DEFAULT_SETTINGS.pollinationsApiKey,
        pollinationsModel: pollinationsModel || DEFAULT_SETTINGS.pollinationsModel,
        editImageEngine: 'kie-flux3',
        kieApiKey: (kieApiKey || '').trim() || DEFAULT_SETTINGS.kieApiKey,
        kieResolution: kieResolution || '1K',
        kieOutputFormat: kieOutputFormat || 'png',
        geminiApiKey: (apiKey || '').trim(),
        autoEnhancePrompt: Boolean(autoEnhance),
      };

      const saveCallback = onSaveSettings || onSave;
      if (typeof saveCallback === 'function') {
        saveCallback(updated);
      }
      onClose();
    } catch (err) {
      console.warn('Lỗi khi lưu cấu hình:', err);
      Alert.alert('Lỗi', 'Không thể lưu cấu hình: ' + (err.message || err));
    }
  };

  const handleOpenPollinationsDocs = () => {
    Linking.openURL('https://gen.pollinations.ai/docs#tag/image/GET/image/{prompt}');
  };

  const handleOpenPollinationsKeys = () => {
    Linking.openURL('https://enter.pollinations.ai/keys');
  };

  const handleOpenKieAi = () => {
    Linking.openURL('https://kie.ai');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBadge, { backgroundColor: `${accentColor}25` }]}>
                <AppIcon name="settings" size={17} color={accentColor} />
              </View>
              <Text style={styles.title}>Cài đặt & Tùy biến Studio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. GIAO DIỆN & MÀU SẮC */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: accentColor }]}>1. Tùy chỉnh Giao diện</Text>

              {/* Accent Color Picker */}
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Màu nhấn chủ đạo (Accent Color):</Text>
                <View style={styles.colorRow}>
                  {ACCENT_COLORS.map((col) => {
                    const isSelected = accentColor === col.id;
                    return (
                      <TouchableOpacity
                        key={col.id}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: col.hex },
                          isSelected && styles.colorCircleActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setAccentColor(col.id)}>
                        {isSelected && <AppIcon name="check" size={12} color="#ffffff" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Theme Mode Picker */}
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Chủ đề hiển thị:</Text>
                <View style={styles.themeGrid}>
                  {THEME_OPTIONS.map((thm) => {
                    const isSelected = themeMode === thm.id;
                    return (
                      <TouchableOpacity
                        key={thm.id}
                        style={[
                          styles.themeCard,
                          { backgroundColor: thm.bg, borderColor: isSelected ? accentColor : thm.border },
                          isSelected && { borderWidth: 2 },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setThemeMode(thm.id)}>
                        <Text style={[styles.themeCardName, { color: thm.id === 'light' ? '#0f172a' : '#ffffff' }]}>
                          {thm.name}
                        </Text>
                        <Text style={[styles.themeCardDesc, { color: thm.id === 'light' ? '#64748b' : '#94a3b8' }]}>
                          {thm.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 2. CẤU HÌNH TEXT TO IMAGE */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>2. Động cơ Text to Image (Tạo ảnh)</Text>
                <TouchableOpacity onPress={handleOpenPollinationsDocs}>
                  <Text style={[styles.linkText, { color: accentColor }]}>Docs API ↗</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionNote}>Chọn công nghệ AI sử dụng khi tạo ảnh từ mô tả chữ</Text>

              {/* Engine Selector */}
              <View style={styles.engineRow}>
                {/* Gen Pollinations */}
                <TouchableOpacity
                  style={[
                    styles.engineOption,
                    textImageEngine === 'gen-pollinations' && { borderColor: accentColor, backgroundColor: `${accentColor}15` },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setTextImageEngine('gen-pollinations')}>
                  <View style={styles.engineHeaderRow}>
                    <AppIcon name="sparkles" size={15} color={textImageEngine === 'gen-pollinations' ? accentColor : '#94a3b8'} />
                    <View style={[styles.badgePill, { backgroundColor: `${accentColor}25` }]}>
                      <Text style={[styles.badgePillText, { color: accentColor }]}>Khuyên dùng</Text>
                    </View>
                  </View>
                  <Text style={styles.engineTitle}>Gen Pollinations</Text>
                  <Text style={styles.engineDesc}>Tốc độ cao, hỗ trợ FLUX.1, GPT Image, Z-Image</Text>
                </TouchableOpacity>

                {/* Kie.ai FLUX.3 */}
                <TouchableOpacity
                  style={[
                    styles.engineOption,
                    textImageEngine === 'kie-flux3' && { borderColor: accentColor, backgroundColor: `${accentColor}15` },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setTextImageEngine('kie-flux3')}>
                  <View style={styles.engineHeaderRow}>
                    <AppIcon name="zap" size={15} color={textImageEngine === 'kie-flux3' ? accentColor : '#94a3b8'} />
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>FLUX.3</Text>
                    </View>
                  </View>
                  <Text style={styles.engineTitle}>FLUX.3 Klein</Text>
                  <Text style={styles.engineDesc}>Chi tiết điện ảnh, 1K/2K resolution</Text>
                </TouchableOpacity>

                {/* Free Engine */}
                <TouchableOpacity
                  style={[
                    styles.engineOption,
                    textImageEngine === 'pollinations-flux' && { borderColor: accentColor, backgroundColor: `${accentColor}15` },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setTextImageEngine('pollinations-flux')}>
                  <View style={styles.engineHeaderRow}>
                    <AppIcon name="image" size={15} color={textImageEngine === 'pollinations-flux' ? accentColor : '#94a3b8'} />
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>Free</Text>
                    </View>
                  </View>
                  <Text style={styles.engineTitle}>Flux Free</Text>
                  <Text style={styles.engineDesc}>Không giới hạn, không cần API Key</Text>
                </TouchableOpacity>
              </View>

              {/* Gen Pollinations Settings Block */}
              {textImageEngine === 'gen-pollinations' && (
                <View style={styles.subCard}>
                  <View style={styles.labelRow}>
                    <Text style={styles.subCardTitle}>API Key Pollinations:</Text>
                    <TouchableOpacity onPress={handleOpenPollinationsKeys}>
                      <Text style={[styles.linkTextSmall, { color: accentColor }]}>Quản lý Key ↗</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.keyInput}
                      placeholder="sk_... hoặc pk_..."
                      placeholderTextColor="#64748b"
                      secureTextEntry={!showPollinationsKey}
                      value={pollinationsApiKey}
                      onChangeText={setPollinationsApiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPollinationsKey(!showPollinationsKey)} style={styles.eyeBtn}>
                      <Text style={styles.eyeText}>{showPollinationsKey ? 'Ẩn' : 'Hiện'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.subCardTitle, { marginTop: 12 }]}>Model AI Text-to-Image:</Text>
                  <View style={styles.modelListCol}>
                    {POLLINATIONS_MODELS.map((pm) => {
                      const isSel = pollinationsModel === pm.id;
                      return (
                        <TouchableOpacity
                          key={pm.id}
                          style={[
                            styles.modelItem,
                            isSel && { borderColor: accentColor, backgroundColor: `${accentColor}18` },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setPollinationsModel(pm.id)}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.modelItemName, isSel && { color: '#ffffff', fontWeight: '800' }]}>
                              {pm.name}
                            </Text>
                            <Text style={styles.modelItemDesc}>{pm.desc}</Text>
                          </View>
                          <View style={[styles.modelBadgePill, isSel && { backgroundColor: accentColor }]}>
                            <Text style={styles.modelBadgePillText}>{pm.badge}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* 3. CẤU HÌNH IMAGE TO IMAGE (FLUX.3 KLEIN EDIT) */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>3. Chỉnh sửa ảnh (Image-to-Image FLUX)</Text>
                <TouchableOpacity onPress={handleOpenKieAi}>
                  <Text style={[styles.linkText, { color: accentColor }]}>Kie.ai Token ↗</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionNote}>
                Sử dụng mô hình chuẩn docs FLUX: <Text style={{ color: '#38bdf8', fontWeight: '700' }}>flux-3/klein-edit-image</Text> nhận ảnh gốc và câu lệnh biến đổi.
              </Text>

              <View style={styles.subCard}>
                <Text style={styles.subCardTitle}>Kie.ai API Bearer Token:</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.keyInput}
                    placeholder="Bearer token (ví dụ: 348d97...)"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showKieKey}
                    value={kieApiKey}
                    onChangeText={setKieApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowKieKey(!showKieKey)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showKieKey ? 'Ẩn' : 'Hiện'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Resolution & Format */}
                <View style={styles.paramGrid}>
                  <View style={styles.paramItem}>
                    <Text style={styles.paramLabel}>Độ phân giải:</Text>
                    <View style={styles.segGroup}>
                      {['1K', '2K'].map((res) => (
                        <TouchableOpacity
                          key={res}
                          style={[styles.segBtn, kieResolution === res && { backgroundColor: accentColor }]}
                          onPress={() => setKieResolution(res)}>
                          <Text style={[styles.segBtnText, kieResolution === res && { color: '#ffffff', fontWeight: '800' }]}>
                            {res}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.paramItem}>
                    <Text style={styles.paramLabel}>Định dạng ảnh:</Text>
                    <View style={styles.segGroup}>
                      {['png', 'jpeg', 'webp'].map((fmt) => (
                        <TouchableOpacity
                          key={fmt}
                          style={[styles.segBtn, kieOutputFormat === fmt && { backgroundColor: accentColor }]}
                          onPress={() => setKieOutputFormat(fmt)}>
                          <Text style={[styles.segBtnText, kieOutputFormat === fmt && { color: '#ffffff', fontWeight: '800' }]}>
                            {fmt.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. TỐI ƯU HÓA PROMPT & TRỢ LÝ */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: accentColor }]}>4. Tối ưu hóa & Trợ lý Vision</Text>
              <View style={styles.switchBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Tự động hoàn thiện Prompt 8K</Text>
                  <Text style={styles.switchDesc}>Thêm chi tiết ánh sáng điện ảnh, sắc nét, góc máy chuyên nghiệp</Text>
                </View>
                <Switch
                  value={autoEnhance}
                  onValueChange={setAutoEnhance}
                  trackColor={{ false: '#334155', true: accentColor }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Gemini Key */}
              <View style={[styles.subCard, { marginTop: 10 }]}>
                <Text style={styles.subCardTitle}>Google Gemini API Key (Tùy chọn cho Vision):</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.keyInput}
                    placeholder="AIzaSy... (nếu muốn dùng trợ lý chat thông minh)"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showGeminiKey}
                    value={apiKey}
                    onChangeText={setApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowGeminiKey(!showGeminiKey)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showGeminiKey ? 'Ẩn' : 'Hiện'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              activeOpacity={0.85}
              onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu cấu hình & Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#090d16',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 18,
  },
  scrollContent: {
    paddingVertical: 18,
    gap: 22,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionNote: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },
  block: {
    gap: 8,
    marginTop: 4,
  },
  blockLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  themeCardName: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeCardDesc: {
    fontSize: 10.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkTextSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  engineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  engineOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 11,
    gap: 5,
  },
  engineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  engineTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  engineDesc: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
  subCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
  },
  keyInput: {
    flex: 1,
    height: 40,
    color: '#ffffff',
    fontSize: 13,
  },
  eyeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  modelListCol: {
    gap: 6,
    marginTop: 4,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modelItemName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  modelItemDesc: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  modelBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modelBadgePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  paramGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  paramItem: {
    flex: 1,
    gap: 4,
  },
  paramLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  segGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
