import { describe, it, expect } from 'vitest';
import { searchPatterns, getPatternById, getAllExamples, patterns } from '@/data/patterns';

describe('searchPatterns', () => {
  it('空查询返回空数组', () => {
    expect(searchPatterns('')).toEqual([]);
  });

  it('纯空白字符查询返回空数组', () => {
    expect(searchPatterns('   ')).toEqual([]);
  });

  it('匹配句型标题（英文不区分大小写）', () => {
    const results = searchPatterns('good at');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      expect(p.title.toLowerCase()).toContain('good at');
    });
  });

  it('匹配句型翻译（中文）', () => {
    const results = searchPatterns('擅长');
    expect(results.length).toBeGreaterThan(0);
  });

  it('匹配例句英文（不区分大小写）', () => {
    const results = searchPatterns('soccer');
    expect(results.length).toBeGreaterThan(0);
  });

  it('匹配例句中文', () => {
    const results = searchPatterns('篮球');
    expect(results.length).toBeGreaterThan(0);
  });

  it('无匹配结果返回空数组', () => {
    const results = searchPatterns('xyznonexistent123');
    expect(results).toEqual([]);
  });
});

describe('getPatternById', () => {
  it('根据有效 ID 返回句型', () => {
    const firstPattern = patterns[0];
    const result = getPatternById(firstPattern.id);
    expect(result).toEqual(firstPattern);
  });

  it('无效 ID 返回 undefined', () => {
    const result = getPatternById('nonexistent-id');
    expect(result).toBeUndefined();
  });
});

describe('getAllExamples', () => {
  it('返回所有句型的所有例句', () => {
    const result = getAllExamples();
    const totalExamples = patterns.reduce((sum, p) => sum + p.examples.length, 0);
    expect(result.length).toBe(totalExamples);
  });

  it('每个结果都包含 pattern 和 example', () => {
    const result = getAllExamples();
    result.forEach((item) => {
      expect(item).toHaveProperty('pattern');
      expect(item).toHaveProperty('example');
    });
  });
});
