import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { saveImageToGallery, shareImage } from '@/services/image-saver';

export function ImageModalViewer({
  visible,
  imageUri,
  prompt,
  modelUsed,
  onClose,
  onEditFurther,
}) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!visible || !imageUri) return null;

  const handleCopyPrompt = () => {
    if (!prompt) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(prompt);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Đã sao chép prompt!');
    }
  };

  const handleSaveImage = async () => {
    if (!imageUri || isSaving) return;
    setIsSaving(true);
    try {
      const res = await saveImageToGallery(imageUri);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      if (res.method === 'library') {
        Alert.alert(
          'Đã lưu thành công! 🎉',
          'Ảnh đã được lưu trực tiếp vào Thư viện ảnh (Cuộn Camera) của thiết bị.'
        );
      } else if (res.method === 'share-fallback') {
        Alert.alert('Chia sẻ hoặc lưu ảnh', 'Bạn có thể chọn "Lưu hình ảnh" từ bảng chia sẻ.');
      } else if (res.method === 'web-download') {
        Alert.alert('Thành công 🎉', 'Đang tải ảnh xuống máy tính / thiết bị của bạn.');
      }
    } catch (e) {
      Alert.alert('Không thể lưu ảnh', e.message || 'Đã có lỗi xảy ra khi lưu ảnh.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareImage = async () => {
    if (!imageUri || isSharing) return;
    setIsSharing(true);
    try {
      await shareImage(imageUri);
    } catch (e) {
      Alert.alert('Không thể chia sẻ ảnh', e.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <AppIcon name="close" size={16} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.topActions}>
            {/* Save to Photos Button */}
            <TouchableOpacity
              onPress={handleSaveImage}
              style={[styles.actionBtn, isSaved && styles.savedBtn]}
              disabled={isSaving}
              activeOpacity={0.7}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <AppIcon
                  name={isSaved ? 'check' : 'download'}
                  size={15}
                  color={isSaved ? '#10b981' : '#ffffff'}
                />
              )}
              <Text style={[styles.btnText, isSaved && styles.savedText]}>
                {isSaving ? 'Đang lưu...' : isSaved ? 'Đã lưu' : 'Lưu ảnh'}
              </Text>
            </TouchableOpacity>

            {/* Native Share Button */}
            <TouchableOpacity
              onPress={handleShareImage}
              style={styles.actionBtn}
              disabled={isSharing}
              activeOpacity={0.7}>
              {isSharing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <AppIcon name="share" size={15} color="#ffffff" />
              )}
              <Text style={styles.btnText}>Chia sẻ</Text>
            </TouchableOpacity>

            {/* Edit Further Button */}
            {onEditFurther && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onEditFurther(imageUri, prompt);
                }}
                style={[styles.actionBtn, styles.editFurtherBtn]}
                activeOpacity={0.7}>
                <AppIcon name="wand" size={14} color="#ffffff" />
                <Text style={styles.editBtnText}>Sửa ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Center image container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.mainImage}
            contentFit="contain"
            transition={300}
          />
        </View>

        {/* Bottom details card */}
        <View style={styles.bottomCard}>
          <ScrollView style={styles.scrollDetails} showsVerticalScrollIndicator={false}>
            {modelUsed && (
              <View style={styles.badgeRow}>
                <View style={styles.modelBadge}>
                  <AppIcon name="sparkles" size={12} color="#38bdf8" />
                  <Text style={styles.modelText}>{modelUsed}</Text>
                </View>
              </View>
            )}

            {prompt && (
              <View style={styles.promptBox}>
                <Text style={styles.promptLabel}>Prompt mô tả:</Text>
                <Text style={styles.promptContent}>{prompt}</Text>
                <TouchableOpacity
                  onPress={handleCopyPrompt}
                  style={styles.copyBtn}
                  activeOpacity={0.7}>
                  <AppIcon name={copied ? 'check' : 'copy'} size={13} color={copied ? '#10b981' : '#94a3b8'} />
                  <Text style={[styles.copyText, copied && styles.copiedText]}>
                    {copied ? 'Đã sao chép vào bộ nhớ tạm' : 'Sao chép Prompt'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  savedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
    borderWidth: 1,
  },
  savedText: {
    color: '#34d399',
  },
  editFurtherBtn: {
    backgroundColor: '#3b82f6',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  bottomCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollDetails: {
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modelBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  modelText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  promptBox: {
    gap: 4,
  },
  promptLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  promptContent: {
    fontSize: 13.5,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  copyBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  copyText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
});
