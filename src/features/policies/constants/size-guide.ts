import {
  LOWER_FIELDS,
  OVERVIEW_FIELDS,
  SHIRT_SIZE_GUIDE,
  SHIRT_SIZES,
  UPPER_FIELDS,
} from '@/features/measurements/constants/profile-measurements-page';
import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import type { PolicyDocument } from '@/features/policies/types/policy';

// Ranges come from the measurement form so the guide never contradicts what
// the profile page accepts.
const toFieldRows = (fields: MeasurementField[]) =>
  fields.map((field) => [field.label, field.desc, `${field.min} - ${field.max} ${field.unit}`]);

const FIELD_COLUMNS = ['Số đo', 'Cách đo', 'Khoảng hợp lệ'];

export const SIZE_GUIDE: PolicyDocument = {
  slug: 'size-guide',
  title: 'Hướng dẫn chọn size',
  summary:
    'StAle. may từng sản phẩm theo số đo cơ thể của bạn thay vì size may sẵn. Hướng dẫn này giúp bạn tự đo chính xác và hiểu cách số đo được dùng để trang phục vừa ngay từ lần đầu.',
  updatedAt: '19/10/2026',
  highlights: [
    { label: 'Hình thức', value: 'May đo theo số đo' },
    { label: 'Thời gian tự đo', value: 'Khoảng 10 phút' },
    { label: 'Đơn vị', value: 'cm và kg' },
  ],
  sections: [
    {
      id: 'cach-xac-dinh',
      title: 'Size được xác định như thế nào',
      blocks: [
        {
          type: 'paragraph',
          text: 'Khi đặt hàng, mỗi sản phẩm lưu lại bản số đo trong hồ sơ của bạn tại thời điểm đó và thợ may cắt may theo bản số đo này. Nếu phát hiện số đo bất thường, StAle. gửi yêu cầu kiểm tra lại trước khi may; bạn cập nhật số đo ngay trong trang chi tiết đơn hàng.',
        },
        {
          type: 'paragraph',
          text: 'Đơn hàng chỉ đặt được khi hồ sơ có đủ số đo bắt buộc cho loại trang phục bạn chọn.',
        },
        { type: 'link', link: { label: 'Cập nhật số đo của tôi', href: '/profile/measurements' } },
      ],
    },
    {
      id: 'chuan-bi',
      title: 'Chuẩn bị trước khi đo',
      blocks: [
        {
          type: 'list',
          items: [
            'Dùng thước dây mềm có vạch cm.',
            'Mặc đồ lót mỏng hoặc đồ ôm sát người; bỏ thắt lưng, ví, điện thoại ra khỏi túi.',
            'Đứng thẳng, thả lỏng vai, thở bình thường và không hóp bụng.',
            'Giữ thước song song với mặt đất, vừa khít người nhưng không siết chặt.',
            'Nhờ người khác đo giúp rộng vai, dài tay áo và dài thân áo để có kết quả chính xác hơn.',
          ],
        },
      ],
    },
    {
      id: 'so-do-bat-buoc',
      title: 'Số đo bắt buộc theo loại trang phục',
      blocks: [
        {
          type: 'table',
          columns: ['Loại trang phục', 'Số đo bắt buộc'],
          rows: [
            ['Áo sơ mi, áo vest, blazer', 'Chiều cao, vòng ngực, rộng vai, dài tay áo, dài thân áo'],
            ['Quần tây, chân váy', 'Chiều cao, vòng eo, vòng hông, dài quần, vòng đùi'],
            ['Đầm, jumpsuit', 'Chiều cao, vòng ngực, vòng eo, vòng hông, rộng vai, dài thân áo'],
          ],
        },
        {
          type: 'paragraph',
          text: 'Với combo áo và quần, bạn cần đủ số đo của cả hai nhóm. Cân nặng, vòng cổ, vòng ngực dưới, vòng cổ tay, vòng đầu gối, vòng bắp chân và dài đũng quần không bắt buộc nhưng giúp form chuẩn hơn.',
        },
      ],
    },
    {
      id: 'tong-quan',
      title: 'Chiều cao và cân nặng',
      blocks: [{ type: 'table', columns: FIELD_COLUMNS, rows: toFieldRows(OVERVIEW_FIELDS) }],
    },
    {
      id: 'than-tren',
      title: 'Cách đo phần thân trên',
      blocks: [
        { type: 'table', columns: FIELD_COLUMNS, rows: toFieldRows(UPPER_FIELDS) },
        {
          type: 'list',
          items: [
            { term: 'Vòng ngực', text: 'Vòng thước qua điểm cao nhất của ngực, luồn dưới nách và giữ ngang lưng.' },
            { term: 'Rộng vai', text: 'Đo phía sau lưng, từ mỏm xương vai trái sang mỏm xương vai phải.' },
            { term: 'Dài tay áo', text: 'Thả lỏng tay, đo từ mỏm vai qua khuỷu tay đến xương cổ tay.' },
          ],
        },
      ],
    },
    {
      id: 'than-duoi',
      title: 'Cách đo phần thân dưới',
      blocks: [
        { type: 'table', columns: FIELD_COLUMNS, rows: toFieldRows(LOWER_FIELDS) },
        {
          type: 'list',
          items: [
            { term: 'Vòng eo', text: 'Đo ở phần nhỏ nhất của eo, thường cao hơn rốn khoảng 2 - 3 cm.' },
            { term: 'Vòng hông', text: 'Đứng chụm chân, đo vòng qua phần nở nhất của mông.' },
            { term: 'Dài quần', text: 'Đo từ cạp quần mong muốn dọc theo bên hông xuống vị trí gấu quần.' },
          ],
        },
      ],
    },
    {
      id: 'bang-size',
      title: 'Bảng size tham khảo',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nếu bạn quen chọn size may sẵn, bảng dưới đây giúp đối chiếu nhanh. Sản phẩm vẫn được may theo số đo chi tiết trong hồ sơ của bạn.',
        },
        {
          type: 'table',
          compact: true,
          columns: ['Size', 'Vòng ngực (cm)', 'Vòng eo (cm)', 'Vòng hông (cm)'],
          rows: SHIRT_SIZES.map((size) => [
            size,
            SHIRT_SIZE_GUIDE[size].chest,
            SHIRT_SIZE_GUIDE[size].waist,
            SHIRT_SIZE_GUIDE[size].hip,
          ]),
        },
      ],
    },
    {
      id: 'meo',
      title: 'Mẹo để may vừa ngay lần đầu',
      blocks: [
        {
          type: 'list',
          items: [
            'Đo mỗi số đo hai lần và lấy giá trị trung bình.',
            'Nhập số đo cơ thể thực tế, không tự cộng thêm độ rộng. Thợ may sẽ cộng độ cử động phù hợp với từng kiểu dáng.',
            'Cập nhật lại số đo khi cân nặng thay đổi đáng kể, trước khi đặt đơn mới.',
            'Bạn có thể hỏi AI Stylist hoặc chatbot để được tư vấn số đo và kiểu dáng hợp với vóc dáng.',
          ],
        },
        {
          type: 'note',
          tone: 'warning',
          text: 'Sản phẩm may đúng số đo bạn đã nhập nhưng không vừa do tự đo chưa chính xác không được đổi miễn phí, nhưng vẫn được hỗ trợ chỉnh form.',
          link: { label: 'Xem Chính sách đổi trả', href: '/return-policy' },
        },
      ],
    },
  ],
};
