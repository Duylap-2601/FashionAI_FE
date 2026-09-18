const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

test('preprocessText splits inline numbered lists and sub-bullets into structured lines', () => {
  const { preprocessText } = createSourceLoader()('@/features/chat/components/FormattedChatText');

  // Exact scenario from user prompt:
  const rawInput =
    'Để thử đồ ảo (virtual fitting) một cách hiệu quả, bạn có thể làm theo các bước sau: ' +
    '1. **Chọn nền tảng hoặc app hỗ trợ** - Các thương hiệu lớn thường có tính năng AR trên website hoặc trong app (ví dụ: Zara, Uniqlo, H&M). ' +
    '- Ứng dụng chuyên dụng như **Zeekit**, **Fit3D**, **Vue.ai**, **Snapchat AR Try-On** cũng cho phép tải ảnh hoặc dùng camera trực tiếp. ' +
    '2. **Chuẩn bị thiết bị** - Smartphone hoặc máy tính có camera chất lượng tốt (độ phân giải tối thiểu 1080p)...';

  const processed = preprocessText(rawInput);

  // Verifies that step 1 is broken onto its own line after the introductory colon
  assert.ok(processed.includes('các bước sau:\n\n1. **Chọn nền tảng hoặc app hỗ trợ**'));

  // Verifies that step 1 bold title is separated from sub-bullets
  assert.ok(processed.includes('1. **Chọn nền tảng hoặc app hỗ trợ**\n- Các thương hiệu lớn'));

  // Verifies that step 2 is broken onto its own line after period
  assert.ok(processed.includes('camera trực tiếp.\n\n2. **Chuẩn bị thiết bị**'));

  // Verifies that sub-bullet in step 2 is separated
  assert.ok(processed.includes('2. **Chuẩn bị thiết bị**\n- Smartphone hoặc máy tính'));
});

test('preprocessText auto-closes unclosed bold asterisks during streaming', () => {
  const { preprocessText } = createSourceLoader()('@/features/chat/components/FormattedChatText');

  const streamingChunk = 'Xin chào! Đây là bước 1: **Chọn nền tảng';
  const streamingResult = preprocessText(streamingChunk, true);
  assert.equal(streamingResult, 'Xin chào! Đây là bước 1: **Chọn nền tảng**');

  // When not streaming, doesn't force add asterisks
  const nonStreamingResult = preprocessText('Xin chào! Đây là bước 1: **Chọn nền tảng', false);
  assert.equal(nonStreamingResult, 'Xin chào! Đây là bước 1: **Chọn nền tảng');
});
