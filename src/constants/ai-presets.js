export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Vuông', width: 1024, height: 1024, iconName: 'square' },
  { id: '16:9', label: '16:9 Ngang', width: 1280, height: 720, iconName: 'aspectratio' },
  { id: '9:16', label: '9:16 Dọc/Story', width: 720, height: 1280, iconName: 'rectangle.portrait' },
  { id: '4:3', label: '4:3 Chuẩn', width: 1024, height: 768, iconName: 'rectangle' },
  { id: '3:4', label: '3:4 Chân dung', width: 768, height: 1024, iconName: 'rectangle.portrait' },
];

export const STYLE_PRESETS = [
  {
    id: 'none',
    label: 'Tự nhiên / Auto',
    description: 'Giữ nguyên phong cách mô tả trong prompt của bạn',
    promptModifier: 'high quality, 8k resolution, detailed, masterpiece',
    gradientColors: ['#6366f1', '#a855f7'],
    emoji: '✨',
  },
  {
    id: 'cinematic',
    label: 'Điện ảnh 8K',
    description: 'Chụp hình chân thực như phim Hollywood đỉnh cao',
    promptModifier:
      'cinematic photography, 8k resolution, photorealistic, shot on 35mm lens, dramatic lighting, depth of field, hyper-detailed, masterpiece',
    gradientColors: ['#f59e0b', '#ef4444'],
    emoji: '🎬',
  },
  {
    id: 'anime',
    label: 'Anime / Manga',
    description: 'Phong cách hoạt hình Nhật Bản phong cách Shinkai',
    promptModifier:
      'modern anime aesthetic, Makoto Shinkai style, vibrant colors, clean linework, beautiful dramatic sky, masterpiece digital illustration',
    gradientColors: ['#ec4899', '#8b5cf6'],
    emoji: '🌸',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Neon',
    description: 'Thành phố tương lai ánh đèn neon rực rỡ và mưa đêm',
    promptModifier:
      'cyberpunk futuristic city, neon glow, holographic reflections, wet streets, volumetric smoke, high tech, vivid blue and purple contrast, 8k',
    gradientColors: ['#06b6d4', '#3b82f6'],
    emoji: '⚡',
  },
  {
    id: '3d-pixar',
    label: '3D Pixar / Animation',
    description: 'Tạo hình 3D dễ thương, mượt mà chuẩn Pixar Disney',
    promptModifier:
      'charming 3D animated character, Pixar Disney movie style, octane render, soft subsurface scattering, vibrant lighting, highly detailed 3D model',
    gradientColors: ['#10b981', '#06b6d4'],
    emoji: '🧸',
  },
  {
    id: 'fantasy',
    label: 'Thần thoại Fantasy',
    description: 'Nghệ thuật huyền ảo, phép thuật và thế giới sử thi',
    promptModifier:
      'epic fantasy digital art, magical glowing particles, mystical atmosphere, majestic composition, artstation trending, dramatic fantasy lighting',
    gradientColors: ['#8b5cf6', '#ec4899'],
    emoji: '🔮',
  },
  {
    id: 'watercolor',
    label: 'Màu nước Aquarelle',
    description: 'Tranh vẽ màu nước thanh lịch, loang màu mộng mơ',
    promptModifier:
      'fine art watercolor painting, delicate pigment washes, soft bleeding edges on textured paper, artistic brushstrokes, dreamy pastel tones',
    gradientColors: ['#14b8a6', '#3b82f6'],
    emoji: '🎨',
  },
  {
    id: 'vintage',
    label: 'Vintage Hoài cổ',
    description: 'Nước ảnh phim cổ điển thập niên 80 ấm áp hoài niệm',
    promptModifier:
      'vintage 1980s 35mm photograph, Kodak film grain, warm nostalgic tones, soft natural backlight, authentic retro aesthetic',
    gradientColors: ['#d97706', '#b45309'],
    emoji: '🎞️',
  },
];

