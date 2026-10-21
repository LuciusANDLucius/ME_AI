import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GeminiHeader } from '@/components/GeminiHeader';
import { ImageModalViewer } from '@/components/ImageModalViewer';
import { SettingsModal } from '@/components/SettingsModal';
import { AppIcon } from '@/components/ui/app-icon';
import { getAppTheme } from '@/constants/theme';
import {
  DEFAULT_SETTINGS,
  editImageWithFlux,
  loadAISettings,
  saveAISettings,
} from '@/services/ai-service';
import { saveImageToGallery } from '@/services/image-saver';

const QUICK_EDIT_PRESETS = [
  { id: '1', title: 'Đổi màu áo', prompt: 'Giữ nguyên mọi thứ, đổi màu trang phục của nhân vật thành màu đỏ neon rực rỡ' },
  { id: '2', title: 'Thêm kính râm', prompt: 'Thêm chiếc kính râm thời trang cao cấp cho nhân vật, giữ nguyên khuôn mặt và trang phục' },
  { id: '3', title: 'Nền hoàng hôn biển', prompt: 'Giữ nguyên chủ thể ở tiền cảnh, thay đổi toàn bộ hậu cảnh thành bãi biển hoàng hôn nhiệt đới lãng mạn' },
  { id: '4', title: 'Phong cách Anime', prompt: 'Chuyển toàn bộ bức ảnh sang phong cách anime Makoto Shinkai nghệ thuật đỉnh cao 8k' },
  { id: '5', title: 'Cyberpunk Neon', prompt: 'Biến bức ảnh thành phong cách cyberpunk tương lai với ánh đèn neon xanh tím phản chiếu mặt đường ướt mưa' },
  { id: '6', title: 'Chân dung Studio 8K', prompt: 'Nâng cấp bức ảnh thành ảnh chân dung chuyên nghiệp chụp bằng máy ảnh Hasselblad 35mm, ánh sáng cinematic' },
];

