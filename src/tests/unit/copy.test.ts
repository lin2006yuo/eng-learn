import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard, copyAllExamples } from '@/shared/utils/copy';

describe('copyToClipboard', () => {
  const originalClipboard = globalThis.navigator?.clipboard;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('调用 navigator.clipboard.writeText 并返回 true', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard('hello world');

    expect(writeTextSpy).toHaveBeenCalledWith('hello world');
    expect(result).toBe(true);

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('clipboard API 失败时使用 fallback 方案', async () => {
    const writeTextSpy = vi.fn().mockRejectedValue(new Error('clipboard error'));

    const mockExecCommand = vi.fn().mockReturnValue(true);
    (document as any).execCommand = mockExecCommand;

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard('hello world');

    expect(writeTextSpy).toHaveBeenCalled();
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);

    delete (document as any).execCommand;
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });
});

describe('copyAllExamples', () => {
  const mockPatterns = [
    {
      title: 'Pattern A',
      examples: [
        { en: 'Hello world', zh: '你好世界' },
        { en: 'Good morning', zh: '早上好' },
      ],
    },
    {
      title: 'Pattern B',
      examples: [
        { en: 'How are you', zh: '你好吗' },
      ],
    },
  ];

  it('格式化多个句型及其例句', () => {
    const result = copyAllExamples(mockPatterns);

    expect(result).toContain('Pattern A');
    expect(result).toContain('Hello world');
    expect(result).toContain('你好世界');
    expect(result).toContain('---');
    expect(result).toContain('Pattern B');
    expect(result).toContain('How are you');
  });

  it('去除末尾空白字符', () => {
    const result = copyAllExamples(mockPatterns);
    expect(result.endsWith('\n')).toBe(false);
  });

  it('空数组返回空字符串', () => {
    const result = copyAllExamples([]);
    expect(result).toBe('');
  });
});
