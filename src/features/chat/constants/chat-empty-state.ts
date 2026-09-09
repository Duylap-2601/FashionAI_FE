import { Compass, Ruler, Shirt, Sparkles } from 'lucide-react';

export const QUICK_PROMPTS = [
  {
    icon: Ruler,
    tag: 'Tư vấn kích thước',
    title: 'Gợi ý chọn size theo số đo',
    prompt: 'Dựa vào số đo trong hồ sơ của tôi, tôi nên chọn size nào cho các mẫu Blazer và Combo Suit?',
    color: 'border-amber-200/60 bg-amber-50/40 hover:bg-amber-50/80',
  },
  {
    icon: Shirt,
    tag: 'Mix & Match',
    title: 'Phối đồ công sở thanh lịch',
    prompt: 'Gợi ý cho tôi set đồ công sở thanh lịch, hiện đại và tôn dáng cho các buổi gặp đối tác?',
    color: 'border-rose-200/60 bg-rose-50/40 hover:bg-rose-50/80',
  },
  {
    icon: Compass,
    tag: 'Phong cách',
    title: 'Trang phục tôn dáng cho sự kiện',
    prompt: 'Tôi muốn tìm trang phục dạ tiệc sang trọng, bạn có thể gợi ý kiểu dáng và màu sắc phù hợp?',
    color: 'border-indigo-200/60 bg-indigo-50/40 hover:bg-indigo-50/80',
  },
  {
    icon: Sparkles,
    tag: 'AI Features',
    title: 'Hướng dẫn sử dụng AI Try-On',
    prompt: 'Làm thế nào để chụp ảnh và trải nghiệm thử đồ ảo (Try-On) đạt kết quả chân thực nhất?',
    color: 'border-emerald-200/60 bg-emerald-50/40 hover:bg-emerald-50/80',
  },
];
