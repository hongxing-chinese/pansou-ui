import { useTheme } from '../contexts/ThemeContext';

export const Footer = () => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t mt-auto ${
      isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className={`flex items-center justify-center gap-3 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span>© {currentYear} 盘搜</span>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
          <span>WideSeek All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
