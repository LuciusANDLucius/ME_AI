import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessageItem } from '@/components/ChatMessageItem';
import { GeminiHeader } from '@/components/GeminiHeader';
import { ImageModalViewer } from '@/components/ImageModalViewer';
import { PromptBar } from '@/components/PromptBar';
import { QuickChips } from '@/components/QuickChips';
import { SettingsModal } from '@/components/SettingsModal';
import { getAppTheme } from '@/constants/theme';
import {
  DEFAULT_SETTINGS,
  generateOrEditImage,
  loadAISettings,
  saveAISettings,
  sendChatMessage,
} from '@/services/ai-service';

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  text: '✨ **ME AI Studio:** Chào mừng bạn! Hãy nhập bất kỳ ý tưởng nghệ thuật nào vào thanh công cụ bên dưới để sáng tạo hình ảnh đỉnh cao.',
  timestamp: Date.now(),
  modelUsed: 'Text to Image AI',
};

export default function GeminiStudioScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [attachedImageUri, setAttachedImageUri] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const theme = getAppTheme(settings?.themeMode);

  // Lightbox preview state
  const [viewerState, setViewerState] = useState({ visible: false, uri: null });

  const flatListRef = useRef(null);

  // Load saved settings
  useEffect(() => {
    loadAISettings().then(setSettings);
  }, []);

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    await saveAISettings(newSettings);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Main send action (Handles text-to-text, text-to-image, and image-to-image)
  const handleSend = async (
    inputText,
    attachedUri,
    styleId = 'none',
    aspectRatio = '1:1'
  ) => {
    const trimmed = (inputText || '').trim();
    if (!trimmed && !attachedUri) return;

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'gemini-' + (Date.now() + 1);

    const userMessage = {
      id: userMsgId,
      role: 'user',
      text: trimmed,
      imageUri: attachedUri,
      timestamp: Date.now(),
    };

    // Determine intent:
    // In an AI Image Studio, ANY prompt or photo attachment automatically generates or edits the image!
    // Pure conversational chat is only used for explicit help / introduction questions.
    const isImageEditing = Boolean(attachedUri);
    const isHelpQuestion =
      !isImageEditing &&
      /^(bạn là ai|ban la ai|hướng dẫn|huong dan|help|trợ giúp|tro giup|cách dùng|cach dung|bạn làm được gì|ban lam duoc gi)\b/i.test(trimmed);
    const isImageGeneration = isImageEditing || !isHelpQuestion;

    // Initial temporary loading message
    const tempAssistantMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: isImageEditing
        ? '🪄 Đang chuẩn bị biến đổi ảnh...'
        : '🎨 Đang khởi tạo tác vụ sinh ảnh...',
      timestamp: Date.now() + 1,
      isLoading: true,
      actionType: isImageEditing
        ? 'edit_image'
        : isImageGeneration
        ? 'generate_image'
        : 'chat',
    };

    setMessages((prev) => [...prev, userMessage, tempAssistantMessage]);
    setAttachedImageUri(undefined);
    setIsLoading(true);
    scrollToBottom();

    try {
      if (isImageGeneration) {
        const updateStatus = (statusText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: statusText } : msg
            )
          );
        };

        const engineName =
          settings.imageEngine === 'gen-pollinations'
            ? `Gen Pollinations (${(settings.pollinationsModel || 'FLUX.1').split('/').pop()})`
            : settings.imageEngine === 'kie-flux3'
            ? 'Kie.ai FLUX.3'
            : 'Creative AI Engine';

        updateStatus(
          isImageEditing
            ? `🪄 Đang chuẩn bị biến đổi ảnh với ${engineName}...`
            : `🎨 Đang khởi tạo hình ảnh với ${engineName}...`
        );

        // Generate or edit image directly with Kie.ai FLUX.3
        const imageResult = await generateOrEditImage({
          prompt:
            trimmed ||
            (isImageEditing
              ? 'Biến đổi bức ảnh này theo phong cách nghệ thuật đẹp nhất'
              : 'Tác phẩm nghệ thuật đỉnh cao tuyệt đẹp'),
          imageUri: attachedUri,
          styleId,
          aspectRatio,
          settings,
          onStatusUpdate: updateStatus,
        });

        const replyText = isImageEditing
          ? `✨ **${imageResult.modelUsed}:** Đã hoàn thành biến đổi ảnh theo yêu cầu: "${trimmed}"`
          : `🎨 **${imageResult.modelUsed}:** Đã tạo ảnh thành công theo prompt: "${trimmed}"`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  isLoading: false,
                  text: replyText,
                  imageUri: imageResult.url,
                  generatedPrompt: imageResult.finalPrompt,
                  modelUsed: imageResult.modelUsed,
                  aspectRatio,
                }
              : msg
          )
        );
      } else {
        // Pure Text-to-Text Conversation for help / intro questions
        const aiResponse = await sendChatMessage(trimmed, messages, undefined, settings);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  isLoading: false,
                  text: aiResponse.text,
                  suggestedPrompt: aiResponse.suggestedPrompt,
                  modelUsed: aiResponse.modelUsed,
                }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                isLoading: false,
                text: `⚠️ Đã xảy ra lỗi trong quá trình xử lý: ${error.message || error}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // Quick prompt select
  const handleSelectQuickPrompt = (prompt, category) => {
    if (category === 'image-editing' && !attachedImageUri) {
      Alert.alert(
        'Đính kèm ảnh để chỉnh sửa',
        'Vui lòng nhấn nút 🖼️ Thư viện hoặc 📸 Camera ở thanh công cụ bên dưới để chọn một bức ảnh trước khi áp dụng chỉnh sửa nhé!'
      );
      return;
    }
    handleSend(prompt, attachedImageUri);
  };

  // Lightbox preview handlers
  const handleOpenImageViewer = (uri, prompt, model) => {
    setViewerState({ visible: true, uri, prompt, model });
  };

  // Navigate to Tab 2 (Image-to-Image FLUX.3 Edit Studio) with this image!
  const handleEditFurther = (uri, prompt) => {
    router.push({
      pathname: '/explore',
      params: {
        sourceImageUri: uri,
        initialPrompt: prompt || '',
      },
    });
  };

  // Instant generate from suggested prompt
  const handleGenerateFromPrompt = (prompt) => {
    handleSend(prompt);
  };

  // Re-roll image
  const handleRetry = (prompt, styleId) => {
    handleSend(prompt, undefined, styleId);
  };

  const handleClearChat = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: () => {
          setMessages([INITIAL_WELCOME_MESSAGE]);
          setAttachedImageUri(undefined);
        },
      },
    ]);
  };

  const handleNewChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setAttachedImageUri(undefined);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Gemini Header */}
        <GeminiHeader
          settings={settings}
          onOpenSettings={() => setShowSettings(true)}
          onClearChat={handleClearChat}
          onNewChat={handleNewChat}
        />

        {/* Quick Suggestion Chips */}
        <QuickChips onSelectPrompt={handleSelectQuickPrompt} />

        {/* Chat Stream List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessageItem
              message={item}
              onOpenImageViewer={handleOpenImageViewer}
              onEditFurther={handleEditFurther}
              onGenerateFromPrompt={handleGenerateFromPrompt}
              onRetry={handleRetry}
            />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToBottom}
        />

        {/* Bottom Input & Tool Bar */}
        <PromptBar
          onSend={handleSend}
          isLoading={isLoading}
          attachedImageUri={attachedImageUri}
          onClearAttachedImage={() => setAttachedImageUri(undefined)}
          onAttachImage={(uri) => setAttachedImageUri(uri)}
        />

        {/* Lightbox Modal */}
        <ImageModalViewer
          visible={viewerState.visible}
          imageUri={viewerState.uri}
          prompt={viewerState.prompt}
          modelUsed={viewerState.model}
          onClose={() => setViewerState({ visible: false, uri: null })}
          onEditFurther={handleEditFurther}
        />

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettings}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
});
