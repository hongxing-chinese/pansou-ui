import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SearchBox } from './components/SearchBox';
import { SearchResults } from './components/SearchResults';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { Footer } from './components/Footer';
import { StatusPage } from './pages/StatusPage';
import { useState, useMemo } from 'react';
import { searchPanSouGet } from './services/pansouApi';
import { handleApiError, getErrorMessage } from './utils/errorHandler';
import type { SearchResult } from './types/api';

const Navigation = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const isStatusPage = location.pathname === '/status';

  return (
    <nav className={`border-b sticky top-0 z-50 ${
      isDarkMode ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80'
    } backdrop-blur-lg`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo 区域 - 移动端简化 */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-blue-500'
            }`}>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold">PanSou 盘搜</h1>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                聚合网盘资源搜索与监控
              </p>
            </div>
            <h1 className="sm:hidden text-lg font-bold">盘搜</h1>
          </Link>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            {/* 导航按钮 - 移动端优化 */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-sm md:text-base font-medium transition-all duration-200 active:scale-95 ${
                  !isStatusPage
                    ? isDarkMode ? 'bg-accent-color text-white shadow-lg' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                搜索
              </Link>
              <Link
                to="/status"
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-sm md:text-base font-medium transition-all duration-200 active:scale-95 ${
                  isStatusPage
                    ? isDarkMode ? 'bg-accent-color text-white shadow-lg' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">状态监控</span>
                <span className="sm:hidden">状态</span>
              </Link>
            </div>

            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
              title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
              aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const SearchPage = () => {
  const { isDarkMode } = useTheme();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // 移动端默认10条，桌面端默认20条
  const [pageSize, setPageSize] = useState(() => {
    return window.innerWidth < 768 ? 10 : 20;
  });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showOtherTypes, setShowOtherTypes] = useState(false);

  // 动态提取所有出现过的网盘类型
  const allTypes = useMemo(() => {
    const typeSet = new Set<string>();
    searchResults.forEach(result => {
      result.links.forEach(link => {
        if (link.type) typeSet.add(link.type);
      });
    });
    return Array.from(typeSet).sort();
  }, [searchResults]);

  // 其他类型
  const otherTypes = useMemo(() => {
    const MAIN_TYPES = ['aliyun', 'baidu', 'quark'];
    return allTypes.filter(type => !MAIN_TYPES.includes(type));
  }, [allTypes]);

  // 根据筛选条件过滤结果
  const filteredResults = useMemo(() => {
    if (selectedType === 'all') return searchResults;
    if (selectedType === 'other') {
      return searchResults.filter(result => 
        result.links.some(link => otherTypes.includes(link.type))
      );
    }
    return searchResults.filter(result => 
      result.links.some(link => link.type === selectedType)
    );
  }, [searchResults, selectedType, otherTypes]);

  // 分页处理
  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const pagedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      setCurrentPage(1);
      setSelectedType('all');
      setShowOtherTypes(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setSelectedType('all');
    setShowOtherTypes(false);

    try {
      const response = await searchPanSouGet(query.trim(), {
        res: 'results',
        src: 'all',
      });

      if (response.code === 0 && response.data) {
        let results = response.data.results || [];
        // 按时间降序排序
        results = results
          .slice()
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
        setSearchResults(results);
      } else {
        throw new Error(response.message || '搜索失败');
      }
    } catch (err) {
      const appError = handleApiError(err);
      setError(getErrorMessage(appError));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理筛选类型选择
  const handleTypeSelect = (type: string) => {
    const MAIN_TYPES = ['all', 'baidu', 'aliyun', 'quark'];
    
    if (type === 'other') {
      setShowOtherTypes(true);
      setSelectedType('other');
    } else if (MAIN_TYPES.includes(type)) {
      // 选择主要网盘类型时，隐藏其他网盘类型
      setShowOtherTypes(false);
      setSelectedType(type);
    } else {
      // 选择具体的其他网盘类型时，保持其他网盘类型可见
      setShowOtherTypes(true);
      setSelectedType(type);
    }
    
    setCurrentPage(1); // 重置到第一页
  };

  // 分页大小选择器
  const PageSizeSelector = () => (
    <div className="flex items-center gap-2">
      <span className={`text-xs md:text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-600'}`}>
        每页：
      </span>
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setCurrentPage(1);
        }}
        className={`px-2 py-1 rounded-lg border text-xs md:text-sm active:scale-95 transition-transform ${
          isDarkMode
            ? 'bg-surface-2 border-border-color text-text-primary'
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        <option value={10}>10条</option>
        <option value={20}>20条</option>
        <option value={50}>50条</option>
        <option value={100}>100条</option>
      </select>
    </div>
  );

  // 分页控件
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 7;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 md:px-0">
        <PageSizeSelector />

        <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
          <button
            className={`px-2 md:px-3 py-1 rounded-lg border text-xs md:text-sm transition-all duration-200 active:scale-95 ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                  ? 'border-border-color text-text-secondary hover:bg-surface-2'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            上一页
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`px-2 md:px-3 py-1 rounded-lg border text-xs md:text-sm transition-all duration-200 active:scale-95 ${
                page === '...'
                  ? isDarkMode ? 'text-gray-400 border-transparent' : 'text-gray-500 border-transparent'
                  : page === currentPage
                    ? isDarkMode
                      ? 'bg-accent-color text-white border-accent-color shadow-lg'
                      : 'bg-blue-500 text-white border-blue-500'
                    : isDarkMode
                      ? 'border-border-color text-text-secondary hover:bg-surface-2'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              disabled={page === '...'}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={`px-2 md:px-3 py-1 rounded-lg border text-xs md:text-sm transition-all duration-200 active:scale-95 ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                  ? 'border-border-color text-text-secondary hover:bg-surface-2'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>

        <div className={`text-xs md:text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-600'}`}>
          第 {currentPage}/{totalPages} 页
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 transition-colors duration-300 ${
      isDarkMode ? 'bg-bg-primary text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <SearchBox onSearch={handleSearch} />
          
          {error && <ErrorMessage message={error} />}
          
          {isLoading && (
            <LoadingState message="搜索中..." />
          )}
          
          {!isLoading && pagedResults.length > 0 && (
            <>
              <SearchResults 
                results={pagedResults} 
                totalResults={searchResults.length} 
                allResults={searchResults}
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
                otherTypes={otherTypes}
                showOtherTypes={showOtherTypes}
              />
              <Pagination />
            </>
          )}
          
          {!isLoading && !error && searchResults.length === 0 && (
            <EmptyState 
              title="输入关键词开始搜索"
              description="支持搜索阿里云盘、百度网盘、夸克网盘等资源"
            />
          )}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};
