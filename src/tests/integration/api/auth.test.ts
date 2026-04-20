import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestAuth } from '@/tests/test-helpers/createTestAuth';
import { isAPIError } from 'better-auth/api';

describe('认证 API 集成测试', () => {
  let testAuth: ReturnType<typeof createTestAuth>;

  beforeEach(() => {
    testAuth = createTestAuth();
  });

  afterEach(() => {
    testAuth.cleanup();
  });

  const a = () => testAuth.auth;

  describe('用户注册', () => {
    it('注册新用户', async () => {
      const result = await a().api.signUpEmail({
        body: {
          email: 'test@test.com',
          password: 'password123',
          name: 'testuser',
          username: 'testuser',
        },
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('重复用户名注册失败', async () => {
      await a().api.signUpEmail({
        body: {
          email: 'test@test.com',
          password: 'password123',
          name: 'testuser',
          username: 'duplicate',
        },
      });

      await expect(
        a().api.signUpEmail({
          body: {
            email: 'test2@test.com',
            password: 'password456',
            name: 'testuser2',
            username: 'duplicate',
          },
        })
      ).rejects.toThrow();
    });

    it('重复邮箱注册失败', async () => {
      await a().api.signUpEmail({
        body: {
          email: 'same@test.com',
          password: 'password123',
          name: 'user1',
          username: 'user1',
        },
      });

      await expect(
        a().api.signUpEmail({
          body: {
            email: 'same@test.com',
            password: 'password456',
            name: 'user2',
            username: 'user2',
          },
        })
      ).rejects.toThrow();
    });

    it('用户名长度限制', async () => {
      await expect(
        a().api.signUpEmail({
          body: {
            email: 'short@test.com',
            password: 'password123',
            name: 'ab',
            username: 'ab',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('用户登录', () => {
    beforeEach(async () => {
      await a().api.signUpEmail({
        body: {
          email: 'login@test.com',
          password: 'password123',
          name: 'loginuser',
          username: 'loginuser',
        },
      });
    });

    it('用户名登录成功', async () => {
      const session = await a().api.signInUsername({
        body: {
          username: 'loginuser',
          password: 'password123',
        },
      });

      expect(session).toBeDefined();
      expect(session.user).toBeDefined();
      expect(session.user.username).toBe('loginuser');
    });

    it('错误密码登录失败', async () => {
      await expect(
        a().api.signInUsername({
          body: {
            username: 'loginuser',
            password: 'wrongpassword',
          },
        })
      ).rejects.toThrow();
    });

    it('不存在用户名登录失败', async () => {
      await expect(
        a().api.signInUsername({
          body: {
            username: 'nonexistent',
            password: 'password123',
          },
        })
      ).rejects.toThrow();
    });

    it('错误密码登录返回 APIError', async () => {
      try {
        await a().api.signInUsername({
          body: {
            username: 'loginuser',
            password: 'wrongpassword',
          },
        });
        expect.fail('should have thrown');
      } catch (error) {
        expect(isAPIError(error)).toBe(true);
        expect((error as any).message).toBeDefined();
      }
    });
  });

  describe('会话管理', () => {
    let sessionToken: string;

    beforeEach(async () => {
      await a().api.signUpEmail({
        body: {
          email: 'session@test.com',
          password: 'password123',
          name: 'sessionuser',
          username: 'sessionuser',
        },
      });

      const result = await a().api.signInUsername({
        body: {
          username: 'sessionuser',
          password: 'password123',
        },
        returnHeaders: true,
      });

      const cookies = result.headers.getSetCookie();
      const sessionCookie = cookies.find((c) =>
        c.startsWith('better-auth.session_token=')
      );
      expect(sessionCookie).toBeDefined();
      sessionToken = sessionCookie!.split('=')[1].split(';')[0];
    });

    it('使用有效 token 获取会话', async () => {
      const headers = new Headers({
        cookie: `better-auth.session_token=${sessionToken}`,
      });

      const result = await a().api.getSession({ headers });

      expect(result).toBeDefined();
      expect(result?.user?.username).toBe('sessionuser');
    });

    it('使用无效 token 获取会话返回 null', async () => {
      const headers = new Headers({
        cookie: 'better-auth.session_token=invalid-token',
      });

      const result = await a().api.getSession({ headers });

      expect(result).toBeNull();
    });
  });

  describe('登出', () => {
    it('登出后会话失效', async () => {
      await a().api.signUpEmail({
        body: {
          email: 'logout@test.com',
          password: 'password123',
          name: 'logoutuser',
          username: 'logoutuser',
        },
      });

      const result = await a().api.signInUsername({
        body: {
          username: 'logoutuser',
          password: 'password123',
        },
        returnHeaders: true,
      });

      const cookies = result.headers.getSetCookie();
      const sessionCookie = cookies.find((c) =>
        c.startsWith('better-auth.session_token=')
      );
      const token = sessionCookie!.split('=')[1].split(';')[0];

      const headers = new Headers({
        cookie: `better-auth.session_token=${token}`,
      });

      await a().api.signOut({ headers });

      const session = await a().api.getSession({ headers });
      expect(session).toBeNull();
    });
  });
});
