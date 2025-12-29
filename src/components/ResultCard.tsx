import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getPanTypeName, getPanTypeColor, cleanUrl } from '../utils/helpers';
import type { SearchResult } from '../types/api';

interface ResultCardProps {
  result: SearchResult;
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const { isDarkMode } = useTheme();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (url: string, index: number) => {
    try {
      const cleanUrlStr = cleanUrl(url);
      await navigator.clipboard.writeText(cleanUrlStr);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleOpen = (url: string) => {
    const cleanUrlStr = cleanUrl(url);
    window.open(cleanUrlStr, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 过滤支持的网盘类型
  const supportedLinks = result.links.filter(link => 
    ['aliyun', 'baidu', 'quark'].includes(link.type)
  );

  if (supportedLinks.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all duration-300 card-hover glass-effect ${
      isDarkMode
        ? 'bg-gray-800 border border-gray-700 hover:border-gray-600'
        : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
    }`}>
      {/* 标题和内容 */}
      <div className="mb-4">
        <h3 className={`text-base md:text-lg font-bold mb-2 line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {result.title}
        </h3>
        <p className={`text-sm line-clamp-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {result.content}
        </p>
      </div>

      {/* 标签 */}
      {result.tags && result.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {result.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 网盘链接 */}
      <div className="space-y-3">
        {supportedLinks.map((link, index) => (
          <div
            key={`${result.unique_id}-${link.type}-${index}`}
            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border ${
              isDarkMode
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* 网盘类型标识 */}
                                 <div className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                   getPanTypeColor(link.type)
                 }`}>
                  {getPanTypeName(link.type)}
                </div>

                {/* 密码提示 */}
                {link.password && (
                                  <div className={`px-2 py-1 rounded-lg text-xs ${
                  isDarkMode
                    ? 'bg-yellow-900/30 text-yellow-300'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  密码: {link.password}
                </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopy(link.url, index)}
                  className={`p-2 rounded-lg transition-all duration-200 btn-hover active:scale-95 ${
                    copiedIndex === index
                      ? isDarkMode
                        ? 'bg-success-color text-white'
                        : 'bg-green-500 text-white'
                      : isDarkMode
                        ? 'bg-surface-3 hover:bg-surface-2 text-text-secondary'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                  title="复制链接"
                >
                  {copiedIndex === index ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleOpen(link.url)}
                                  className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                  title="打开链接"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部信息 */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <span className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            来源: {result.channel}
          </span>
          <span className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formatDate(result.datetime)}
          </span>
        </div>

        <div className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          ID: {result.unique_id.slice(-8)}
        </div>
      </div>
    </div>
  );
}; 