import type { PolicyDocument } from '@/features/policies/types/policy';

export const TERMS_OF_SERVICE: PolicyDocument = {
  slug: 'terms',
  title: 'Điều khoản dịch vụ',
  summary:
    'Điều khoản này điều chỉnh việc bạn sử dụng website, ứng dụng và dịch vụ của StAle. (FashionAI), gồm mua sắm may đo, thử đồ AI, AI Stylist, chatbot và gói hội viên.',
  updatedAt: '19/10/2026',
  sections: [
    {
      id: 'chap-nhan',
      title: 'Chấp nhận điều khoản',
      blocks: [
        {
          type: 'paragraph',
          text: 'Khi tạo tài khoản hoặc sử dụng dịch vụ, bạn đồng ý với Điều khoản dịch vụ này cùng Chính sách bảo mật, Chính sách đổi trả và Chính sách bảo hành. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.',
        },
      ],
    },
    {
      id: 'tai-khoan',
      title: 'Tài khoản',
      blocks: [
        {
          type: 'list',
          items: [
            'Cung cấp thông tin chính xác và xác minh email khi đăng ký.',
            'Tự bảo mật mật khẩu và chịu trách nhiệm cho mọi hoạt động trên tài khoản của mình.',
            'Báo ngay cho StAle. nếu phát hiện tài khoản bị truy cập trái phép.',
            'StAle. có thể tạm khóa hoặc chấm dứt tài khoản có hành vi gian lận, lạm dụng khuyến mãi, lạm dụng tính năng AI hoặc vi phạm pháp luật.',
          ],
        },
      ],
    },
    {
      id: 'dat-hang',
      title: 'Đặt hàng, giá và thanh toán',
      blocks: [
        {
          type: 'list',
          items: [
            'Giá niêm yết bằng Việt Nam đồng. Tổng tiền cuối cùng, gồm phí vận chuyển và giảm giá, do hệ thống tính và hiển thị ở bước thanh toán; đó là số tiền bạn trả.',
            'Thanh toán trực tuyến qua ZaloPay hoặc SePay. Đơn hàng được xác nhận sau khi thanh toán thành công.',
            'Đơn hàng chỉ đặt được khi hồ sơ có đủ số đo bắt buộc cho loại trang phục. Bạn chịu trách nhiệm về độ chính xác của số đo đã nhập.',
            'Mã giảm giá áp dụng theo điều kiện riêng của từng mã và không quy đổi thành tiền mặt.',
            'Nếu giá hiển thị sai rõ ràng do lỗi hệ thống, StAle. có quyền hủy đơn và hoàn lại toàn bộ số tiền đã thanh toán.',
          ],
        },
      ],
    },
    {
      id: 'may-do-giao-hang',
      title: 'May đo và giao hàng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sau khi thanh toán, đơn hàng đi qua các bước: xác nhận, kiểm tra số đo, may, kiểm tra chất lượng và giao hàng. Nếu số đo cần làm rõ, StAle. sẽ yêu cầu bạn kiểm tra lại trước khi may; thời gian giao dự kiến có thể lùi lại tương ứng.',
        },
        {
          type: 'list',
          items: [
            'Hàng được giao bởi Giao Hàng Nhanh (GHN); phí vận chuyển tính theo địa chỉ nhận hàng.',
            'Vui lòng kiểm tra sản phẩm khi nhận và bấm "Đã nhận hàng" trong mục Đơn hàng của tôi.',
            'Đổi trả, hoàn tiền và bảo hành thực hiện theo các chính sách tương ứng.',
          ],
        },
      ],
    },
    {
      id: 'tinh-nang-ai',
      title: 'Tính năng AI',
      blocks: [
        {
          type: 'list',
          items: [
            'Ảnh thử đồ AI và thử đồ trực tiếp là hình minh họa do AI tạo, có thể khác sản phẩm thực tế về màu sắc, chất liệu và độ vừa vặn.',
            'Gợi ý phối đồ và tư vấn số đo từ AI Stylist, chatbot chỉ mang tính tham khảo, không thay thế số đo thực tế của bạn.',
            'Chỉ tải lên ảnh của chính bạn hoặc ảnh bạn có quyền sử dụng. Không tải ảnh trẻ em, ảnh khỏa thân hoặc ảnh người khác khi chưa có sự đồng ý của họ.',
            'Lượt sử dụng AI giới hạn theo gói và được làm mới mỗi ngày. Không dùng công cụ tự động để khai thác dịch vụ.',
          ],
        },
      ],
    },
    {
      id: 'goi-hoi-vien',
      title: 'Gói hội viên',
      blocks: [
        {
          type: 'list',
          items: [
            'Gói Member và VIP có hiệu lực 30 ngày kể từ khi thanh toán thành công. Giá và quyền lợi hiện hành được công bố tại trang Gói hội viên.',
            'Mỗi kỳ được thanh toán một lần; StAle. không tự động trừ tiền từ tài khoản thanh toán của bạn.',
            'Lượt dùng chưa hết trong ngày không được cộng dồn sang ngày sau.',
            'Phí gói đã thanh toán không được hoàn lại, trừ trường hợp lỗi hệ thống khiến bạn không sử dụng được quyền lợi của gói.',
          ],
        },
        { type: 'link', link: { label: 'Xem các gói hội viên', href: '/subscription' } },
      ],
    },
    {
      id: 'noi-dung',
      title: 'Nội dung và sở hữu trí tuệ',
      blocks: [
        {
          type: 'list',
          items: [
            'Thiết kế, hình ảnh, logo và nội dung trên StAle. thuộc quyền sở hữu của StAle. hoặc đối tác cấp phép, không được sao chép khi chưa có sự đồng ý bằng văn bản.',
            'Bạn giữ quyền với đánh giá và hình ảnh mình đăng, đồng thời cho phép StAle. hiển thị chúng trên website và ứng dụng.',
            'StAle. có quyền ẩn đánh giá chứa nội dung sai sự thật, xúc phạm, quảng cáo hoặc vi phạm pháp luật.',
          ],
        },
      ],
    },
    {
      id: 'hanh-vi-cam',
      title: 'Hành vi bị cấm',
      blocks: [
        {
          type: 'list',
          items: [
            'Truy cập trái phép, dò quét lỗ hổng hoặc gây quá tải hệ thống.',
            'Sử dụng tài khoản, phương thức thanh toán của người khác khi chưa được phép.',
            'Tạo nhiều tài khoản để trục lợi khuyến mãi hoặc lượt dùng AI.',
            'Dùng tính năng AI để tạo nội dung khiêu dâm, bạo lực, mạo danh hoặc xâm phạm quyền của người khác.',
          ],
        },
      ],
    },
    {
      id: 'trach-nhiem',
      title: 'Giới hạn trách nhiệm',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dịch vụ có thể tạm gián đoạn để bảo trì hoặc do sự cố từ đối tác. StAle. không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ. Trong mọi trường hợp, trách nhiệm của StAle. không vượt quá giá trị đơn hàng hoặc gói hội viên liên quan.',
        },
      ],
    },
    {
      id: 'luat-ap-dung',
      title: 'Luật áp dụng và giải quyết tranh chấp',
      blocks: [
        {
          type: 'paragraph',
          text: 'Điều khoản này được điều chỉnh theo pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không đạt được thỏa thuận, các bên có quyền đưa vụ việc ra tòa án có thẩm quyền tại TP. Hồ Chí Minh.',
        },
      ],
    },
    {
      id: 'thay-doi',
      title: 'Thay đổi điều khoản',
      blocks: [
        {
          type: 'paragraph',
          text: 'StAle. có thể cập nhật điều khoản khi dịch vụ thay đổi. Phiên bản mới có hiệu lực từ ngày ghi ở đầu trang; việc tiếp tục sử dụng dịch vụ sau ngày đó đồng nghĩa với việc bạn chấp nhận điều khoản mới.',
        },
      ],
    },
  ],
};
