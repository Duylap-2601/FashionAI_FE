import {
  ChatContextPayload,
  ChatProductContext
} from '@/features/chat/types/chat';

export function isUuid(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

export async function simulateAssistantStream(
  userQuery: string,
  product: ChatProductContext | null | undefined,
  context: ChatContextPayload,
  signal: AbortSignal,
  onToken: (token: string) => void
) {
  const queryLower = userQuery.toLowerCase();
  let fullResponse = '';

  const m = context.measurements;
  const mInfo = m && (m.height || m.weight || m.chest)
    ? `Dựa trên số đo trong hồ sơ của bạn (**Chiều cao:** ${m.height || '—'}cm, **Cân nặng:** ${m.weight || '—'}kg, **Vòng ngực:** ${m.chest || '—'}cm, **Vòng eo:** ${m.waist || '—'}cm, **Vòng hông:** ${m.hip || '—'}cm):\n\n`
    : '';

  if (product) {
    if (queryLower.includes('size') || queryLower.includes('kích cỡ')) {
      fullResponse = `Chào bạn! Về sản phẩm **${product.name}**:\n\n${mInfo}✨ **Gợi ý size tối ưu:** Size **M** sẽ vừa vặn và tôn dáng nhất cho bạn. Dáng áo suông nhẹ với độ cử động thoải mái.\n\n💡 **Mẹo:** Nếu bạn thích phong cách rộng rãi phóng khoáng hơn (oversized), có thể cân nhắc chọn size **L**. Bạn có muốn xem thêm bảng thông số chi tiết của sản phẩm không?`;
    } else if (queryLower.includes('phối') || queryLower.includes('mix') || queryLower.includes('mặc với')) {
      fullResponse = `Dưới đây là một số gợi ý phối đồ cực kỳ thanh lịch với **${product.name}**:\n\n1. **Phong cách Công sở Hiện đại:** Phối cùng quần tây ống suông cạp cao và giày cao gót mũi nhọn.\n2. **Phong cách Smart Casual:** Kết hợp áo phông trơn tối giản bên trong + chân váy midi xếp ly hoặc quần jeans ống đứng.\n3. **Phụ kiện đi kèm:** Túi xách da tone đen/burgundy và đồng hồ dây kim loại thanh mảnh.\n\nBạn muốn gợi ý trang phục cho dịp cụ thể nào?`;
    } else {
      fullResponse = `Chào bạn! Tôi rất vui được tư vấn về **${product.name}** (${product.price || 'Giá liên hệ'}).\n\n${mInfo}Sản phẩm này thuộc dòng thời trang cao cấp với chất liệu thoáng mát, giữ form chuẩn và đường may tỉ mỉ. Bạn cần tôi hỗ trợ tư vấn chọn size, cách phối màu hay kiểm tra tình trạng hàng?`;
    }
  } else if (queryLower.includes('size') || queryLower.includes('số đo')) {
    fullResponse = `Chào bạn! Để chọn size trang phục chuẩn xác nhất:\n\n${mInfo ? mInfo + 'Tôi sẽ dựa vào số đo này để gợi ý trực tiếp trên từng sản phẩm bạn quan tâm.' : 'Bạn có thể vào mục **Hồ sơ → Số đo cơ thể** để cập nhật chiều cao, cân nặng và các số đo chính. AI sẽ tự động phân tích và gợi ý size vừa vặn nhất cho từng dáng trang phục.'}\n\nBạn đang quan tâm đến sản phẩm hoặc phân loại nào (Blazer, Suit, Đầm hay Quần tây)?`;
  } else if (queryLower.includes('try on') || queryLower.includes('thử đồ') || queryLower.includes('ảo')) {
    fullResponse = `Tính năng **✦ AI Try-On (Thử đồ ảo)** tại StAle. cho phép bạn:\n\n1. Chọn bất kỳ sản phẩm nào trong bộ sưu tập.\n2. Tải lên một bức ảnh toàn thân của bạn.\n3. AI sẽ tự động xử lý và mô phỏng trang phục trên vóc dáng thật chỉ trong ~15–20 giây!\n\nBạn có thể nhấn vào tab **✦ Try-On** trên thanh điều hướng để trải nghiệm ngay nhé!`;
  } else {
    fullResponse = `Xin chào! Tôi là trợ lý thời trang thông minh **StAle. AI Assistant** ✨\n\nTôi có thể giúp bạn:\n- 📏 **Tư vấn chọn size chuẩn** dựa trên số đo cơ thể cá nhân.\n- 👗 **Gợi ý phối đồ (Mix & Match)** theo từng sự kiện (công sở, dạ tiệc, dạo phố).\n- 🛍️ **Giải đáp thông tin sản phẩm**, chất liệu, màu sắc và kiểu dáng.\n- 📸 **Hướng dẫn sử dụng AI Try-On & 3D Fitting**.\n\nHôm nay bạn cần tìm kiếm phong cách thời trang nào?`;
  }

  // Tokenize response into words/chunks
  const tokens = fullResponse.match(/(\s+|\S+)/g) || [fullResponse];

  for (const token of tokens) {
    if (signal.aborted) break;
    onToken(token);
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 25));
  }
}
