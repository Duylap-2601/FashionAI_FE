import { POLICY_CONTACT } from '@/features/policies/constants/policy-nav';
import type { PolicyDocument } from '@/features/policies/types/policy';

// Partners listed here are the services the backend actually integrates with
// (payments, shipping, storage, AI, email, Google sign-in and GA4).
export const PRIVACY_POLICY: PolicyDocument = {
  slug: 'privacy',
  title: 'Chính sách bảo mật',
  summary:
    'Chính sách này giải thích StAie (FashionAI) thu thập dữ liệu cá nhân nào, dùng vào việc gì, chia sẻ với ai, quyền của bạn đối với dữ liệu và cách chúng tôi sử dụng các quyền thiết bị (camera, microphone, bộ nhớ) trên ứng dụng di động.',
  updatedAt: '22/10/2026',
  highlights: [
    { label: 'Dữ liệu thẻ, tài khoản ngân hàng', value: 'Không lưu trữ' },
    { label: 'Ảnh camera', value: 'Chỉ xử lý khi dùng tính năng' },
    { label: 'Dữ liệu cá nhân', value: 'Không bán cho bên thứ ba' },
  ],
  sections: [
    {
      id: 'gioi-thieu',
      title: 'Giới thiệu',
      blocks: [
        {
          type: 'paragraph',
          text: 'StAie (trước đây là StAle.) là ứng dụng thời trang trí tuệ nhân tạo, cung cấp dịch vụ mua sắm trực tuyến, thử đồ ảo bằng AI, tư vấn phối đồ và giao hàng tại Việt Nam. Ứng dụng khả dụng trên trình duyệt web tại fashion-ai-fe.vercel.app và dưới dạng ứng dụng Android. Chính sách này áp dụng cho tất cả các nền tảng.',
        },
        {
          type: 'paragraph',
          text: `Mọi câu hỏi về chính sách này, vui lòng liên hệ: ${POLICY_CONTACT.email} hoặc gọi hotline ${POLICY_CONTACT.hotline} (${POLICY_CONTACT.hotlineHours}).`,
        },
      ],
    },
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu chúng tôi thu thập',
      blocks: [
        {
          type: 'list',
          items: [
            { term: 'Thông tin tài khoản', text: 'Họ tên, email, số điện thoại và mật khẩu (được mã hóa một chiều). Nếu đăng nhập bằng Google, chúng tôi nhận tên, email và ảnh đại diện từ tài khoản Google của bạn.' },
            { term: 'Số đo cơ thể', text: 'Chiều cao, cân nặng và các số đo bạn nhập để hỗ trợ chọn size, cùng bản số đo được lưu kèm từng đơn hàng.' },
            { term: 'Hình ảnh', text: 'Ảnh toàn thân bạn tải lên để thử đồ AI, hình ảnh từ camera trong phiên thử đồ trực tiếp, ảnh minh chứng khi báo lỗi đơn hàng và ảnh trong đánh giá sản phẩm.' },
            { term: 'Đơn hàng và giao hàng', text: 'Địa chỉ, tên và số điện thoại người nhận, lịch sử mua hàng, trạng thái thanh toán và vận chuyển.' },
            { term: 'Tương tác với AI', text: 'Tin nhắn với chatbot, yêu cầu gửi AI Stylist, lịch sử thử đồ và gợi ý phối đồ.' },
            { term: 'Dữ liệu kỹ thuật', text: 'Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt và nhật ký truy cập phục vụ bảo mật; dữ liệu phân tích hành vi chỉ khi bạn đồng ý cookie phân tích.' },
          ],
        },
      ],
    },
    {
      id: 'quyen-thiet-bi',
      title: 'Quyền truy cập thiết bị (Android)',
      blocks: [
        {
          type: 'paragraph',
          text: 'Ứng dụng Android của StAie yêu cầu các quyền dưới đây. Mỗi quyền chỉ được sử dụng đúng mục đích được nêu, không thu thập hoặc chia sẻ dữ liệu ra ngoài phạm vi đó:',
        },
        {
          type: 'table',
          columns: ['Quyền', 'Mục đích sử dụng', 'Khi nào được kích hoạt'],
          rows: [
            [
              'Camera',
              'Chụp ảnh selfie để tải lên thử đồ AI; quay video trực tiếp trong phiên Thử đồ trực tiếp (Live Try-On)',
              'Chỉ khi bạn bấm "Chụp ảnh selfie" hoặc bắt đầu phiên Thử đồ trực tiếp. Hệ thống hỏi xin quyền trước khi mở camera.',
            ],
            [
              'Microphone',
              'Yêu cầu kỹ thuật của WebRTC khi dùng camera — ứng dụng không ghi âm, không thu thập giọng nói',
              'Cùng lúc với quyền Camera trong phiên Thử đồ trực tiếp. Dữ liệu âm thanh không được lưu hoặc gửi đi.',
            ],
            [
              'Bộ nhớ / Thư viện ảnh',
              'Cho phép bạn chọn ảnh từ thư viện điện thoại để tải lên thử đồ hoặc đánh giá sản phẩm',
              'Chỉ khi bạn bấm "Chọn ảnh từ thư viện". Chỉ ảnh bạn chọn mới được tải lên.',
            ],
            [
              'Internet',
              'Kết nối đến máy chủ StAie để tải nội dung, xử lý đơn hàng và tính năng AI',
              'Liên tục trong khi sử dụng ứng dụng.',
            ],
          ],
        },
        {
          type: 'paragraph',
          text: 'Bạn có thể thu hồi bất kỳ quyền nào bất cứ lúc nào qua Cài đặt → Ứng dụng → StAie → Quyền. Một số tính năng sẽ không hoạt động nếu quyền tương ứng bị từ chối.',
        },
      ],
    },
    {
      id: 'muc-dich',
      title: 'Mục đích sử dụng dữ liệu',
      blocks: [
        {
          type: 'list',
          items: [
            'Tạo, xác thực và quản lý tài khoản của bạn.',
            'Hỗ trợ chọn size, kiểm tra số đo, giao hàng, đổi trả và bảo hành.',
            'Xử lý thanh toán, gói hội viên và hoàn tiền.',
            'Cung cấp tính năng AI: thử đồ ảo bằng ảnh, thử đồ trực tiếp qua camera, gợi ý phối đồ và tư vấn từ chatbot.',
            'Gửi email giao dịch (xác minh tài khoản, đặt lại mật khẩu, cập nhật đơn hàng) và thông báo trong ứng dụng.',
            'Phòng chống gian lận, bảo vệ hệ thống và giới hạn lượt sử dụng theo gói hội viên.',
            'Cải thiện sản phẩm dựa trên số liệu thống kê tổng hợp (chỉ khi bạn đồng ý phân tích).',
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
          text: 'StAie không bán dữ liệu cá nhân. Chúng tôi chỉ chia sẻ phần dữ liệu tối thiểu cần thiết với các đối tác dưới đây để vận hành dịch vụ:',
        },
        {
          type: 'table',
          columns: ['Đối tác', 'Mục đích', 'Dữ liệu chia sẻ'],
          rows: [
            ['ZaloPay, SePay', 'Thanh toán trực tuyến', 'Mã đơn hàng, số tiền. Thông tin thẻ và tài khoản ngân hàng do cổng thanh toán xử lý, StAie không lưu.'],
            ['Giao Hàng Nhanh (GHN)', 'Vận chuyển', 'Tên, số điện thoại và địa chỉ người nhận'],
            ['Cloudinary', 'Lưu trữ hình ảnh', 'Ảnh bạn tải lên và ảnh kết quả thử đồ'],
            ['FASHN, Google Gemini, Decart', 'Thử đồ ảo và thử đồ trực tiếp', 'Ảnh thử đồ, hình ảnh camera trong phiên trực tiếp, ảnh sản phẩm. Dữ liệu chỉ dùng để tạo kết quả, không lưu trữ lâu dài bởi đối tác.'],
            ['Groq', 'Chatbot và AI Stylist', 'Nội dung câu hỏi, có thể kèm số đo khi bạn cần tư vấn size'],
            ['Brevo', 'Gửi email giao dịch', 'Email, tên và nội dung email giao dịch'],
            ['Google', 'Đăng nhập Google, Google Analytics 4', 'Thông tin đăng nhập Google; dữ liệu hành vi người dùng khi bạn đồng ý cookie phân tích'],
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
            { term: 'Phân tích (Google Analytics 4)', text: 'Mặc định tắt, chỉ bật khi bạn chọn đồng ý trên banner cookie. Bạn có thể thay đổi bất cứ lúc nào qua "Cài đặt cookie" ở chân trang. Tài khoản quản trị viên được loại trừ khỏi GA4.' },
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
            'Ảnh tải lên và kết quả thử đồ được lưu trong lịch sử cho đến khi bạn chủ động xóa.',
            'Hình ảnh từ camera trong phiên Thử đồ trực tiếp được gửi để xử lý và không được StAie lưu trữ lâu dài sau khi phiên kết thúc.',
            'Đơn hàng và chứng từ thanh toán được lưu theo thời hạn pháp luật về kế toán, thuế yêu cầu.',
            'Khi bạn yêu cầu xóa tài khoản, dữ liệu gắn với tài khoản được xóa trong vòng 30 ngày, trừ dữ liệu pháp luật buộc phải lưu giữ.',
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
            'Mọi kết nối được mã hóa qua HTTPS/TLS.',
            'Mật khẩu được băm một chiều (bcrypt), nhân viên StAie không xem được.',
            'Phiên đăng nhập dùng mã truy cập ngắn hạn và cookie bảo mật (HttpOnly, Secure) để gia hạn phiên.',
            'Giới hạn số lần đăng nhập để chống dò mật khẩu.',
            'Nhân viên chỉ truy cập dữ liệu cần thiết cho công việc theo phân quyền nghiêm ngặt.',
            'Ứng dụng Android giao tiếp với máy chủ qua HTTPS, không dùng HTTP cleartext.',
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
            'Rút lại đồng ý cookie phân tích qua "Cài đặt cookie" trên web.',
            'Thu hồi quyền camera, microphone và bộ nhớ trên ứng dụng Android qua Cài đặt → Ứng dụng → StAie → Quyền.',
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
          text: 'Dịch vụ dành cho người từ đủ 16 tuổi. Người dùng dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp trước khi sử dụng. Không tải lên ảnh trẻ em để thử đồ AI. StAie không cố ý thu thập dữ liệu của trẻ em dưới 13 tuổi; nếu phát hiện, tài khoản sẽ bị xóa.',
        },
      ],
    },
    {
      id: 'thay-doi',
      title: 'Thay đổi chính sách',
      blocks: [
        {
          type: 'paragraph',
          text: 'Khi có thay đổi quan trọng, chúng tôi sẽ cập nhật ngày hiệu lực ở đầu trang và thông báo qua email hoặc thông báo trong ứng dụng ít nhất 7 ngày trước khi áp dụng. Việc tiếp tục sử dụng dịch vụ sau thời điểm đó được xem là bạn đã đồng ý với chính sách mới.',
        },
      ],
    },
  ],
};
