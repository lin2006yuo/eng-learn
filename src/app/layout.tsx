import type { Metadata, Viewport } from 'next';
import { Providers } from '@/app/providers';
import { Toast } from '@/shared/components/Toast';
import { SelectionPopover } from '@/features/comment/components/selection/SelectionPopover';
import './globals.css';

export const metadata: Metadata = {
  title: '句型英语 - Pattern English',
  description: '学习英语句型的最佳工具',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#58CC71',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-background">
        <Providers>
          <div className="min-h-screen max-w-[430px] mx-auto relative">
            {children}
            <Toast />
            <SelectionPopover />
          </div>
        </Providers>
      </body>
    </html>
  );
}
