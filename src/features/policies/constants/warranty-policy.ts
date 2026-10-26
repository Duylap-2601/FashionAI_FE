import { POLICY_CONTACT } from '@/features/policies/constants/policy-nav';
import type { PolicyDocument } from '@/features/policies/types/policy';

export const WARRANTY_POLICY: PolicyDocument = {
  slug: 'warranty',
  title: 'Chính sách bảo hành',
  summary:
    'StAie. bảo hành trọn đời, miễn phí đường may và phụ kiện cho mọi sản phẩm may đo, kèm một lần chỉnh form miễn phí để trang phục vừa vặn nhất với bạn.',
  updatedAt: '19/10/2026',
  highlights: [
    { label: 'Bảo hành đường may và phụ kiện', value: 'Trọn đời' },
    { label: 'Chi phí bảo hành', value: 'Miễn phí' },
    { label: 'Chỉnh form miễn phí', value: '1 lần trong 30 ngày' },
  ],
  sections: [
    {
      id: 'pham-vi',
      title: 'Phạm vi bảo hành',
      blocks: [
        {
          type: 'table',
          columns: ['Hạng mục', 'Thời hạn', 'Chi phí'],
          rows: [
            ['Đường may bung, tuột chỉ', 'Trọn đời sản phẩm', 'Miễn phí'],
            ['Khuy, cúc, khóa kéo, lớp lót bị hỏng', 'Trọn đời sản phẩm', 'Miễn phí'],
            ['Chỉnh form khi chưa vừa: nới hoặc bóp eo, sửa lai, chỉnh dài tay, dài quần', '30 ngày, 1 lần', 'Miễn phí'],
            ['Chỉnh sửa theo nhu cầu: thay đổi số đo, đổi kiểu dáng', 'Trọn đời sản phẩm', 'Theo báo giá'],
          ],
        },
        {
          type: 'paragraph',
          text: 'Bảo hành trọn đời áp dụng trong suốt thời gian bạn sử dụng sản phẩm, bắt đầu từ ngày đơn hàng chuyển sang trạng thái "Hoàn tất". Mã đơn hàng trong mục Đơn hàng của tôi là căn cứ bảo hành, bạn không cần giữ phiếu giấy.',
        },
      ],
    },
    {
      id: 'khong-ap-dung',
      title: 'Trường hợp không được bảo hành miễn phí',
      blocks: [
        {
          type: 'list',
          items: [
            'Hao mòn tự nhiên trong quá trình sử dụng: xù lông, bạc màu, sờn vải.',
            'Giặt, là hoặc bảo quản sai hướng dẫn ghi trên nhãn.',
            'Rách, cháy, ố bẩn do tác động bên ngoài.',
            'Sản phẩm đã được sửa chữa tại nơi khác.',
            'Số đo cơ thể thay đổi sau khi nhận hàng (áp dụng chỉnh sửa có phí).',
          ],
        },
      ],
    },
    {
      id: 'quy-trinh',
      title: 'Quy trình bảo hành',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            `Liên hệ hotline ${POLICY_CONTACT.hotline} hoặc email ${POLICY_CONTACT.email}, cung cấp mã đơn hàng và ảnh chụp vị trí cần bảo hành.`,
            'StAie. xác nhận hạng mục bảo hành và chi phí (nếu có) trong vòng 2 ngày làm việc.',
            'Gửi sản phẩm đến showroom hoặc qua đơn vị vận chuyển theo hướng dẫn. Với hạng mục miễn phí, StAie. chịu phí vận chuyển hai chiều.',
            'Thời gian xử lý từ 5 - 10 ngày làm việc tùy hạng mục. Bạn sẽ được thông báo khi sản phẩm được gửi trả.',
          ],
        },
        {
          type: 'note',
          tone: 'info',
          text: 'Trong 7 ngày đầu sau khi đơn hoàn tất, nếu sản phẩm may sai số đo, sai màu hoặc lỗi chất lượng, hãy gửi yêu cầu đổi trả để được đổi hàng hoặc hoàn tiền.',
          link: { label: 'Xem Chính sách đổi trả', href: '/return-policy' },
        },
      ],
    },
    {
      id: 'bao-quan',
      title: 'Hướng dẫn bảo quản',
      blocks: [
        {
          type: 'list',
          items: [
            { term: 'Blazer, vest, suit', text: 'Giặt khô để giữ form vai và lớp dựng bên trong.' },
            { term: 'Sơ mi, quần tây, chân váy', text: 'Giặt tay hoặc giặt máy ở chế độ nhẹ, nước dưới 30°C, lộn trái sản phẩm.' },
            { term: 'Là (ủi)', text: 'Nhiệt độ thấp đến trung bình, lót khăn mỏng lên bề mặt vải.' },
            { term: 'Cất giữ', text: 'Treo bằng móc vai rộng, tránh phơi trực tiếp dưới nắng gắt.' },
          ],
        },
      ],
    },
  ],
};