export default function ImageToImageScreen() {
  const params = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [viewerUri, setViewerUri] = useState(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isSavedResult, setIsSavedResult] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadAISettings().then(setSettings);
  }, []);

  // Pre-fill image if routed from Tab 1
  useEffect(() => {
    if (params?.sourceImageUri) {
      setSelectedImage(params.sourceImageUri);
      setResultImage(null);
    }
    if (params?.initialPrompt) {
      setEditPrompt(params.initialPrompt);
    }
  }, [params?.sourceImageUri, params?.initialPrompt]);

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    await saveAISettings(newSettings);
  };

  const accentColor = settings?.accentColor || '#a855f7';
  const theme = getAppTheme(settings?.themeMode);

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện để chọn ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setResultImage(null);
      }
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể chọn ảnh');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền Camera', 'Vui lòng cấp quyền máy ảnh.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setResultImage(null);
      }
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể chụp ảnh');
    }
  };

  // Execute FLUX.3 Klein Edit
  const handleExecuteEdit = async () => {
    if (!selectedImage) {
      Alert.alert('Chưa có ảnh', 'Vui lòng chọn hoặc chụp một bức ảnh trước để tiến hành chỉnh sửa!');
      return;
    }

    const trimmedPrompt = (editPrompt || '').trim();
    if (!trimmedPrompt) {
      Alert.alert(
        'Nhập yêu cầu sửa ảnh',
        'Vui lòng mô tả chi tiết phần bạn muốn chỉnh sửa (hoặc chọn nhanh một gợi ý bên dưới)!'
      );
      return;
    }

    setIsProcessing(true);
    setStatusText('Đang kết nối FLUX.3 Klein Edit...');

    try {
      const currentSettings = await loadAISettings();
      const res = await editImageWithFlux({
        prompt: trimmedPrompt,
        imageUri: selectedImage,
        aspectRatio: 'auto',
        settings: currentSettings,
        onStatusUpdate: setStatusText,
      });

      if (res?.url) {
        setResultImage(res.url);
      } else {
        throw new Error('Không nhận được ảnh kết quả từ máy chủ FLUX.3');
      }
    } catch (err) {
      Alert.alert('Lỗi chỉnh sửa ảnh', err?.message || 'Đã xảy ra lỗi trong quá trình xử lý');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  // Use result as next source
  const handleUseResultAsSource = () => {
    if (resultImage) {
      setSelectedImage(resultImage);
      setResultImage(null);
      setEditPrompt('');
    }
  };

  // Save result directly to iPhone Photos
  const handleSaveResult = async () => {
    if (!resultImage || isSavingResult) return;
    setIsSavingResult(true);
    try {
      const res = await saveImageToGallery(resultImage);
      setIsSavedResult(true);
      setTimeout(() => setIsSavedResult(false), 3000);
      if (res.method === 'library') {
        Alert.alert(
          'Đã lưu thành công! 🎉',
          'Ảnh chỉnh sửa đã được lưu trực tiếp vào Thư viện ảnh (Cuộn Camera) của iPhone.'
        );
      }
    } catch (e) {
      Alert.alert('Không thể lưu ảnh', e?.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSavingResult(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      {/* Unified Header */}
      <GeminiHeader settings={settings} onOpenSettings={() => setShowSettings(true)} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subheader info banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.infoIconBox, { backgroundColor: `${accentColor}25` }]}>
            <AppIcon name="wand" size={16} color={accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>FLUX.3 Klein Edit (Image-to-Image)</Text>
            <Text style={[styles.infoSubtitle, { color: theme.subText }]}>
              Giữ nguyên cấu trúc ảnh gốc và thực hiện chỉnh sửa chính xác theo câu lệnh
            </Text>
          </View>
        </View>

        {/* 1. KHUNG ẢNH GỐC & KẾT QUẢ (BEFORE & AFTER) */}
        <View style={[styles.comparisonCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardHeaderTitle, { color: theme.text }]}>Khu vực làm việc</Text>
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Xóa ảnh</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.previewGrid}>
            {/* Ảnh gốc (Before) */}
            <View style={styles.slotContainer}>
              <View style={styles.slotHeader}>
                <Text style={[styles.slotLabel, { color: theme.subText }]}>Ảnh gốc (Before)</Text>
                {selectedImage && (
                  <TouchableOpacity onPress={() => setViewerUri(selectedImage)}>
                    <AppIcon name="zoom" size={13} color={theme.subText} />
                  </TouchableOpacity>
                )}
              </View>

              {selectedImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImg} contentFit="cover" />
                  <TouchableOpacity style={styles.changeImgBtn} onPress={pickImage} activeOpacity={0.8}>
                    <AppIcon name="image" size={12} color="#ffffff" />
                    <Text style={styles.changeImgText}>Đổi ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.uploadBox, { borderColor: theme.border }]}>
                  <AppIcon name="image" size={28} color={theme.subText} />
                  <Text style={[styles.uploadPrompt, { color: theme.subText }]}>Chưa có ảnh nào được chọn</Text>
                  <View style={styles.uploadActionRow}>
                    <TouchableOpacity style={[styles.uploadBtn, { borderColor: `${accentColor}50`, backgroundColor: `${accentColor}18` }]} onPress={pickImage}>
                      <AppIcon name="image" size={13} color={accentColor} />
                      <Text style={[styles.uploadBtnText, { color: accentColor }]}>Thư viện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.uploadBtn, { borderColor: theme.border }]} onPress={takePhoto}>
                      <AppIcon name="camera" size={13} color={theme.text} />
                      <Text style={[styles.uploadBtnText, { color: theme.text }]}>Chụp ảnh</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Ảnh sau sửa (After) */}
            <View style={styles.slotContainer}>
              <View style={styles.slotHeader}>
                <Text style={[styles.slotLabel, { color: theme.subText }]}>Kết quả (After)</Text>
                {resultImage && (
                  <TouchableOpacity onPress={() => setViewerUri(resultImage)}>
                    <AppIcon name="zoom" size={13} color={theme.subText} />
                  </TouchableOpacity>
                )}
              </View>

              {isProcessing ? (
                <View style={[styles.uploadBox, styles.processingBox, { borderColor: `${accentColor}60` }]}>
                  <ActivityIndicator size="large" color={accentColor} />
                  <Text style={[styles.statusMsg, { color: accentColor }]}>{statusText || 'Đang xử lý...'}</Text>
                  <Text style={[styles.statusSub, { color: theme.subText }]}>FLUX.3 Klein đang biến đổi chi tiết</Text>
                </View>
              ) : resultImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: resultImage }} style={styles.previewImg} contentFit="cover" />
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>Đã chỉnh sửa</Text>
                  </View>
                  <View style={styles.resultActionsRow}>
                    <TouchableOpacity
                      style={[styles.useAsSourceBtn, { backgroundColor: accentColor }]}
                      onPress={handleUseResultAsSource}>
                      <Text style={styles.useAsSourceText}>Sửa tiếp ↗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveResultBtn, isSavedResult && styles.saveResultBtnDone]}
                      disabled={isSavingResult}
                      onPress={handleSaveResult}>
                      {isSavingResult ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <AppIcon
                          name={isSavedResult ? 'check' : 'download'}
                          size={12}
                          color="#ffffff"
                        />
                      )}
                      <Text style={styles.saveResultText}>
                        {isSavingResult ? 'Đang lưu' : isSavedResult ? 'Đã lưu' : 'Lưu ảnh'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.uploadBox, { borderColor: theme.border }]}>
                  <AppIcon name="wand" size={28} color={theme.subText} />
                  <Text style={[styles.uploadPrompt, { color: theme.subText }]}>Ảnh chỉnh sửa sẽ xuất hiện tại đây</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 2. THANH NHẬP LỆNH CHỈNH SỬA (EDIT PROMPT) */}
        <View style={[styles.promptSection, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Yêu cầu chỉnh sửa ảnh</Text>
          <View style={[styles.promptInputBox, { backgroundColor: theme.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.25)', borderColor: theme.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="VD: Đổi ba lô thành màu xanh lá, thêm kính râm, thay nền bãi biển..."
              placeholderTextColor={theme.subText}
              multiline
              value={editPrompt}
              onChangeText={setEditPrompt}
            />
            {editPrompt.length > 0 && (
              <TouchableOpacity onPress={() => setEditPrompt('')} style={styles.clearInputBtn}>
                <AppIcon name="close" size={12} color={theme.subText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Edit Suggestion Chips */}
          <Text style={[styles.chipsHeading, { color: theme.subText }]}>Gợi ý chỉnh sửa nhanh:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            {QUICK_EDIT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.chipBtn,
                  {
                    backgroundColor: theme.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setEditPrompt(preset.prompt)}>
                <AppIcon name="sparkles" size={11} color={accentColor} />
                <Text style={[styles.chipText, { color: theme.text }]}>{preset.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.executeBtn,
              { backgroundColor: accentColor },
              (!selectedImage || isProcessing) && styles.executeBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!selectedImage || isProcessing}
            onPress={handleExecuteEdit}>
            {isProcessing ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.executeBtnText}>Đang xử lý với FLUX.3 Klein...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <AppIcon name="wand" size={17} color="#ffffff" />
                <Text style={styles.executeBtnText}>Thực hiện Chỉnh sửa ảnh (FLUX.3)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Lightbox Viewer */}
      <ImageModalViewer
        visible={Boolean(viewerUri)}
        imageUri={viewerUri}
        prompt={editPrompt || 'FLUX.3 Klein Edit'}
        modelUsed="FLUX.3 Klein (Image-to-Image)"
        onClose={() => setViewerUri(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 15,
  },
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearBtnText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  previewGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  slotContainer: {
    flex: 1,
    gap: 6,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  changeImgBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  changeImgText: {
    fontSize: 10.5,
    color: '#ffffff',
    fontWeight: '700',
  },
  uploadBox: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 6,
  },
  processingBox: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  uploadPrompt: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  uploadBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusMsg: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  statusSub: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
  resultBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  resultActionsRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  useAsSourceBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useAsSourceText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  saveResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveResultBtnDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    borderColor: '#10b981',
  },
  saveResultText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  promptSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  promptInputBox: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 20,
  },
  clearInputBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  executeBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  executeBtnDisabled: {
    opacity: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  executeBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
