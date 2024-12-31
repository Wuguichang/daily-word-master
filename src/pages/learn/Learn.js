import React, { useState, useEffect, useCallback } from 'react';
import { wordCategories, generateDailyWords } from '../../data/words';
import { useUser } from '../../context/UserContext';
import WordCard from '../../components/WordCard/WordCard';
import ProgressStats from '../../components/ProgressStats/ProgressStats';
import CategorySelector from '../../components/CategorySelector/CategorySelector';

const Learn = () => {
  const [viewMode, setViewMode] = useState('daily');
  const [selectedCategory, setSelectedCategory] = useState('essential');
  const [showMeaning, setShowMeaning] = useState({});
  const [dailyWords, setDailyWords] = useState(null);
  const [learningProgress, setLearningProgress] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(0);
  
  const TOTAL_WORDS = 30;
  const WORDS_PER_PAGE = 3;
  const TOTAL_PAGES = Math.ceil(TOTAL_WORDS / WORDS_PER_PAGE);
  
  const { user } = useUser();

  const loadDailyWords = useCallback((date) => {
    try {
      const savedDailyWords = localStorage.getItem(`dailyWords_${date}`);
      const savedProgress = localStorage.getItem(`wordProgress_${user.username}_${date}`);
      
      let words;
      if (savedDailyWords) {
        words = JSON.parse(savedDailyWords);
      } else {
        words = generateDailyWords(date);
        localStorage.setItem(`dailyWords_${date}`, JSON.stringify(words));
      }
      
      setDailyWords(words);
      setLearningProgress(savedProgress ? JSON.parse(savedProgress) : {});
    } catch (error) {
      console.error('加载单词数据失败:', error);
    }
  }, [user.username]);

  useEffect(() => {
    if (user && selectedDate) {
      loadDailyWords(selectedDate);
    }
  }, [selectedDate, user, loadDailyWords]);

  const handleModeChange = (mode) => {
    setViewMode(mode);
    setShowMeaning({});
    if (mode === 'daily') {
      loadDailyWords(selectedDate);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowMeaning({});
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowMeaning({});
  };

  const getDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const markWordStatus = (wordId, status) => {
    const newProgress = {
      ...learningProgress,
      [wordId]: status === learningProgress[wordId] ? null : status
    };
    setLearningProgress(newProgress);
    localStorage.setItem(
      `wordProgress_${user.username}_${selectedDate}`,
      JSON.stringify(newProgress)
    );
  };

  const stats = {
    total: TOTAL_WORDS,
    learned: Object.values(learningProgress).filter(s => s === 'learned').length,
    mastered: Object.values(learningProgress).filter(s => s === 'mastered').length
  };

  const handleToggleMeaning = (wordId) => {
    setShowMeaning(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  const playAudio = async (word) => {
    try {
      const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`);
      await audio.play();
    } catch (error) {
      console.error('音频播放失败:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? '请先与页面交互后再播放音频'
        : '音频加载失败，请检查网络连接';
      alert(errorMessage);
    }
  };

  const getCurrentPageWords = () => {
    if (!dailyWords?.words) return [];
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    return dailyWords.words.slice(startIndex, endIndex);
  };

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setShowMeaning({});
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (!dailyWords?.words) return;
    const maxPage = Math.ceil(dailyWords.words.length / WORDS_PER_PAGE) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(prev => prev + 1);
      setShowMeaning({});
    }
  }, [currentPage, dailyWords?.words]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevPage, handleNextPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">学习模式</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleModeChange('daily')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'daily'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              每日学习
            </button>
            <button
              onClick={() => handleModeChange('category')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'category'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              分类学习
            </button>
          </div>
        </div>

        {viewMode === 'daily' && (
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-700">选择日期：</label>
            <select
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getDateOptions().map(date => (
                <option key={date} value={date}>
                  {date === new Date().toISOString().split('T')[0]
                    ? `${date} (今天)`
                    : date}
                </option>
              ))}
            </select>
          </div>
        )}

        <ProgressStats stats={stats} />
      </div>

      {viewMode === 'daily' ? (
        dailyWords && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedDate === new Date().toISOString().split('T')[0]
                  ? '今日单词'
                  : '历史单词'}
              </h2>
              <span className="text-sm text-gray-500">
                {dailyWords.date} · 第{currentPage + 1}/{TOTAL_PAGES}页 · 共{TOTAL_WORDS}个单词
              </span>
            </div>

            <div className="relative">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-md z-10
                  ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-8">
                {getCurrentPageWords().map((word, index) => {
                  const globalIndex = currentPage * WORDS_PER_PAGE + index;
                  return (
                    <WordCard
                      key={`daily-${selectedDate}-${globalIndex}`}
                      word={word}
                      status={learningProgress[`daily-${selectedDate}-${globalIndex}`]}
                      isShowingMeaning={showMeaning[`daily-${selectedDate}-${globalIndex}`]}
                      onToggleMeaning={() => handleToggleMeaning(`daily-${selectedDate}-${globalIndex}`)}
                      onPlayAudio={playAudio}
                      onMarkStatus={(status) => markWordStatus(`daily-${selectedDate}-${globalIndex}`, status)}
                    />
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === TOTAL_PAGES - 1}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-md z-10
                  ${currentPage === TOTAL_PAGES - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="mt-8">
              <div className="flex justify-center gap-2">
                {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all
                      ${index === currentPage
                        ? 'bg-primary-500 w-4'
                        : 'bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <CategorySelector
            categories={wordCategories}
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
          />
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 mt-8 text-sm text-blue-700">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium mb-1">学习小贴士</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>每天学习30个新单词</li>
              <li>点击单词卡片上的喇叭图标可以听发音</li>
              <li>学会一个单词后，点击"已学习"按钮</li>
              <li>完全掌握后，点击"已掌握"按钮</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn; 