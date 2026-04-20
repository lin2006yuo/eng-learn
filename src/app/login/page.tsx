'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Smile } from 'lucide-react';
import { Card, Button } from '@/shared/components';
import { signIn, signUp } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    router.push(from || '/');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const userNickname = nickname.trim() || username;
        const result = await signUp.email({
          username,
          email: `${username}@placeholder.local`,
          password,
          name: userNickname,
        });

        if (result.error) {
          setError(result.error.message || '注册失败');
          return;
        }

        handleRedirect();
      } else {
        const result = await signIn.username({
          username,
          password,
        });

        if (result.error) {
          setError(result.error.message || '登录失败');
          return;
        }

        handleRedirect();
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col items-center justify-center px-5 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="text-6xl mb-4"
        >
          🦉
        </motion.div>

        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
          className="text-2xl font-bold text-text-primary mb-1"
        >
          {isRegister ? '创建账号' : '欢迎回来'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-secondary mb-8"
        >
          {isRegister ? '开始你的学习之旅' : '继续你的英语学习之旅'}
        </motion.p>

        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.3 }}
          className="w-full"
        >
          <Card animate={false} className="p-6">
            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-50 rounded-2xl"
              >
                <p className="text-red-500 text-sm text-center">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-search-bg rounded-2xl
                           text-text-primary placeholder:text-text-secondary
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           transition-all duration-200"
                  placeholder="用户名"
                  required
                  minLength={3}
                  maxLength={31}
                />
              </div>

              {/* 昵称输入 - 仅在注册时显示 */}
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                    <Smile size={20} />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-search-bg rounded-2xl
                             text-text-primary placeholder:text-text-secondary
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             transition-all duration-200"
                    placeholder="昵称（用于显示，选填）"
                    maxLength={20}
                  />
                </motion.div>
              )}

              {/* 密码输入 */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-search-bg rounded-2xl
                           text-text-primary placeholder:text-text-secondary
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           transition-all duration-200"
                  placeholder="密码"
                  required
                  minLength={6}
                  maxLength={255}
                />
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? '处理中...' : isRegister ? '创建账号' : '登录'}
              </Button>
            </form>

            {/* 切换登录/注册 */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                {isRegister ? '已有账号？' : '还没有账号？'}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setNickname('');
                  }}
                  className="ml-1 text-primary font-semibold hover:underline transition-colors"
                >
                  {isRegister ? '去登录' : '去注册'}
                </button>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* 底部装饰 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-text-secondary"
        >
          句型英语 · 让学习更简单
        </motion.p>
      </div>
    </div>
  );
}
