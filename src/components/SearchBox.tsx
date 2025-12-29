import { useState, useRef, useEffect } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSearch(query.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    // 自动聚焦到搜索框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row items-center gap-3 w-full px-4 md:px-0"
    >
      <div className="relative flex-1 w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词搜索网盘资源..."
          enterKeyHint="search"
          className="w-full px-4 py-3 pr-10 text-base md:text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 active:scale-[0.99]"
          disabled={isLoading}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
            aria-label="清除搜索"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            搜索中...
          </div>
        ) : (
          '搜索'
        )}
      </button>
    </form>
  );
}; 