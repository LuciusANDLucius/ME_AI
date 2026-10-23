import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { saveImageToGallery } from '@/services/image-saver';

export function ChatMessageItem({
  message,
  onOpenImageViewer,
  onEditFurther,
  onGenerateFromPrompt,
  onRetry,
}) {
  const isUser = message.role === 'user';
  const [imageLoading, setImageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (uri) => {
    if (!uri || isSaving) return;
    setIsSaving(true);
    try {
      const res = await saveImageToGallery(uri);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      if (res.method === 'library') {
        Alert.alert(
          'Đã lưu ảnh! 🎉',
          'Ảnh đã được lưu trực tiếp vào Thư viện ảnh (Cuộn Camera) của thiết bị.'
        );
      } else if (res.method === 'web-download') {
        Alert.alert('Đã tải ảnh! 🎉', 'Ảnh đang được tải về máy của bạn.');
      } else if (res.method === 'share-fallback') {
        Alert.alert('Chia sẻ hoặc lưu ảnh', 'Bạn có thể chọn "Lưu hình ảnh" từ bảng chia sẻ.');
      }
    } catch (e) {
      Alert.alert('Không thể lưu ảnh', e?.message || 'Đã xảy ra lỗi khi lưu ảnh');
    } finally {
      setIsSaving(false);
    }
  };

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          {message.imageUri && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onOpenImageViewer(message.imageUri, message.text)}
              style={styles.userAttachmentBox}>
              <Image
                source={{ uri: message.imageUri }}
                style={styles.userAttachmentImg}
                contentFit="cover"
              />
              <View style={styles.userAttachmentBadge}>
                <AppIcon name="image" size={11} color="#60a5fa" />
                <Text style={styles.userAttachmentBadgeText}>Ảnh đính kèm</Text>
              </View>
            </TouchableOpacity>
          )}

          {Boolean(message.text) && <Text style={styles.userText}>{message.text}</Text>}
        </View>
      </View>
    );
  }

  // Assistant / Gemini Message
  return (
    <View style={styles.assistantRow}>
      {/* AI Avatar */}
      <View style={styles.avatar}>
        <AppIcon name="sparkles" size={15} color="#38bdf8" />
      </View>

      <View style={styles.assistantContent}>
        {/* Loading state indicator */}
        {message.isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loadingText}>
              {message.text ||
                (message.actionType === 'edit_image'
                  ? 'Kie.ai FLUX.3: Đang biến đổi ảnh...'
                  : message.actionType === 'generate_image'
                  ? 'Kie.ai FLUX.3: Đang kết xuất hình ảnh 8K...'
                  : 'Đang xử lý...')}
            </Text>
          </View>
        ) : (
          <>
            {/* Model Name Tag */}
            <View style={styles.tagRow}>
              <View style={styles.modelTagPill}>
                <AppIcon name="zap" size={10} color="#a5b4fc" />
                <Text style={styles.modelTag}>{message.modelUsed || 'FLUX.3 Klein'}</Text>
              </View>
            </View>

            {/* Assistant Text */}
            {Boolean(message.text) && (
              <View style={styles.textBubble}>
                <Text style={styles.assistantText}>{message.text}</Text>
              </View>
            )}

            {/* Generated / Edited Image Card */}
            {message.imageUri && (
              <View style={styles.imageCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    onOpenImageViewer(
                      message.imageUri,
                      message.generatedPrompt || message.text,
                      message.modelUsed
                    )
                  }
                  style={styles.imageWrapper}>
                  {imageLoading && (
                    <View style={styles.imageSkeleton}>
                      <ActivityIndicator size="small" color="#38bdf8" />
                      <Text style={styles.skeletonText}>Đang nạp ảnh chất lượng cao 8K...</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: message.imageUri }}
                    style={styles.generatedImage}
                    contentFit="cover"
                    onLoadEnd={() => setImageLoading(false)}
                    transition={400}
                  />

                  {/* Overlay Badge */}
                  <View style={styles.imageBadge}>
                    <AppIcon
                      name={message.actionType === 'edit_image' ? 'wand' : 'sparkles'}
                      size={11}
                      color="#ffffff"
                    />
                    <Text style={styles.imageBadgeText}>
                      {message.actionType === 'edit_image' ? 'Ảnh đã biến đổi' : 'FLUX.3 AI'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Image Action Buttons */}
                <View style={styles.imageActionsBar}>
                  <TouchableOpacity
                    style={styles.imgBtn}
                    activeOpacity={0.7}
                    onPress={() =>
                      onOpenImageViewer(
                        message.imageUri,
                        message.generatedPrompt || message.text,
                        message.modelUsed
                      )
                    }>
                    <AppIcon name="zoom" size={13} color="#94a3b8" />
                    <Text style={styles.imgBtnText}>Xem lớn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.imgBtn, isSaved && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }]}
                    activeOpacity={0.7}
                    disabled={isSaving}
                    onPress={() => handleSave(message.imageUri)}>
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#94a3b8" />
                    ) : (
                      <AppIcon
                        name={isSaved ? 'check' : 'download'}
                        size={13}
                        color={isSaved ? '#10b981' : '#94a3b8'}
                      />
                    )}
                    <Text style={[styles.imgBtnText, isSaved && { color: '#10b981' }]}>
                      {isSaved ? 'Đã lưu' : 'Lưu ảnh'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.imgBtn, styles.editActionBtn]}
                    activeOpacity={0.7}
                    onPress={() =>
                      onEditFurther(message.imageUri, message.generatedPrompt || message.text)
                    }>
                    <AppIcon name="wand" size={13} color="#60a5fa" />
                    <Text style={styles.editActionText}>Sửa tiếp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.imgBtn}
                    activeOpacity={0.7}
                    onPress={() => onRetry(message.generatedPrompt || message.text)}>
                    <AppIcon name="refresh" size={13} color="#94a3b8" />
                    <Text style={styles.imgBtnText}>Tạo lại</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Suggested Prompt Callout Box */}
            {message.suggestedPrompt && !message.imageUri && (
              <View style={styles.promptSuggestionCard}>
                <View style={styles.promptHeader}>
                  <AppIcon name="wand" size={13} color="#c084fc" />
                  <Text style={styles.promptTitle}>Prompt tạo ảnh gợi ý:</Text>
                </View>
                <Text style={styles.promptBody}>{message.suggestedPrompt}</Text>
                <TouchableOpacity
                  style={styles.generateWithPromptBtn}
                  activeOpacity={0.8}
                  onPress={() => onGenerateFromPrompt(message.suggestedPrompt)}>
                  <AppIcon name="zap" size={13} color="#ffffff" />
                  <Text style={styles.genBtnText}>Tạo ảnh từ Prompt này ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: '#1d4ed8',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  userAttachmentBox: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  userAttachmentImg: {
    width: 220,
    height: 160,
    borderRadius: 12,
  },
  userAttachmentBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userAttachmentBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  assistantRow: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarText: {
    fontSize: 16,
  },
  assistantContent: {
    flex: 1,
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  modelTag: {
    fontSize: 10.5,
    color: '#c7d2fe',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  assistantText: {
    color: '#e2e8f0',
    fontSize: 14.5,
    lineHeight: 22,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingText: {
    color: '#38bdf8',
    fontSize: 13.5,
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 340,
    position: 'relative',
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    zIndex: 1,
  },
  skeletonText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  imageBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  imageActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  imgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imgBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  editActionBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  editActionText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700',
  },
  promptSuggestionCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    padding: 12,
    gap: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptEmoji: {
    fontSize: 14,
  },
  promptTitle: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  promptBody: {
    color: '#f1f5f9',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  generateWithPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  genBtnIcon: {
    color: '#ffffff',
    fontSize: 13,
  },
  genBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
