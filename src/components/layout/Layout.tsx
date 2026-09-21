import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { BottomNav } from './BottomNav';
import { Toast } from '../common/Toast';
import { InstallPrompt } from '../common/InstallPrompt';
import { TaskCompletionCelebration } from '../common/TaskCompletionCelebration';
import { CallProvider } from '../../context/CallContext';
import { IncomingCallModal } from '../call/IncomingCallModal';
import { ActiveDareBanner } from '../common/ActiveDareBanner';
import { useStudy } from '../../context/StudyContext';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeDares, authUser, acceptDare, skipDare, completeDare } = useStudy();

  return (
    <CallProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] bg-grid-paper text-[#3F3534]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Navigation Drawer / More Menu */}
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

          {/* Scrollable Viewport with mobile bottom nav clearance */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-7 pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />

              {/* Bottom stationery footer ribbon */}
              <div className="pt-6 pb-2 text-center select-none">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF2F4] border-2 border-[#F8B4C0] text-xs font-bold text-[#FF4D6D] shadow-xs font-hand">
                  🌸 Same App 💕 Same Dreams 💕 Together Always 🌸
                </span>
              </div>
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav onOpenMore={() => setMobileMenuOpen(true)} />
        </div>

        {/* Global Interactive Notification Toasts */}
        <Toast />

        {/* PWA Unobtrusive Install Prompt */}
        <InstallPrompt />

        {/* Task Completion Virtual Hug Celebration Overlay */}
        <TaskCompletionCelebration />

        {/* Global WebRTC Incoming Call Notification Modal */}
        <IncomingCallModal />

        {/* Step 6: Active Harmless Dare Banner */}
        <ActiveDareBanner
          dares={activeDares}
          currentUserId={authUser?._id}
          onAccept={acceptDare}
          onSkip={skipDare}
          onComplete={completeDare}
        />
      </div>
    </CallProvider>
  );
};
