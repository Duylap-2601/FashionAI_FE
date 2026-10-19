import { POLICY_CONTACT } from '@/features/policies/constants/policy-nav';
import type { PolicyDocument } from '@/features/policies/types/policy';

// Partners listed here are the services the backend actually integrates with
// (payments, shipping, storage, AI, email, Google sign-in and GA4).
export const PRIVACY_POLICY: PolicyDocument = {
  slug: 'privacy',
  title: 'Chính sách bảo mật',
  summary:
    'Chính sách này giải thích StAle. (FashionAI) thu thập dữ liệu cá nhân nào, dùng vào việc gì, chia sẻ với ai và bạn có những quyền gì đối với dữ liệu của mình.',
  updatedAt: '19/10/2026',
  highlights: [
    { label: 'Dữ liệu thẻ, tài khoản ngân hàng', value: 'Không lưu trữ' },
    { label: 'Cookie phân tích', value: 'Chỉ khi bạn đồng ý' },
    { label: 'Dữ liệu cá nhân', value: 'Không bán cho bên thứ ba' },
  ],
  sections: [
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu chúng tôi thu thập',
      blocks: [
        {
          type: 'list',
          items: [
            { term: 'Thông tin tài khoản', text: 'Họ tên, email, số điện thoại và mật khẩu (được mã hóa một chiều). Nếu đăng nhập bằng Google, chúng tôi nhận tên, email và ảnh đại diện từ tài khoản Google của bạn.' },
            { term: 'Số đo cơ thể', text: 'Chiều cao, cân nặng và các số đo bạn nhập để may đo, cùng bản số đo được lưu kèm từng đơn hàng.' },
            { term: 'Hình ảnh', text: 'Ảnh bạn tải lên để thử đồ AI, hình ảnh camera trong phiên thử đồ trực tiếp, ảnh minh chứng khi báo lỗi đơn hàng và ảnh trong đánh giá sản phẩm.' },
            { term: 'Đơn hàng và giao hàng', text: 'Địa chỉ, tên và số điện thoại người nhận, lịch sử mua hàng, trạng thái thanh toán và vận chuyển.' },
            { term: 'Tương tác với AI', text: 'Tin nhắn với chatbot, yêu cầu gửi AI Stylist, lịch sử thử đồ và gợi ý phối đồ.' },
            { term: 'Dữ liệu kỹ thuật', text: 'Địa chỉ IP, loại thiết bị, trình duyệt và nhật ký truy cập phục vụ bảo mật; dữ liệu phân tích hành vi chỉ khi bạn đồng ý cookie phân tích.' },
          ],
        },
      ],
    },
    {
      id: 'muc-dich',
      title: 'Mục đích sử dụng',
      blocks: [
        {
          type: 'list',
          items: [
            'Tạo, xác thực và quản lý tài khoản của bạn.',
            'May đo, kiểm tra số đo, giao hàng, đổi trả và bảo hành.',
            'Xử lý thanh toán, gói hội viên và hoàn tiền.',
            'Cung cấp tính năng AI: thử đồ ảo, thử đồ trực tiếp, gợi ý phối đồ và tư vấn số đo.',
            'Gửi email giao dịch (xác minh tài khoản, đặt lại mật khẩu, cập nhật đơn hàng) và thông báo trong ứng dụng.',
            'Phòng chống gian lận, bảo vệ hệ thống và giới hạn lượt sử dụng theo gói.',
            'Cải thiện sản phẩm dựa trên số liệu thống kê tổng hợp.',
          ],
        },
      ],
    },
    {
      id: 'chia-se',
      title: 'Chia sẻ dữ liệu với đối tác',
      blocks: [
        {
          type: 'paragraph',
          text: 'StAle. không bán dữ liệu cá nhân. Chúng tôi chỉ chia sẻ phần dữ liệu cần thiết với các đối tác dưới đây để vận hành dịch vụ:',
        },
        {
          type: 'table',
          columns: ['Đối tác', 'Mục đích', 'Dữ liệu chia sẻ'],
          rows: [
            ['ZaloPay, SePay', 'Thanh toán trực tuyến', 'Mã đơn hàng, số tiền. Thông tin thẻ và tài khoản ngân hàng do cổng thanh toán xử lý, StAle. không lưu.'],
            ['Giao Hàng Nhanh (GHN)', 'Vận chuyển', 'Tên, số điện thoại và địa chỉ người nhận'],
            ['Cloudinary', 'Lưu trữ hình ảnh', 'Ảnh bạn tải lên và ảnh kết quả thử đồ'],
            ['FASHN, Google Gemini, Decart', 'Thử đồ ảo và thử đồ trực tiếp', 'Ảnh thử đồ, hình ảnh camera trong phiên trực tiếp, ảnh sản phẩm'],
            ['Groq', 'Chatbot và AI Stylist', 'Nội dung câu hỏi, có thể kèm số đo khi bạn cần tư vấn'],
            ['Brevo', 'Gửi email', 'Email, tên và nội dung email giao dịch'],
            ['Google', 'Đăng nhập Google, Google Analytics', 'Thông tin đăng nhập Google; dữ liệu phân tích khi bạn đồng ý'],
          ],
        },
        {
          type: 'paragraph',
          text: 'Ngoài các trường hợp trên, chúng tôi chỉ cung cấp dữ liệu cho cơ quan nhà nước có thẩm quyền khi pháp luật yêu cầu.',
        },
      ],
    },
    {
      id: 'cookie',
      title: 'Cookie và lưu trữ trên trình duyệt',
      blocks: [
        {
          type: 'list',
          items: [
            { term: 'Cần thiết', text: 'Duy trì phiên đăng nhập an toàn và lưu giỏ hàng khi bạn chưa đăng nhập. Không thể tắt vì website cần chúng để hoạt động.' },
            { term: 'Phân tích (Google Analytics)', text: 'Mặc định tắt, chỉ bật khi bạn chọn đồng ý trên banner cookie. Bạn có thể thay đổi bất cứ lúc nào qua "Cài đặt cookie" ở chân trang.' },
          ],
        },
      ],
    },
    {
      id: 'luu-tru',
      title: 'Thời gian lưu trữ',
      blocks: [
        {
          type: 'list',
          items: [
            'Thông tin tài khoản và số đo được lưu trong thời gian tài khoản còn hoạt động.',
            'Ảnh và kết quả thử đồ được lưu trong lịch sử cho đến khi bạn xóa.',
            'Đơn hàng và chứng từ thanh toán được lưu theo thời hạn pháp luật về kế toán, thuế yêu cầu.',
            'Khi bạn yêu cầu xóa tài khoản, dữ liệu gắn với tài khoản được xóa, trừ dữ liệu pháp luật buộc phải lưu giữ.',
          ],
        },
      ],
    },
    {
      id: 'bao-ve',
      title: 'Cách chúng tôi bảo vệ dữ liệu',
      blocks: [
        {
          type: 'list',
          items: [
            'Mọi kết nối được mã hóa qua HTTPS.',
            'Mật khẩu được băm một chiều, nhân viên StAle. không xem được.',
            'Phiên đăng nhập dùng mã truy cập ngắn hạn và cookie bảo mật để gia hạn phiên.',
            'Giới hạn số lần đăng nhập để chống dò mật khẩu.',
            'Nhân viên chỉ truy cập dữ liệu cần cho công việc theo phân quyền.',
          ],
        },
      ],
    },
    {
      id: 'quyen',
      title: 'Quyền của bạn',
      blocks: [
        {
          type: 'list',
          items: [
            'Xem và chỉnh sửa thông tin cá nhân, số đo trong mục Hồ sơ.',
            'Xóa lịch sử thử đồ bất cứ lúc nào.',
            'Rút lại đồng ý cookie phân tích qua "Cài đặt cookie".',
            `Yêu cầu bản sao dữ liệu, hạn chế xử lý hoặc xóa tài khoản qua email ${POLICY_CONTACT.email}.`,
            'Khiếu nại về việc xử lý dữ liệu cá nhân theo quy định pháp luật Việt Nam.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Chúng tôi phản hồi yêu cầu liên quan đến dữ liệu cá nhân trong thời hạn pháp luật quy định và có thể cần xác minh danh tính trước khi thực hiện.',
        },
      ],
    },
    {
      id: 'tre-em',
      title: 'Người dùng chưa đủ 16 tuổi',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dịch vụ dành cho người từ đủ 16 tuổi. Người dùng dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ. Không tải lên ảnh trẻ em để thử đồ AI.',
        },
      ],
    },
    {
      id: 'thay-doi',
      title: 'Thay đổi chính sách',
      blocks: [
        {
          type: 'paragraph',
          text: 'Khi có thay đổi quan trọng, chúng tôi sẽ cập nhật ngày hiệu lực ở đầu trang và thông báo qua email hoặc thông báo trong ứng dụng.',
        },
      ],
    },
  ],
};
