export interface District {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    districts: [
      { id: 'q1', name: 'Quận 1' },
      { id: 'q3', name: 'Quận 3' },
      { id: 'q4', name: 'Quận 4' },
      { id: 'q5', name: 'Quận 5' },
      { id: 'q6', name: 'Quận 6' },
      { id: 'q7', name: 'Quận 7' },
      { id: 'q8', name: 'Quận 8' },
      { id: 'q10', name: 'Quận 10' },
      { id: 'q11', name: 'Quận 11' },
      { id: 'q12', name: 'Quận 12' },
      { id: 'binh-thanh', name: 'Quận Bình Thạnh' },
      { id: 'phu-nhuan', name: 'Quận Phú Nhuận' },
      { id: 'go-vap', name: 'Quận Gò Vấp' },
      { id: 'tan-binh', name: 'Quận Tân Bình' },
      { id: 'tan-phu', name: 'Quận Tân Phú' },
      { id: 'binh-tan', name: 'Quận Bình Tân' },
      { id: 'thu-duc', name: 'TP. Thủ Đức' },
      { id: 'hoc-mon', name: 'Huyện Hóc Môn' },
      { id: 'cu-chi', name: 'Huyện Củ Chi' },
      { id: 'nha-be', name: 'Huyện Nhà Bè' },
      { id: 'binh-chanh', name: 'Huyện Bình Chánh' },
      { id: 'can-gio', name: 'Huyện Cần Giờ' },
    ],
  },
  {
    id: 'hn',
    name: 'Hà Nội',
    districts: [
      { id: 'ba-dinh', name: 'Quận Ba Đình' },
      { id: 'hoan-kiem', name: 'Quận Hoàn Kiếm' },
      { id: 'tay-ho', name: 'Quận Tây Hồ' },
      { id: 'long-bien', name: 'Quận Long Biên' },
      { id: 'cau-giay', name: 'Quận Cầu Giấy' },
      { id: 'dong-da', name: 'Quận Đống Đa' },
      { id: 'hai-ba-trung', name: 'Quận Hai Bà Trưng' },
      { id: 'hoang-mai', name: 'Quận Hoàng Mai' },
      { id: 'thanh-xuan', name: 'Quận Thanh Xuân' },
      { id: 'nam-tu-liem', name: 'Quận Nam Từ Liêm' },
      { id: 'bac-tu-liem', name: 'Quận Bắc Từ Liêm' },
      { id: 'ha-dong', name: 'Quận Hà Đông' },
      { id: 'son-tay', name: 'Thị xã Sơn Tây' },
      { id: 'dong-anh', name: 'Huyện Đông Anh' },
      { id: 'gia-lam', name: 'Huyện Gia Lâm' },
      { id: 'soc-son', name: 'Huyện Sóc Sơn' },
      { id: 'thanh-tri', name: 'Huyện Thanh Trì' },
      { id: 'me-linh', name: 'Huyện Mê Linh' },
    ],
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    districts: [
      { id: 'hai-chau', name: 'Quận Hải Châu' },
      { id: 'thanh-khe', name: 'Quận Thanh Khê' },
      { id: 'son-tra', name: 'Quận Sơn Trà' },
      { id: 'ngu-hanh-son', name: 'Quận Ngũ Hành Sơn' },
      { id: 'lien-chieu', name: 'Quận Liên Chiểu' },
      { id: 'cam-le', name: 'Quận Cẩm Lệ' },
      { id: 'hoa-vang', name: 'Huyện Hòa Vang' },
    ],
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    districts: [
      { id: 'hong-bang', name: 'Quận Hồng Bàng' },
      { id: 'ngo-quyen', name: 'Quận Ngô Quyền' },
      { id: 'le-chan', name: 'Quận Lê Chân' },
      { id: 'hai-an', name: 'Quận Hải An' },
      { id: 'kien-an', name: 'Quận Kiến An' },
      { id: 'thuy-nguyen', name: 'Huyện Thủy Nguyên' },
      { id: 'an-duong', name: 'Huyện An Dương' },
    ],
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    districts: [
      { id: 'ninh-kieu', name: 'Quận Ninh Kiều' },
      { id: 'binh-thuy', name: 'Quận Bình Thủy' },
      { id: 'cai-rang', name: 'Quận Cái Răng' },
      { id: 'o-mon', name: 'Quận Ô Môn' },
      { id: 'thot-not', name: 'Quận Thốt Nốt' },
      { id: 'phong-dien', name: 'Huyện Phong Điền' },
    ],
  },
  {
    id: 'binh-duong',
    name: 'Bình Dương',
    districts: [
      { id: 'thu-dau-mot', name: 'TP. Thủ Dầu Một' },
      { id: 'thuan-an', name: 'TP. Thuận An' },
      { id: 'di-an', name: 'TP. Dĩ An' },
      { id: 'tan-uyen', name: 'TP. Tân Uyên' },
      { id: 'ben-cat', name: 'TP. Bến Cát' },
      { id: 'bau-bang', name: 'Huyện Bàu Bàng' },
    ],
  },
  {
    id: 'dong-nai',
    name: 'Đồng Nai',
    districts: [
      { id: 'bien-hoa', name: 'TP. Biên Hòa' },
      { id: 'long-khanh', name: 'TP. Long Khánh' },
      { id: 'long-thanh', name: 'Huyện Long Thành' },
      { id: 'nhon-trach', name: 'Huyện Nhơn Trạch' },
      { id: 'trang-bom', name: 'Huyện Trảng Bom' },
    ],
  },
  {
    id: 'ba-ria-vung-tau',
    name: 'Bà Rịa - Vũng Tàu',
    districts: [
      { id: 'vung-tau', name: 'TP. Vũng Tàu' },
      { id: 'ba-ria', name: 'TP. Bà Rịa' },
      { id: 'phu-my', name: 'Thị xã Phú Mỹ' },
      { id: 'long-dien', name: 'Huyện Long Điền' },
    ],
  },
  {
    id: 'thua-thien-hue',
    name: 'Thừa Thiên Huế',
    districts: [
      { id: 'hue', name: 'TP. Huế' },
      { id: 'huong-thuy', name: 'Thị xã Hương Thủy' },
      { id: 'huong-tra', name: 'Thị xã Hương Trà' },
      { id: 'phu-vang', name: 'Huyện Phú Vang' },
    ],
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa',
    districts: [
      { id: 'nha-trang', name: 'TP. Nha Trang' },
      { id: 'cam-ranh', name: 'TP. Cam Ranh' },
      { id: 'ninh-hoa', name: 'Thị xã Ninh Hòa' },
      { id: 'dien-khanh', name: 'Huyện Diên Khánh' },
    ],
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    districts: [
      { id: 'ha-long', name: 'TP. Hạ Long' },
      { id: 'cam-pha', name: 'TP. Cẩm Phả' },
      { id: 'uong-bi', name: 'TP. Uông Bí' },
      { id: 'mong-cai', name: 'TP. Móng Cái' },
    ],
  },
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh',
    districts: [
      { id: 'bac-ninh-city', name: 'TP. Bắc Ninh' },
      { id: 'tu-son', name: 'TP. Từ Sơn' },
      { id: 'yen-phong', name: 'Huyện Yên Phong' },
      { id: 'que-vo', name: 'Thị xã Quế Võ' },
    ],
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    districts: [
      { id: 'vinh', name: 'TP. Vinh' },
      { id: 'cua-lo', name: 'Thị xã Cửa Lò' },
      { id: 'hoang-mai-na', name: 'Thị xã Hoàng Mai' },
      { id: 'dien-chau', name: 'Huyện Diễn Châu' },
    ],
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    districts: [
      { id: 'thanh-hoa-city', name: 'TP. Thanh Hóa' },
      { id: 'sam-son', name: 'TP. Sầm Sơn' },
      { id: 'bim-son', name: 'Thị xã Bỉm Sơn' },
      { id: 'nghi-son', name: 'Thị xã Nghi Sơn' },
    ],
  },
  {
    id: 'lam-dong',
    name: 'Lâm Đồng',
    districts: [
      { id: 'da-lat', name: 'TP. Đà Lạt' },
      { id: 'bao-loc', name: 'TP. Bảo Lộc' },
      { id: 'duc-trong', name: 'Huyện Đức Trọng' },
      { id: 'di-linh', name: 'Huyện Di Linh' },
    ],
  },
  {
    id: 'binh-dinh',
    name: 'Bình Định',
    districts: [
      { id: 'quy-nhon', name: 'TP. Quy Nhơn' },
      { id: 'an-nhon', name: 'Thị xã An Nhơn' },
      { id: 'hoai-nhon', name: 'Thị xã Hoài Nhơn' },
    ],
  },
  {
    id: 'kien-giang',
    name: 'Kiên Giang',
    districts: [
      { id: 'rach-gia', name: 'TP. Rạch Giá' },
      { id: 'phu-quoc', name: 'TP. Phú Quốc' },
      { id: 'ha-tien', name: 'TP. Hà Tiên' },
    ],
  },
  {
    id: 'khac',
    name: 'Tỉnh/Thành phố khác',
    districts: [
      { id: 'trung-tam', name: 'Khu vực Trung tâm' },
      { id: 'ngoai-thanh', name: 'Khu vực Ngoại thành/Huyện' },
    ],
  },
];