export const QUICK_PROMPTS = [
  {
    title: 'Đổi màu vật thể',
    modelTag: 'FLUX.3 Edit',
    iconName: 'wand',
    accentColor: '#f43f5e',
    prompt: 'Change the backpack to dark green and keep everything else unchanged',
    category: 'image-editing',
  },
  {
    title: 'Phi hành gia Cyberpunk',
    modelTag: 'FLUX.3 T2I',
    iconName: 'sparkles',
    accentColor: '#38bdf8',
    prompt: 'Một phi hành gia đứng giữa quảng trường thành phố Cyberpunk tương lai ngập tràn biển quảng cáo hologram và ánh sáng neon tím xanh, 8K điện ảnh',
    category: 'text-to-image',
  },
  {
    title: 'Phong cách Anime',
    modelTag: 'FLUX.3 Edit',
    iconName: 'palette',
    accentColor: '#ec4899',
    prompt: 'Hãy chuyển đổi bức ảnh này sang phong cách anime Makoto Shinkai với bầu trời hoàng hôn mộng mơ và ánh sáng lung linh',
    category: 'image-editing',
  },
  {
    title: 'Nền hoàng hôn biển',
    modelTag: 'FLUX.3 Edit',
    iconName: 'image',
    accentColor: '#fb923c',
    prompt: 'Giữ nguyên chủ thể trong ảnh và thay đổi toàn bộ khung cảnh nền thành một bãi biển nhiệt đới hoàng hôn với rặng dừa và sóng biển êm dịu',
    category: 'image-editing',
  },
  {
    title: 'Chân dung 8K Hollywood',
    modelTag: 'FLUX.3 T2I',
    iconName: 'camera',
    accentColor: '#a855f7',
    prompt: 'Ảnh chân dung chụp cận cảnh khuôn mặt với ánh sáng cinematic chiaroscuro tương phản cao, mắt sắc nét long lanh, tông màu lạnh sang trọng',
    category: 'text-to-image',
  },
  {
    title: 'Nhân vật 3D Pixar',
    modelTag: 'FLUX.3 T2I',
    iconName: 'zap',
    accentColor: '#10b981',
    prompt: 'Một chú mèo lông xù đeo kính phi công phong cách 3D hoạt hình Pixar đang ngồi lái phi thuyền mini xuyên qua những đám mây ngũ sắc',
    category: 'text-to-image',
  },
  {
    title: 'Tư vấn & Phân tích ảnh',
    modelTag: 'Vision AI',
    iconName: 'eye',
    accentColor: '#6366f1',
    prompt: 'Hãy phân tích bố cục, ánh sáng và màu sắc của bức ảnh này, sau đó gợi ý cách cải thiện hoặc chỉnh sửa để ảnh trở nên ấn tượng hơn',
    category: 'text-to-text',
  },
];

export const POLLINATIONS_MODELS = [
  {
    id: 'black-forest-labs/flux.1-schnell',
    name: 'FLUX.1 Schnell (Mặc định)',
    desc: 'Tốc độ siêu nhanh, chi tiết chân thực cao',
    badge: 'Fast',
  },
  {
    id: 'black-forest-labs/flux.1-pro',
    name: 'FLUX.1 Pro (Chất lượng cao)',
    desc: 'Mô hình Pro độ phân giải và chi tiết tối đa',
    badge: 'Pro',
  },
  {
    id: 'openai/gpt-image-1',
    name: 'OpenAI GPT Image',
    desc: 'Mô hình tạo hình ảnh từ OpenAI',
    badge: 'OpenAI',
  },
  {
    id: 'tongyi-mai/z-image-turbo',
    name: 'Z-Image Turbo',
    desc: 'Xử lý phong cách nghệ thuật Châu Á',
    badge: 'Turbo',
  },
  {
    id: 'bytedance/seedream-4.0',
    name: 'ByteDance Seedream 4.0',
    desc: 'Phong cách hoạt hình, chân dung anime ấn tượng',
    badge: 'Anime',
  },
];
