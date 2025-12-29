import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ResultCard } from './ResultCard';
import type { SearchResult } from '../types/api';

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  allResults: SearchResult[];
  selectedType: string;
  onTypeSelect: (type: string) => void;
  otherTypes: string[];
  showOtherTypes: boolean;
}

export const SearchResults = ({
  results,
  totalResults,
  allResults,
  selectedType,
  onTypeSelect,
  otherTypes,
  showOtherTypes
}: SearchResultsProps) => {
  const { isDarkMode } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 监听滚动位置，判断是否显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      // 获取第3个结果卡片的位置
      const thirdCard = document.querySelectorAll('[data-result-card]')[2];
      if (thirdCard) {
        const rect = thirdCard.getBoundingClientRect();
        // 当第3个卡片滚动到视口上方时显示按钮
        setShowScrollTop(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [results]);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 生成筛选项
  const typeOptions = useMemo(() => {
    const options = [
      { value: 'all', label: '全部网盘' },
      { value: 'baidu', label: '百度网盘' },
      { value: 'aliyun', label: '阿里网盘' },
      { value: 'quark', label: '夸克网盘' }
    ];

    // 如果展开了其他网盘类型，则显示具体的其他网盘类型
    if (showOtherTypes && otherTypes.length > 0) {
      otherTypes.forEach(type => {
        options.push({ value: type, label: getTypeDisplayName(type) });
      });
    } else {
      // 如果存在其他类型且未展开，则显示"其他网盘"按钮
      if (otherTypes.length > 0) {
        options.push({ value: 'other', label: '其他网盘' });
      }
    }

    return options;
  }, [showOtherTypes, otherTypes]);

  const getTypeCount = (type: string) => {
    if (type === 'all') return totalResults;
    if (type === 'other') {
      return allResults.filter(result =>
        result.links.some(link => otherTypes.includes(link.type))
      ).length;
    }
    return allResults.filter(result =>
      result.links.some(link => link.type === type)
    ).length;
  };

  // 处理筛选类型选择
  const handleTypeSelect = (type: string) => {
    onTypeSelect(type);
    setIsFilterOpen(false); // 选择后关闭抽屉
  };

  // 获取网盘类型显示名称
  function getTypeDisplayName(type: string): string {
    const nameMap: Record<string, string> = {
      'aliyun': '阿里云盘',
      'baidu': '百度网盘',
      'quark': '夸克网盘',
      'tianyi': '天翼云盘',
      'uc': 'UC网盘',
      'mobile': '移动云盘',
      '115': '115网盘',
      'pikpak': 'PikPak',
      'xunlei': '迅雷网盘',
      '123': '123网盘',
      'magnet': '磁力链接',
      'ed2k': '电驴链接',
      'lanzou': '蓝奏云',
      'weiyun': '微云'
    };
    return nameMap[type] || type;
  }

  // 获取当前选中的筛选项标签
  const getSelectedLabel = () => {
    const option = typeOptions.find(opt => opt.value === selectedType);
    return option ? option.label : '全部网盘';
  };

  return (
    <div className="space-y-6">
      {/* 结果统计和筛选 */}
      <div className="space-y-4">
        {/* 结果统计 */}
        <div className="flex items-center justify-between px-4 md:px-0">
          <div className="flex items-center gap-2 md:gap-4">
            <h2 className={`text-base sm:text-lg md:text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              搜索结果
            </h2>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
              isDarkMode
                ? 'bg-accent-color/20 text-accent-color border border-accent-color/30'
                : 'bg-gray-100 text-gray-700'
            }`}>
              共 {totalResults} 个
            </span>
          </div>

          {/* 移动端筛选按钮 */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`md:hidden px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {getSelectedLabel()}
          </button>
        </div>

        {/* 桌面端网盘类型筛选 */}
        <div className="hidden md:flex items-center gap-2 px-4 md:px-0">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-text-secondary' : 'text-gray-600'
          }`}>
            筛选：
          </span>
          <div className="flex gap-1 flex-wrap max-w-4xl">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeSelect(option.value)}
                className={`px-3 py-1 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  selectedType === option.value
                    ? isDarkMode
                      ? 'bg-accent-color text-white shadow-lg'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {option.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  selectedType === option.value
                    ? 'bg-white/20'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {getTypeCount(option.value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 移动端底部筛选抽屉 */}
      {isFilterOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* 底部抽屉 */}
          <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-8 animate-slide-up ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          style={{
            paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
          }}>
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                筛选网盘类型
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className={`p-2 rounded-xl transition-colors active:scale-95 ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 筛选选项 */}
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTypeSelect(option.value)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 ${
                    selectedType === option.value
                      ? isDarkMode
                        ? 'bg-accent-color text-white shadow-lg'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 text-text-secondary hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className={`text-sm ${
                    selectedType === option.value
                      ? 'text-white/80'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {getTypeCount(option.value)} 个结果
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 搜索结果列表 */}
      {results.length > 0 ? (
        <div className="space-y-4 px-4 md:px-0">
          {results.map((result, index) => (
            <div
              key={`${result.unique_id}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              data-result-card
            >
              <ResultCard result={result} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <svg className={`w-8 h-8 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <p className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            没有找到相关结果
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            尝试使用其他关键词或检查筛选条件
          </p>
        </div>
      )}

      {/* 移动端回到顶部按钮 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`md:hidden fixed bottom-20 right-4 z-30 p-3 rounded-full shadow-lg transition-all duration-300 active:scale-95 animate-fade-in ${
            isDarkMode
              ? 'bg-accent-color hover:bg-accent-hover text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom))'
          }}
          aria-label="回到顶部"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}; 