# ME_AI - AI Image Studio & Assistant 🎨✨

**ME_AI** là ứng dụng di động & web được phát triển bằng React Native (Expo), tích hợp các mô hình AI tiên tiến (Gemini, Pollinations AI, FLUX.3) hỗ trợ sáng tạo hình ảnh, chỉnh sửa ảnh thông minh và trợ lý đàm thoại đa phương thức.

---

## 🚀 Tính năng nổi bật

- **Tạo ảnh từ văn bản (Text-to-Image):** Sử dụng các mô hình hàng đầu (FLUX.1 Schnell, FLUX.3 Klein, Gen Pollinations).
- **Chỉnh sửa ảnh chuyên sâu (Image-to-Image / Inpainting):** Chuyển đổi phong cách, biến đổi chi tiết từ ảnh tải lên.
- **Trợ lý AI Gemini:** Tư vấn nghệ thuật, phân tích bố cục hình ảnh và tự động tối ưu hóa prompt nghệ thuật.
- **Tùy chỉnh đa dạng:** Hỗ trợ nhiều tỷ lệ khung hình (1:1, 16:9, 9:16, 4:3, 3:4...), chọn phong cách (Anime, Cyberpunk, 3D Render, Điện ảnh, Sơn dầu...).
- **Giao diện hiện đại & mượt mà:** Chế độ Dark mode, OLED, Midnight với hiệu ứng mượt mà trên cả Mobile và Web.

---

## 🛠️ Công nghệ sử dụng

- **Framework:** [Expo](https://expo.dev/) (SDK 52+) với Expo Router & React Native
- **AI Engines:**
  - Google Gemini API (Multimodal Vision & Chat)
  - Gen Pollinations AI API
  - FLUX.3 Klein (Text & Image edit)
- **UI & Icons:** Lucide Icons, Expo Vector Icons, Custom Design System

---

## 📦 Cài đặt & Chạy ứng dụng

### 1. Cài đặt dependencies

```bash
# Sử dụng pnpm hoặc npm
pnpm install
# hoặc
npm install
```

### 2. Khởi động ứng dụng

```bash
npx expo start
```

Trong terminal, bạn có thể:
- Nhấn `w` để mở phiên bản Web
- Nhấn `a` để chạy trên Android Emulator / Thiết bị Android
- Nhấn `i` để chạy trên iOS Simulator
- Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại

---

## ⚙️ Cấu hình API Key (Tùy chọn)

Ứng dụng hỗ trợ sẵn các mô hình miễn phí. Để nâng cao chất lượng tạo ảnh và tốc độ xử lý:
1. Mở ứng dụng và nhấn vào biểu tượng **Cài đặt (⚙️)** ở góc trên.
2. Nhập API Key:
   - **Google Gemini API Key:** Nhận miễn phí tại [Google AI Studio](https://aistudio.google.com/)
   - **Kie.ai API Key:** Sử dụng cho các mô hình FLUX.3 Klein cao cấp
   - **Pollinations API Key:** Tùy chọn để tăng tốc độ phản hồi

---

## 📄 Bản quyền & Giấy phép

Phát triển bởi [LuciusANDLucius](https://github.com/LuciusANDLucius). Giấy phép MIT.
