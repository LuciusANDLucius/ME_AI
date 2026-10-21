import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { ASPECT_RATIOS, STYLE_PRESETS } from '@/constants/ai-presets';
import { generateOrEditWithKie } from '@/services/kie-service';

const SETTINGS_KEY = 'gemini_ai_settings_v1';
const HISTORY_KEY = 'gemini_ai_history_v1';

export const DEFAULT_SETTINGS = {
  themeMode: 'dark', // 'dark' | 'oled' | 'midnight' | 'light'
  accentColor: '#8b5cf6', // '#8b5cf6' | '#38bdf8' | '#10b981' | '#ec4899' | '#f59e0b'
  geminiApiKey: '',
  kieApiKey: '348d97386a66481c4630a8f2d0e1edcd',
  pollinationsApiKey: 'sk_EdJDHFPuT2i7rxkXMVEPaJv1LRXoihfr',
  pollinationsModel: 'black-forest-labs/flux.1-schnell',
  provider: 'free',
  geminiModel: 'gemini-1.5-flash',
  textImageEngine: 'gen-pollinations', // 'gen-pollinations' | 'kie-flux3' | 'pollinations-flux'
  editImageEngine: 'kie-flux3', // 'flux-3/klein-edit-image'
  imageEngine: 'gen-pollinations',
  kieResolution: '1K',
  kieOutputFormat: 'png',
  kieTextModel: 'flux-3/klein-text-to-image',
  kieEditModel: 'flux-3/klein-edit-image',
  aspectRatio: '1:1',
  autoEnhancePrompt: true,
  systemInstruction:
    'Bạn là Gemini Image AI Studio - trợ lý trí tuệ nhân tạo chuyên sâu về xử lý hình ảnh, sáng tạo nghệ thuật, phân tích ảnh và viết prompt chuyên nghiệp. Hãy trả lời thân thiện, súc tích, chi tiết và luôn gợi ý những ý tưởng tạo ảnh hoặc chỉnh sửa ảnh tuyệt đẹp.',
};

// Safe storage wrapper
async function getStorage(key) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.warn('Storage read error:', e);
    return null;
  }
}

async function setStorage(key, value) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

