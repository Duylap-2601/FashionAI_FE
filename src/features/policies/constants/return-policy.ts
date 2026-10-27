import { POLICY_CONTACT } from '@/features/policies/constants/policy-nav';
import type { PolicyDocument } from '@/features/policies/types/policy';

// The 7-day window, reasons, resolutions, description length and evidence
// limits mirror the backend order-issue rules and the report-issue modal.
export const RETURN_POLICY: PolicyDocument = {
  slug: 'return-policy',
  title: 'Chính sách đổi trả',
  summary:
    'Mỗi sản phẩm StAie. được may riêng theo số đo của bạn. Nếu sản phẩm nhận được may sai số đo, sai màu hoặc có lỗi, bạn có 7 ngày để gửi yêu cầu đổi hàng hoặc hoàn tiền ngay trong trang đơn hàng.',
  updatedAt: '19/10/2026',
  highlights: [
    { label: 'Thời hạn gửi yêu cầu', value: '7 ngày' },
    { label: 'Tính từ', value: 'Khi đơn hoàn tất' },
    { label: 'Hướng xử lý', value: 'Đổi hàng hoặc hoàn tiền' },
  ],
  sections: [
    {
      id: 'pham-vi',
      title: 'Phạm vi áp dụng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chính sách áp dụng cho mọi đơn hàng đặt trên website và ứng dụng StAie. (FashionAI). Vì sản phẩm được cắt may theo số đo bạn lưu trong hồ sơ, việc đổi trả tập trung vào lỗi phát sinh từ phía StAie.: may sai số đo, giao sai màu hoặc lỗi chất lượng.',
        },
      ],
    },
    {
      id: 'thoi-han',
      title: 'Thời hạn gửi yêu cầu',
      blocks: [
        {
          type: 'list',
          items: [
            'Bạn có 7 ngày kể từ khi đơn hàng chuyển sang trạng thái "Hoàn tất" để gửi yêu cầu.',
            'Đơn hàng chuyển sang "Hoàn tất" khi bạn bấm "Đã nhận hàng" trong mục Đơn hàng của tôi, hoặc khi đơn được xác nhận đã giao thành công.',
            'Sau 7 ngày, hệ thống không nhận yêu cầu đổi trả mới. Lỗi đường may hoặc phụ kiện phát sinh sau thời hạn này vẫn được bảo hành trọn đời, miễn phí theo Chính sách bảo hành.',
          ],
        },
      ],
    },
    {
      id: 'truong-hop',
      title: 'Các trường hợp được đổi trả',
      blocks: [
        {
          type: 'table',
          columns: ['Lý do', 'Ví dụ', 'Phí vận chuyển'],
          rows: [
            ['Sai kích thước / số đo', 'Sản phẩm lệch so với số đo đã chốt trong đơn quá ±1 cm (số đo vòng) hoặc ±1,5 cm (số đo dài)', 'StAie. chịu'],
            ['Sai màu sắc', 'Nhận màu khác với màu bạn đã chọn khi đặt hàng', 'StAie. chịu'],
            ['Lỗi đường may / chất lượng vải', 'Bung chỉ, lệch đường may, vải lỗi, khuy hoặc khóa kéo hỏng', 'StAie. chịu'],
            ['Lý do khác', 'Không còn ưng kiểu dáng, đổi ý sau khi nhận hàng', 'Thẩm định riêng; nếu được chấp thuận, bạn chịu phí vận chuyển'],
          ],
        },
        {
          type: 'note',
          tone: 'warning',
          text: 'Sản phẩm may đúng số đo bạn đã nhập nhưng không vừa vì số đo tự đo chưa chính xác không thuộc diện đổi miễn phí. StAie. vẫn hỗ trợ chỉnh sửa theo Chính sách bảo hành.',
          link: { label: 'Xem Chính sách bảo hành', href: '/warranty' },
        },
      ],
    },
    {
      id: 'dieu-kien',
      title: 'Điều kiện sản phẩm',
      blocks: [
        {
          type: 'list',
          items: [
            'Chưa qua giặt, là (ủi) hoặc sửa chữa ở nơi khác.',
            'Còn nguyên nhãn mác, phụ kiện và bao bì đi kèm (nếu có).',
            'Không có vết bẩn, mùi lạ hay hư hỏng do quá trình sử dụng.',
            'Mỗi sản phẩm chỉ có một yêu cầu đang được xử lý tại một thời điểm.',
          ],
        },
      ],
    },
    {
      id: 'cach-gui',
      title: 'Cách gửi yêu cầu',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Đăng nhập, vào Hồ sơ → Đơn hàng của tôi và mở đơn hàng đã hoàn tất.',
            'Bấm "Báo lỗi sản phẩm này" ở sản phẩm cần xử lý.',
            'Chọn lý do, hướng xử lý mong muốn (đổi hàng hoặc hoàn tiền) và mô tả vấn đề trong 10 - 2.000 ký tự.',
            'Đính kèm tối đa 10 ảnh minh chứng, mỗi ảnh không quá 10MB. Nên chụp toàn bộ sản phẩm, cận cảnh vị trí lỗi và nhãn mác.',
            'Theo dõi trạng thái trong trang chi tiết đơn hàng. Bạn sẽ nhận thông báo khi yêu cầu được duyệt hoặc từ chối.',
          ],
        },
        { type: 'link', link: { label: 'Đến Đơn hàng của tôi', href: '/profile/orders' } },
      ],
    },
    {
      id: 'tham-dinh',
      title: 'Thẩm định và kết quả',
      blocks: [
        {
          type: 'paragraph',
          text: 'Bộ phận chăm sóc khách hàng thẩm định yêu cầu trong 1 - 3 ngày làm việc dựa trên mô tả, ảnh minh chứng và bản số đo đã lưu trong đơn. StAie. có thể chọn hướng xử lý khác với hướng bạn đề xuất nếu phù hợp hơn với tình trạng sản phẩm, và luôn ghi rõ lý do khi từ chối.',
        },
        {
          type: 'list',
          items: [
            { term: 'Chờ xử lý', text: 'Yêu cầu đã được gửi và đang thẩm định.' },
            { term: 'Đã duyệt', text: 'Yêu cầu đổi hàng được chấp thuận; StAie. liên hệ hướng dẫn gửi trả sản phẩm.' },
            { term: 'Từ chối', text: 'Yêu cầu không được chấp thuận, kèm lý do cụ thể.' },
            { term: 'Đã giải quyết', text: 'Đã hoàn tiền hoặc đã giao sản phẩm thay thế.' },
          ],
        },
      ],
    },
    {
      id: 'hoan-tien',
      title: 'Hoàn tiền',
      blocks: [
        {
          type: 'list',
          items: [
            'Số tiền hoàn bằng giá bạn thực trả cho sản phẩm đó (sau khi trừ mã giảm giá).',
            'Với lỗi từ phía StAie., phí vận chuyển của sản phẩm cũng được hoàn.',
            'Tiền được hoàn qua chuyển khoản ngân hàng hoặc kênh thanh toán ban đầu trong 5 - 7 ngày làm việc kể từ khi yêu cầu được duyệt.',
          ],
        },
      ],
    },
    {
      id: 'doi-hang',
      title: 'Đổi hàng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sản phẩm thay thế được may lại theo số đo đã chốt, hoặc theo số đo điều chỉnh sau khi trao đổi với bạn, và giao miễn phí. Thời gian may lại tương đương một đơn hàng mới; StAie. sẽ báo ngày giao dự kiến khi duyệt yêu cầu.',
        },
      ],
    },
    {
      id: 'huy-don',
      title: 'Hủy đơn trước khi may',
      blocks: [
        {
          type: 'list',
          items: [
            'Bạn có thể tự hủy đơn trong trang đơn hàng khi đơn chưa được thanh toán.',
            `Đơn đã thanh toán nhưng chưa vào giai đoạn may: liên hệ hotline ${POLICY_CONTACT.hotline} để được hỗ trợ hủy và hoàn tiền toàn bộ.`,
            'Đơn đã chuyển sang "Đang may" không thể hủy vì vải đã được cắt theo số đo riêng của bạn.',
          ],
        },
      ],
    },
  ],
};
