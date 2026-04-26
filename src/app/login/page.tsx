'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
          let errorMessage = result.error.message || '登录失败';
          if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('invalid')) {
            errorMessage = '用户不存在，请先注册';
          }
          setError(errorMessage);
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

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setNickname('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col px-5 pt-12">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity mb-6"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="mb-10"
        >
          <h1 className="text-[30px] font-bold text-[#1D1D1F] tracking-tight leading-[1.1] mb-1">
            {isRegister ? '创建账号' : '登录'}
          </h1>
          <p className="text-[15px] text-[#6E6E73]">
            {isRegister ? '开始你的英语学习之旅' : '继续你的学习之旅'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
          className="space-y-4"
        >
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 bg-[#FF3B30]/10 rounded-[10px]"
            >
              <p className="text-[13px] text-[#FF3B30] text-center font-medium">{error}</p>
            </motion.div>
          )}

          {/* Username */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3.5 bg-white text-[17px] text-[#1D1D1F] rounded-[12px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
            placeholder="用户名"
            required
            minLength={3}
            maxLength={31}
            autoComplete="username"
          />

          {/* Nickname (register only) */}
          {isRegister && (
            <motion.input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3.5 bg-white text-[17px] text-[#1D1D1F] rounded-[12px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
              placeholder="昵称（选填）"
              maxLength={20}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              autoComplete="name"
            />
          )}

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white text-[17px] text-[#1D1D1F] rounded-[12px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
            placeholder="密码"
            required
            maxLength={255}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#007AFF] text-white text-[17px] font-semibold rounded-[12px] active:opacity-80 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? '处理中...' : isRegister ? '创建账号' : '登录'}
          </button>
        </motion.form>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-center"
        >
          <p className="text-[15px] text-[#6E6E73]">
            {isRegister ? '已有账号？' : '还没有账号？'}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1.5 text-[#007AFF] font-semibold"
            >
              {isRegister ? '去登录' : '去注册'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