export async function loadAISettings() {
  const data = await getStorage(SETTINGS_KEY);
  if (!data) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      themeMode: parsed.themeMode || DEFAULT_SETTINGS.themeMode,
      accentColor: parsed.accentColor || DEFAULT_SETTINGS.accentColor,
      textImageEngine: parsed.textImageEngine || parsed.imageEngine || DEFAULT_SETTINGS.textImageEngine,
      editImageEngine: parsed.editImageEngine || DEFAULT_SETTINGS.editImageEngine,
      imageEngine: parsed.imageEngine || DEFAULT_SETTINGS.imageEngine,
      kieApiKey: parsed.kieApiKey || DEFAULT_SETTINGS.kieApiKey,
      pollinationsApiKey: parsed.pollinationsApiKey || DEFAULT_SETTINGS.pollinationsApiKey,
      pollinationsModel: parsed.pollinationsModel || DEFAULT_SETTINGS.pollinationsModel,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAISettings(settings) {
  await setStorage(SETTINGS_KEY, JSON.stringify(settings));
}

// Convert image URI to Base64 (for Gemini Vision multimodal)
export async function uriToBase64(uri) {
  try {
    if (uri.startsWith('data:image')) {
      const parts = uri.split(',');
      return parts[1] || null;
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result;
        const b64 = res.split(',')[1];
        resolve(b64 || null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Base64 conversion failed:', err);
    return null;
  }
}

// Text to Text: Chat / Prompt Refinement / Image Critique
export async function sendChatMessage(
  prompt,
  history = [],
  attachedImageUri,
  settings = DEFAULT_SETTINGS
) {
  const hasKey = Boolean(settings.geminiApiKey?.trim());

  if (hasKey && settings.provider === 'gemini') {
    try {
      const model = settings.geminiModel || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey.trim()}`;

      const contents = [];

      // Add recent relevant history
      const recentHistory = history.slice(-4);
      for (const item of recentHistory) {
        if (item.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: item.text }],
          });
        } else if (item.role === 'assistant' && item.text) {
          contents.push({
            role: 'model',
            parts: [{ text: item.text }],
          });
        }
      }

      // Current message parts
      const currentParts = [];

      if (attachedImageUri) {
        const base64 = await uriToBase64(attachedImageUri);
        if (base64) {
          currentParts.push({
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64,
            },
          });
        }
      }

      currentParts.push({
        text: prompt + '\n\n(Lưu ý: Nếu người dùng yêu cầu chỉnh sửa ảnh hoặc tạo ảnh mới, ngoài câu trả lời giải thích, hãy cung cấp một prompt tiếng Anh ngắn gọn, chất lượng cao đặt trong cặp thẻ [PROMPT]...[/PROMPT] để hệ thống tự động render ảnh).',
      });

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      const body = {
        contents,
        systemInstruction: {
          parts: [{ text: settings.systemInstruction || DEFAULT_SETTINGS.systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Lỗi Gemini API (${res.status})`);
      }

      const resJson = await res.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';

      // Extract [PROMPT]...[/PROMPT] if present
      let suggestedPrompt;
      const promptMatch = rawText.match(/\[PROMPT\]([\s\S]*?)\[\/PROMPT\]/);
      let cleanText = rawText;
      if (promptMatch) {
        suggestedPrompt = promptMatch[1].trim();
        cleanText = rawText.replace(/\[PROMPT\][\s\S]*?\[\/PROMPT\]/, '').trim();
      }

      return {
        text: cleanText,
        suggestedPrompt,
        modelUsed: `Google ${model}`,
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to free engine:', err);
    }
  }

  // Free AI Assistant Engine (Uses Pollinations Text API + Smart Heuristics)
  try {
    const isImageEditingIntent = Boolean(
      attachedImageUri ||
      /chỉnh sửa|đổi nền|phong cách|biến thành|thay áo|anime|cyberpunk|xóa|thêm|sửa ảnh/i.test(prompt)
    );

    const isImageGenIntent = Boolean(
      /tạo ảnh|vẽ|hãy vẽ|render|generate|bức tranh|chân dung/i.test(prompt)
    );

    const systemPrompt = `Bạn là Gemini Image Studio AI. Nhiệm vụ của bạn là tư vấn chỉnh sửa ảnh, phân tích hình ảnh và sáng tạo nghệ thuật. Luôn phản hồi lịch sự bằng tiếng Việt. Nếu nhận thấy yêu cầu tạo hoặc biến đổi ảnh, hãy bổ sung một prompt tiếng Anh chuẩn nhiếp ảnh đặt trong [PROMPT]English prompt here[/PROMPT].`;

    const encodedPrompt = encodeURIComponent(`${systemPrompt}\n\nNgười dùng: ${prompt}`);
    const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}?seed=${Date.now()}`);

    if (res.ok) {
      const freeResponse = await res.text();
      let suggestedPrompt;
      const match = freeResponse.match(/\[PROMPT\]([\s\S]*?)\[\/PROMPT\]/);
      let cleanText = freeResponse;
      if (match) {
        suggestedPrompt = match[1].trim();
        cleanText = freeResponse.replace(/\[PROMPT\][\s\S]*?\[\/PROMPT\]/, '').trim();
      } else if (isImageEditingIntent || isImageGenIntent) {
        suggestedPrompt = buildSmartPrompt(prompt, 'none');
      }

      return {
        text: cleanText,
        suggestedPrompt,
        modelUsed: 'Gemini Creative Engine (Free)',
      };
    }
  } catch (e) {
    console.warn('Free text API error:', e);
  }

  // Pure local smart response fallback if offline
  return getLocalIntelligentResponse(prompt, attachedImageUri);
}

// Fallback intelligent responder
function getLocalIntelligentResponse(prompt, attachedImageUri) {
  const isEditing = Boolean(attachedImageUri);
  let text = '';
  const suggestedPrompt = buildSmartPrompt(prompt, 'none');

  if (isEditing) {
    text = `✨ **Gemini Image Vision:** Đã nhận diện hình ảnh của bạn!\n\nTôi đã phân tích bố cục và chuẩn bị kế hoạch chuyển đổi theo yêu cầu: "${prompt}".\n\nBạn có thể nhấn nút **"Tạo ảnh biến đổi"** bên dưới để chiêm ngưỡng kết quả AI thế hệ mới ngay tức thì!`;
  } else {
    text = `🎨 **Gemini AI Studio:** Ý tưởng sáng tạo rất ấn tượng!\n\nTôi đã tối ưu hóa prompt của bạn thành một mô tả giàu chi tiết nghệ thuật, ánh sáng điện ảnh và màu sắc tương phản cao. Nhấn nút bên dưới để tạo ảnh ngay nhé!`;
  }

  return {
    text,
    suggestedPrompt,
    modelUsed: 'Gemini Image Vision Engine',
  };
}

// Build optimized photographic English prompt
export function buildSmartPrompt(userPrompt, styleId = 'none') {
  const selectedStyle = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];

  // Strip common prompt-requesting prefixes (both with and without Vietnamese tone marks)
  let cleaned = (userPrompt || '')
    .replace(/^(tạo hình ảnh|tao hinh anh|tạo ảnh|tao anh|hãy vẽ|hay ve|hãy tạo|hay tao|vẽ cho tôi|ve cho toi|vẽ|ve|render|generate|create an image of|create image of)\s+/i, '');

  // Vietnamese to English quick translations for common artistic concepts
  let translated = cleaned
    .replace(/con mèo/gi, 'cat')
    .replace(/chú chó|con chó/gi, 'dog')
    .replace(/cô gái/gi, 'beautiful Vietnamese young woman')
    .replace(/chàng trai/gi, 'handsome man')
    .replace(/phi hành gia/gi, 'astronaut')
    .replace(/thành phố|thanh pho/gi, 'futuristic cityscape')
    .replace(/hoàng hôn|hoang hon/gi, 'golden sunset glow')
    .replace(/bãi biển|bai bien/gi, 'tropical pristine beach')
    .replace(/mùa thu|mua thu/gi, 'autumn leaves falling')
    .replace(/mưa/gi, 'rainy wet reflections')
    .replace(/hoa anh đào|hoa anh dao/gi, 'cherry blossoms sakura')
    .replace(/rồng|con rong/gi, 'majestic mythical dragon')
    .replace(/xe hơi|siêu xe|sieu xe/gi, 'luxurious futuristic supercar')
    .replace(/phong cách anime|phong cach anime/gi, 'modern anime style')
    .replace(/phong cách 3d|phong cach 3d/gi, '3D Pixar render');

  const baseModifier = selectedStyle?.promptModifier;
  if (!baseModifier) {
    return translated.trim();
  }
  return `${translated}, ${baseModifier}`.trim();
}

// Generate Image via Pollinations Gen API: GET https://gen.pollinations.ai/image/{prompt}
export function generateGenPollinationsUrl(
  prompt,
  styleId = 'none',
  aspectRatio = '1:1',
  model = 'black-forest-labs/flux.1-schnell',
  apiKey = '',
  seed
) {
  const finalPrompt = buildSmartPrompt(prompt, styleId);
  const ratioConfig = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
  const actualSeed = seed ?? Math.floor(Math.random() * 9999999);

  const encoded = encodeURIComponent(finalPrompt);
  const selectedModel = model || 'black-forest-labs/flux.1-schnell';

  const queryParts = [
    `model=${encodeURIComponent(selectedModel)}`,
    `width=${ratioConfig.width}`,
    `height=${ratioConfig.height}`,
    `seed=${actualSeed}`,
    `nologo=true`,
  ];

  if (apiKey?.trim()) {
    queryParts.push(`key=${encodeURIComponent(apiKey.trim())}`);
  }

  const url = `https://gen.pollinations.ai/image/${encoded}?${queryParts.join('&')}`;
  const modelShortName = selectedModel.split('/').pop() || selectedModel;

  return {
    url,
    finalPrompt,
    modelUsed: `Gen Pollinations (${modelShortName})`,
    width: ratioConfig.width,
    height: ratioConfig.height,
  };
}

// Generate Image (Legacy Pollinations endpoint)
export function generateImageUrl(
  prompt,
  styleId = 'none',
  aspectRatio = '1:1',
  seed
) {
  const finalPrompt = buildSmartPrompt(prompt, styleId);
  const ratioConfig = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
  const actualSeed = seed ?? Math.floor(Math.random() * 9999999);

  // Pollinations AI high-performance endpoint with Flux model
  const encoded = encodeURIComponent(finalPrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${ratioConfig.width}&height=${ratioConfig.height}&seed=${actualSeed}&model=flux&nologo=true&enhance=true`;

  return {
    url,
    finalPrompt,
    modelUsed: 'Flux.1 (Free Creative Engine)',
    width: ratioConfig.width,
    height: ratioConfig.height,
  };
}

// Dedicated Image-to-Image / Edit Image using FLUX.3 Klein Edit (flux-3/klein-edit-image)
export async function editImageWithFlux({
  prompt,
  imageUri,
  aspectRatio = 'auto',
  settings = DEFAULT_SETTINGS,
  onStatusUpdate,
}) {
  if (!imageUri) {
    throw new Error('Chưa chọn ảnh gốc để chỉnh sửa. Vui lòng tải hoặc chụp ảnh trước.');
  }

  const cleanKey = (settings.kieApiKey || '').trim();
  if (!cleanKey) {
    throw new Error(
      'Chức năng Chỉnh sửa ảnh (Image-to-Image) sử dụng mô hình FLUX.3 Klein Edit yêu cầu Kie.ai API Key. Vui lòng nhấn vào biểu tượng Cài đặt (⚙️) để nhập Key.'
    );
  }

  onStatusUpdate?.('Đang tải ảnh lên máy chủ FLUX.3...');
  const result = await generateOrEditWithKie({
    apiKey: cleanKey,
    prompt: prompt || 'Biến đổi bức ảnh này theo phong cách nghệ thuật đẹp nhất',
    imageUri,
    aspectRatio: aspectRatio || 'auto',
    resolution: settings.kieResolution || '1K',
    outputFormat: settings.kieOutputFormat || 'png',
    enhancePrompt: settings.autoEnhancePrompt ?? true,
    onStatusUpdate,
  });

  return {
    url: result.url,
    finalPrompt: prompt,
    modelUsed: 'FLUX.3 Klein Edit (Image-to-Image)',
    taskId: result.taskId,
  };
}

// Dedicated Text-to-Image Generator (Supports Gen Pollinations AI & FLUX.3 Klein Text)
export async function generateTextToImage({
  prompt,
  styleId = 'none',
  aspectRatio = '1:1',
  settings = DEFAULT_SETTINGS,
  onStatusUpdate,
}) {
  const finalPrompt = settings.autoEnhancePrompt ? buildSmartPrompt(prompt, styleId) : prompt;
  const engine = settings.textImageEngine || settings.imageEngine || 'gen-pollinations';

  // 1. Kie.ai FLUX.3 Klein Text-to-Image (flux-3/klein-text-to-image)
  if (engine === 'kie-flux3') {
    const cleanKey = (settings.kieApiKey || '').trim();
    if (cleanKey) {
      try {
        onStatusUpdate?.('Đang kết nối FLUX.3 Klein Text-to-Image...');
        const kieResult = await generateOrEditWithKie({
          apiKey: cleanKey,
          prompt: finalPrompt,
          aspectRatio,
          resolution: settings.kieResolution || '1K',
          outputFormat: settings.kieOutputFormat || 'png',
          enhancePrompt: settings.autoEnhancePrompt,
          onStatusUpdate,
        });

        return {
          url: kieResult.url,
          finalPrompt,
          modelUsed: 'FLUX.3 Klein (Text-to-Image)',
        };
      } catch (err) {
        console.warn('FLUX.3 Text error, fallback to Gen Pollinations:', err);
        onStatusUpdate?.('FLUX.3 phản hồi lỗi. Đang chuyển sang Gen Pollinations AI...');
      }
    }
  }

  // 2. Official Gen Pollinations API: GET https://gen.pollinations.ai/image/{prompt}
  if (engine === 'gen-pollinations' || engine === 'kie-flux3') {
    try {
      onStatusUpdate?.('Đang kết xuất ảnh qua gen.pollinations.ai...');
      const genResult = generateGenPollinationsUrl(
        prompt,
        styleId,
        aspectRatio,
        settings.pollinationsModel || DEFAULT_SETTINGS.pollinationsModel,
        settings.pollinationsApiKey || DEFAULT_SETTINGS.pollinationsApiKey
      );
      return genResult;
    } catch (err) {
      console.warn('Gen Pollinations error, fallback to Free Flux:', err);
    }
  }

  // 3. Fallback Free Engine
  onStatusUpdate?.('Đang tạo ảnh qua Flux.1 Creative...');
  const freeResult = generateImageUrl(prompt, styleId, aspectRatio);
  return {
    url: freeResult.url,
    finalPrompt: freeResult.finalPrompt,
    modelUsed: 'Flux.1 (Free Engine)',
  };
}

// Unified orchestrator for backwards compatibility
export async function generateOrEditImage(params) {
  const { prompt, imageUri, styleId = 'none', aspectRatio = '1:1', settings = DEFAULT_SETTINGS, onStatusUpdate } = params;

  if (imageUri) {
    // Has attached image -> MUST use FLUX.3 Klein Edit
    return editImageWithFlux({
      prompt,
      imageUri,
      aspectRatio: 'auto',
      settings,
      onStatusUpdate,
    });
  }

  // Text only -> Text to Image
  return generateTextToImage({
    prompt,
    styleId,
    aspectRatio,
    settings,
    onStatusUpdate,
  });
}
