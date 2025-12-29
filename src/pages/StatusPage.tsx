import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { statusService } from '../services/statusService';
import type { StatusPageData } from '../types/status';

function getBarColor(uptime: number) {
  if (uptime >= 99) return 'bg-green-500';
  if (uptime >= 95) return 'bg-yellow-400';
  return 'bg-red-500';
}

export const StatusPage = () => {
  const { isDarkMode } = useTheme();
  const [statusData, setStatusData] = useState<StatusPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    loadStatusData();
    // 启动监控，每1分钟检查一次
    statusService.startMonitoring(60000);

    // 设置下次检查时间
    const now = new Date();
    const nextCheck = new Date(now.getTime() + 60000);
    setNextCheckTime(nextCheck);

    // 更新下次检查时间
    const timeInterval = setInterval(() => {
      const now = new Date();
      const nextCheck = new Date(now.getTime() + 60000);
      setNextCheckTime(nextCheck);
    }, 60000);

    return () => {
      statusService.stopMonitoring();
      clearInterval(timeInterval);
    };
  }, []);

  const loadStatusData = async () => {
    setIsLoading(true);
    try {
      const data = statusService.getStatusData();
      setStatusData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await statusService.checkApiHealth();
      const data = statusService.getStatusData();
      setStatusData(data);

      // 更新下次检查时间
      const now = new Date();
      const nextCheck = new Date(now.getTime() + 60000);
      setNextCheckTime(nextCheck);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || !statusData) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        isDarkMode
          ? 'bg-bg-primary text-white'
          : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
          isDarkMode ? 'border-gray-500' : 'border-blue-500'
        }`}></div>
          <p className={isDarkMode ? 'text-text-secondary' : 'text-gray-600'}>加载状态信息...</p>
        </div>
      </div>
    );
  }

  const { currentStatus, uptime } = statusData;
  const barColor = getBarColor(uptime);
  const barBg = isDarkMode ? 'bg-surface-2' : 'bg-gray-200';
  const statusText = currentStatus.isHealthy ? '在线' : '离线';
  const statusColor = currentStatus.isHealthy ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`flex-1 ${
      isDarkMode
        ? 'bg-bg-primary text-white'
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-6 md:py-8">
        {/* 顶部标题与描述 */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${
          isDarkMode
            ? 'text-white'
            : 'text-gray-900'
        }`}>
            API 状态监控
          </h1>
          <p className={`text-sm md:text-base lg:text-lg ${
            isDarkMode ? 'text-text-secondary' : 'text-gray-600'
          }`}>
            实时监控 PanSou API 服务可用性
          </p>
        </div>

        {/* 主卡片 - 移动端优化 */}
        <div className={`w-full max-w-xl rounded-2xl md:rounded-3xl p-6 md:p-8 glass-effect ${
          isDarkMode
            ? 'shadow-2xl'
            : 'shadow-xl'
        }`}>
          {/* 服务名称和状态 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <div className={`text-base md:text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                PanSou API
              </div>
              <div className={`text-xl md:text-2xl font-bold ${statusColor}`}>{statusText}</div>
            </div>

            {/* 刷新按钮 */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-95 ${
                isRefreshing
                  ? isDarkMode
                    ? 'bg-surface-2 text-text-secondary cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-accent-color hover:bg-accent-hover text-white shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRefreshing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  刷新中...
                </div>
              ) : (
                '刷新'
              )}
            </button>
          </div>

          {/* 核心指标 - Grid 布局 */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            {/* 可用率 */}
            <div className={`p-4 rounded-2xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <p className={`text-xs md:text-sm mb-1 ${
                isDarkMode ? 'text-text-secondary' : 'text-gray-500'
              }`}>
                可用率
              </p>
              <p className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                {uptime.toFixed(2)}%
              </p>
              {/* 进度条 */}
              <div className={`w-full h-2 rounded-full ${barBg} overflow-hidden mt-2`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${uptime}%` }}
                ></div>
              </div>
            </div>

            {/* 响应时间 */}
            <div className={`p-4 rounded-2xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <p className={`text-xs md:text-sm mb-1 ${
                isDarkMode ? 'text-text-secondary' : 'text-gray-500'
              }`}>
                响应时间
              </p>
              <p className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                {currentStatus.responseTime}
                <span className="text-sm md:text-base font-normal ml-1">ms</span>
              </p>
            </div>
          </div>

          {/* 上次检查时间 */}
          <div className={`text-xs md:text-sm mb-4 ${
            isDarkMode ? 'text-text-secondary' : 'text-gray-500'
          }`}>
            上次检查：{currentStatus.lastChecked.toLocaleString('zh-CN')}
          </div>

          {/* 错误信息 */}
          {currentStatus.error && (
            <div className={`p-3 rounded-xl mb-4 ${
              isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
            }`}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{currentStatus.error}</span>
              </div>
            </div>
          )}

          {/* 监控状态 */}
          <div className={`pt-4 border-t ${
            isDarkMode ? 'border-border-color' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className={isDarkMode ? 'text-text-secondary' : 'text-gray-600'}>
                  自动监控已启用
                </span>
              </div>
              <div className={isDarkMode ? 'text-text-secondary' : 'text-gray-500'}>
                检查间隔：1分钟
              </div>
            </div>
            {nextCheckTime && (
              <div className={`text-xs mt-2 ${
                isDarkMode ? 'text-text-secondary' : 'text-gray-400'
              }`}>
                下次检查：{nextCheckTime.toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 