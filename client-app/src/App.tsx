import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import { useTaxi } from './hooks/useTaxi';
import { AppMode } from './types';

// Компоненты (пока заглушки, создадим позже)
import { AuthForm } from './components/auth/AuthForm';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { TaxiApp } from './components/taxi/TaxiApp';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function App() {
  const { isAuthenticated, user, loading: authLoading, error: authError, login, register, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    chats, 
    messages, 
    users, 
    activeChat, 
    loading: chatLoading,
    error: chatError,
    setActiveChat, 
    sendMessage, 
    markAsRead,
    getChatName,
    getChatAvatar,
    getUnreadCount
  } = useChat(user?.id);
  
  const {
    rides,
    activeRide,
    loading: taxiLoading,
    error: taxiError,
    estimateRide,
    bookRide,
    cancelRide
  } = useTaxi(user?.id);
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileTab, setMobileTab] = useState<'chats' | 'profile' | 'settings'>('chats');
  const [showProfile, setShowProfile] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('chat');

  // Handle authentication
  const handleAuth = async (data: any) => {
    try {
      if (authMode === 'login') {
        await login(data);
      } else {
        await register(data);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    markAsRead(chatId);
    // On mobile, hide sidebar when chat is selected
    if (window.innerWidth < 1024) {
      setMobileTab('chats');
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    if (activeChat) {
      try {
        await sendMessage(activeChat, content, type);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleUpdateProfile = async (data: any) => {
    // Update user profile logic would go here
    console.log('Update profile:', data);
  };

  const handleTaxiClick = () => {
    setAppMode('taxi');
  };

  const handleBackToChat = () => {
    setAppMode('chat');
  };

  const handleBookRide = async (rideData: any) => {
    try {
      await bookRide(rideData);
    } catch (error) {
      console.error('Failed to book ride:', error);
    }
  };

  const handleCancelRide = async (rideId: string, reason?: string) => {
    try {
      await cancelRide(rideId, reason);
    } catch (error) {
      console.error('Failed to cancel ride:', error);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show authentication form if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        loading={authLoading}
        error={authError}
        onModeChange={setAuthMode}
      />
    );
  }

  // Show taxi app if in taxi mode
  if (appMode === 'taxi') {
    return (
      <TaxiApp
        user={user}
        rides={rides}
        activeRide={activeRide}
        loading={taxiLoading}
        error={taxiError}
        onBack={handleBackToChat}
        onBookRide={handleBookRide}
        onCancelRide={handleCancelRide}
        onEstimateRide={estimateRide}
      />
    );
  }

  // Desktop layout
  const renderDesktopLayout = () => (
    <div className="hidden lg:flex h-screen bg-gray-100 dark:bg-gray-900">
      <ChatSidebar
        chats={chats}
        messages={messages}
        users={users}
        activeChat={activeChat}
        currentUser={user}
        unreadCount={getUnreadCount()}
        loading={chatLoading}
        error={chatError}
        onChatSelect={handleChatSelect}
        onProfileClick={() => setShowProfile(!showProfile)}
        onTaxiClick={handleTaxiClick}
        getChatName={getChatName}
        getChatAvatar={getChatAvatar}
      />
      
      {showProfile ? (
        <div className="flex-1">
          <ProfileSettings
            user={user}
            theme={theme}
            onUpdateProfile={handleUpdateProfile}
            onToggleTheme={toggleTheme}
            onLogout={logout}
          />
        </div>
      ) : (
        <ChatWindow
          chat={chats.find(c => c.id === activeChat) || null}
          messages={activeChat ? messages[activeChat] || [] : []}
          users={users}
          currentUser={user}
          loading={chatLoading}
          error={chatError}
          onSendMessage={handleSendMessage}
          getChatName={getChatName}
          getChatAvatar={getChatAvatar}
        />
      )}
    </div>
  );

  // Mobile layout
  const renderMobileLayout = () => (
    <div className="lg:hidden h-screen bg-gray-100 dark:bg-gray-900 pb-16">
      {mobileTab === 'chats' && !activeChat && (
        <ChatSidebar
          chats={chats}
          messages={messages}
          users={users}
          activeChat={activeChat}
          currentUser={user}
          unreadCount={getUnreadCount()}
          loading={chatLoading}
          error={chatError}
          onChatSelect={handleChatSelect}
          onProfileClick={() => setMobileTab('profile')}
          onTaxiClick={handleTaxiClick}
          getChatName={getChatName}
          getChatAvatar={getChatAvatar}
        />
      )}
      
      {mobileTab === 'chats' && activeChat && (
        <ChatWindow
          chat={chats.find(c => c.id === activeChat) || null}
          messages={activeChat ? messages[activeChat] || [] : []}
          users={users}
          currentUser={user}
          loading={chatLoading}
          error={chatError}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChat(null)}
          getChatName={getChatName}
          getChatAvatar={getChatAvatar}
        />
      )}
      
      {(mobileTab === 'profile' || mobileTab === 'settings') && (
        <ProfileSettings
          user={user}
          theme={theme}
          onUpdateProfile={handleUpdateProfile}
          onToggleTheme={toggleTheme}
          onLogout={logout}
          onBack={() => setMobileTab('chats')}
        />
      )}
      
      <MobileNavigation
        activeTab={mobileTab}
        unreadCount={getUnreadCount()}
        hasActiveRide={!!activeRide}
        onTabChange={setMobileTab}
        onTaxiClick={handleTaxiClick}
      />
    </div>
  );

  return (
    <>
      {renderDesktopLayout()}
      {renderMobileLayout()}
    </>
  );
}

export default App;

