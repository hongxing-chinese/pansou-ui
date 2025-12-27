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
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
        {/* 顶部标题与描述 */}
        <div className="mb-8 text-center">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
          isDarkMode 
            ? 'text-white' 
            : 'text-gray-900'
        }`}>
            API 状态监控
          </h1>
          <p className={`text-base md:text-lg ${
            isDarkMode ? 'text-text-secondary' : 'text-gray-600'
          }`}>
            实时监控 PanSou API 服务可用性
          </p>
        </div>

        {/* 主卡片 */}
        <div className={`w-full max-w-xl rounded-3xl p-8 glass-effect ${
          isDarkMode 
            ? 'shadow-2xl' 
            : 'shadow-xl'
        }`}> 
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className={`text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                PanSou API
              </div>
              <div className={`text-2xl font-bold ${statusColor}`}>{statusText}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
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
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    刷新中...
                  </>
                ) : (
                  <>刷新</>
                )}
              </button>
              <div className={`text-xs ${
                isDarkMode ? 'text-text-secondary' : 'text-gray-400'
              }`}>
                上次检查：{currentStatus.lastChecked.toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {/* 进度条与百分比 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-text-secondary' : 'text-gray-700'
              }`}>
                可用率
              </span>
              <span className={`text-sm font-bold ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                {uptime.toFixed(2)}%
              </span>
            </div>
            <div className={`w-full h-3 rounded-full ${barBg} overflow-hidden`}>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${uptime}%` }}
              ></div>
            </div>
          </div>

          {/* 响应时间与错误 */}
          <div className="flex items-center justify-between mt-6">
            <div className={`text-sm ${
              isDarkMode ? 'text-text-secondary' : 'text-gray-600'
            }`}>
              响应时间：<span className={`font-semibold ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}>
                {currentStatus.responseTime} ms
              </span>
            </div>
            {currentStatus.error && (
              <div className="text-sm text-red-400 font-medium">{currentStatus.error}</div>
            )}
          </div>

          {/* 监控状态 */}
          <div className={`mt-6 pt-4 border-t ${
            isDarkMode ? 'border-border-color' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between text-sm">
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
              <div className={`text-xs mt-1 ${
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