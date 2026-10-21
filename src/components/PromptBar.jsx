import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import { AspectSelectorModal } from '@/components/AspectSelectorModal';
import { StyleSelectorModal } from '@/components/StyleSelectorModal';
import { AppIcon } from '@/components/ui/app-icon';
import { STYLE_PRESETS } from '@/constants/ai-presets';
import { buildSmartPrompt } from '@/services/ai-service';

export function PromptBar({
  onSend,
  isLoading,
  initialText = '',
  attachedImageUri,
  onClearAttachedImage,
  onAttachImage,
}) {
  const [inputText, setInputText] = useState(initialText);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showRatioModal, setShowRatioModal] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Pick image from phone library
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện để chọn ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAttachImage?.(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể mở thư viện: ' + err.message);
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền Camera', 'Vui lòng cấp quyền máy ảnh để chụp ảnh.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onAttachImage?.(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể mở camera: ' + err.message);
    }
  };

  // Magic enhance prompt
  const handleEnhancePrompt = () => {
    if (!inputText.trim()) {
      Alert.alert('Nhập mô tả', 'Vui lòng nhập một ý tưởng ngắn trước để AI phù phép prompt nhé!');
      return;
    }
    setIsEnhancing(true);
    setTimeout(() => {
      const enhanced = buildSmartPrompt(inputText, selectedStyle.id);
      setInputText(enhanced);
      setIsEnhancing(false);
    }, 400);
  };

  // Submit action
  const handleSend = () => {
    if (!inputText.trim() && !attachedImageUri) return;
    if (isLoading) return;

    onSend(inputText.trim(), attachedImageUri, selectedStyle.id, selectedRatio);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Attached Image Chip (for Image Editing / Multimodal Vision) */}
      {attachedImageUri && (
        <View style={styles.attachmentChip}>
          <Image source={{ uri: attachedImageUri }} style={styles.attachmentThumb} />
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentTitle}>Ảnh đính kèm chỉnh sửa (FLUX.3 Klein)</Text>
            <Text style={styles.attachmentSub}>Mô hình flux-3/klein-edit-image sẽ biến đổi ảnh theo prompt</Text>
          </View>
          <TouchableOpacity
            onPress={onClearAttachedImage}
            style={styles.detachButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.detachText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preset Pills Row */}
      <View style={styles.pillsRow}>
        <TouchableOpacity
          style={styles.pill}
          activeOpacity={0.7}
          onPress={() => setShowStyleModal(true)}>
          <AppIcon name="palette" size={13} color="#f472b6" />
          <Text style={styles.pillLabel}>{selectedStyle.label}</Text>
          <AppIcon name="chevron-down" size={10} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pill}
          activeOpacity={0.7}
          onPress={() => setShowRatioModal(true)}>
          <AppIcon name="aspect-ratio" size={13} color="#60a5fa" />
          <Text style={styles.pillLabel}>{selectedRatio}</Text>
          <AppIcon name="chevron-down" size={10} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, styles.magicPill, isEnhancing && styles.magicPillActive]}
          activeOpacity={0.7}
          onPress={handleEnhancePrompt}>
          <AppIcon name="wand" size={13} color="#c084fc" />
          <Text style={styles.magicLabel}>
            {isEnhancing ? 'Đang phù phép...' : 'Nâng cấp Prompt'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Input Box */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          placeholder={
            attachedImageUri
              ? 'Yêu cầu FLUX.3 chỉnh sửa ảnh (ví dụ: đổi áo thành xanh neon, đổi nền sao hỏa...)'
              : 'Mô tả hình ảnh bạn muốn tạo (ví dụ: phi hành gia giữa hoa anh đào, robot cyberpunk 8k)...'
          }
          placeholderTextColor="#64748b"
          multiline
          maxLength={1000}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
        />

        {/* Action icons row */}
        <View style={styles.controlsRow}>
          <View style={styles.leftTools}>
            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={styles.toolBtn}
              activeOpacity={0.7}
              accessibilityLabel="Chọn ảnh từ thư viện">
              <AppIcon name="image" size={17} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakePhoto}
              style={styles.toolBtn}
              activeOpacity={0.7}
              accessibilityLabel="Chụp ảnh bằng Camera">
              <AppIcon name="camera" size={17} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Send / Generate Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || (!inputText.trim() && !attachedImageUri)}
            style={[
              styles.sendBtn,
              (!inputText.trim() && !attachedImageUri) || isLoading ? styles.disabledBtn : null,
            ]}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View style={styles.sendInner}>
                <AppIcon name="send" size={14} color="#ffffff" />
                <Text style={styles.sendLabel}>
                  {attachedImageUri ? 'Biến đổi ảnh' : 'Tạo ảnh'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Style & Aspect Ratio Modals */}
      <StyleSelectorModal
        visible={showStyleModal}
        selectedStyleId={selectedStyle.id}
        onSelectStyle={setSelectedStyle}
        onClose={() => setShowStyleModal(false)}
      />

      <AspectSelectorModal
        visible={showRatioModal}
        selectedRatio={selectedRatio}
        onSelectRatio={setSelectedRatio}
        onClose={() => setShowRatioModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 10,
  },
  attachmentThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93c5fd',
  },
  attachmentSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  detachButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detachText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  magicPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderColor: 'rgba(192, 132, 252, 0.4)',
    marginLeft: 'auto',
    ...Platform.select({
      web: {
        boxShadow: '0 0 14px rgba(168, 85, 247, 0.25)',
      },
      default: {},
    }),
  },
  magicPillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#c084fc',
    transform: [{ scale: 1.03 }],
  },
  pillLabel: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  magicLabel: {
    fontSize: 12,
    color: '#d8b4fe',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 15,
    minHeight: 46,
    maxHeight: 120,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
      },
      default: {},
    }),
  },
  disabledBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  sendInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 14,
    transform: [{ rotate: '-25deg' }],
  },
  sendLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
