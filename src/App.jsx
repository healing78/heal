import React, { useEffect, useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import { isAdminRole, isAdminUser } from './core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCORE_LOGS
} from './core/initialData';
import {
  buildRouteMeta,
  parseCurrentRoute,
  pushRouteUrl,
  shareRouteInfo,
  syncDocumentMeta
} from './core/routeMeta';
import { getSavedTheme, saveAndApplyTheme } from './core/theme';
import {
  adminAdjustEventScore,
  adminUpdateMember,
  createMeeting,
  getSavedCurrentUserUid,
  registerOnboardingMember,
  resetToInitialDemoData,
  saveCurrentUserUid,
  settleMeetingWithScores,
  subscribeCommunityData,
  toggleMeetingApplicant,
  updateCommunityConfig,
  updateMeetingDetails,
  updateMemberProfile,
  deleteMeeting
} from './services/communityService';
import { logoutFromKakao } from './services/kakaoAuthService';
import LoginOnboardingPage from './pages/LoginOnboardingPage';
import HomePage from './pages/HomePage';
import MeetingsPage from './pages/MeetingsPage';
import ReportsPage from './pages/ReportsPage';
import RankingPage from './pages/RankingPage';
import NicknamePage from './pages/NicknamePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [scoreLogs, setScoreLogs] = useState(INITIAL_SCORE_LOGS);
  const [communityConfig, setCommunityConfig] = useState(
    INITIAL_COMMUNITY_CONFIG
  );

  const [currentUserUid, setCurrentUserUid] = useState(() =>
    getSavedCurrentUserUid()
  );

  const initialRoute = parseCurrentRoute();
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [selectedMeetingId, setSelectedMeetingId] = useState(
    initialRoute.meetingId
  );
  const [selectedMeetingSubView, setSelectedMeetingSubView] = useState(
    initialRoute.subView
  );
  const [shareToast, setShareToast] = useState('');
  const [theme, setTheme] = useState(() => getSavedTheme());

  useEffect(() => {
    saveAndApplyTheme(theme);
  }, [theme]);

  const handleChangeTheme = (nextTheme) => {
    const applied = saveAndApplyTheme(nextTheme);
    setTheme(applied);
  };

  useEffect(() => {
    const unsubscribe = subscribeCommunityData((snapshot) => {
      setMembers(snapshot.members);
      setMeetings(snapshot.meetings);
      setScoreLogs(snapshot.scoreLogs);
      setCommunityConfig(snapshot.communityConfig);
    });
    return () => unsubscribe();
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseCurrentRoute();
      setActiveTab(route.tab);
      setSelectedMeetingId(route.meetingId);
      setSelectedMeetingSubView(route.subView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [impersonatedUid, setImpersonatedUid] = useState(null);
  const effectiveUid = impersonatedUid || currentUserUid;
  const currentUser = members.find((m) => m.uid === effectiveUid) || null;

  const navigateToTab = (nextTab, params = {}) => {
    const meetingParam =
      nextTab === 'meetings' ? params.id ?? null : null;
    const subViewParam =
      nextTab === 'meetings' ? params.subView ?? null : null;
    setActiveTab(nextTab);
    setSelectedMeetingId(meetingParam);
    setSelectedMeetingSubView(subViewParam);
    pushRouteUrl(nextTab, {
      ...(meetingParam ? { id: meetingParam } : {}),
      ...(subViewParam ? { subView: subViewParam } : {})
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectMeetingId = (meetingId, subView = null) => {
    setSelectedMeetingId(meetingId);
    setSelectedMeetingSubView(subView);
    pushRouteUrl('meetings', {
      ...(meetingId ? { id: meetingId } : {}),
      ...(subView ? { subView } : {})
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenMeetingDetail = (meetingId, subView = null) => {
    navigateToTab('meetings', { id: meetingId, subView });
  };

  // Compute dynamic 20-char top header summary & document.title for current page (Before & After Login)
  const currentMeta = buildRouteMeta({
    tab: activeTab,
    meetingId: selectedMeetingId,
    subView: selectedMeetingSubView,
    meetings,
    members,
    communityConfig,
    currentUser
  });

  useEffect(() => {
    syncDocumentMeta(currentMeta);
  }, [currentMeta]);

  const showShareFeedback = (msg) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(''), 2500);
  };

  const handleShareCurrentRoute = async () => {
    const result = await shareRouteInfo(currentMeta);
    if (result.copied) {
      showShareFeedback(
        `카톡 공유 문구 복사됨: "${currentMeta.headerSummary}"`
      );
    }
  };

  const handleShareSpecificMeeting = async (meeting) => {
    if (!meeting) return;
    setActiveTab('meetings');
    setSelectedMeetingId(meeting.id);
    pushRouteUrl('meetings', { id: meeting.id });

    const mtgMeta = buildRouteMeta({
      tab: 'meetings',
      meetingId: meeting.id,
      meetings,
      members,
      communityConfig,
      currentUser
    });
    syncDocumentMeta(mtgMeta);

    const result = await shareRouteInfo(mtgMeta);
    if (result.copied) {
      showShareFeedback(`일정 안내 복사됨: "${mtgMeta.headerSummary}"`);
    }
  };

  const handleSwitchUser = (uid) => {
    if (uid === '__LOGOUT__') {
      logoutFromKakao();
      setCurrentUserUid(null);
      saveCurrentUserUid(null);
      return;
    }
    setCurrentUserUid(uid);
    saveCurrentUserUid(uid);
    const nextUser = members.find((m) => m.uid === uid);
    if (activeTab === 'admin' && (!nextUser || !isAdminRole(nextUser.role))) {
      navigateToTab('home');
    } else if (activeTab === 'login') {
      navigateToTab('home');
    }
  };

  const handleCompleteOnboarding = async (form, customUid) => {
    const newMember = await registerOnboardingMember(form, customUid);
    setCurrentUserUid(newMember.uid);
    saveCurrentUserUid(newMember.uid);
    if (activeTab === 'login') {
      navigateToTab('home');
    }
  };

  const handleToggleApplyMeeting = async (meetingId) => {
    if (!currentUser) return;
    await toggleMeetingApplicant(meetingId, currentUser.uid);
  };

  const handleCreateMeeting = async (meetingInput) => {
    if (!currentUser) return null;
    return await createMeeting(currentUser.uid, meetingInput);
  };

  const handleSettleMeeting = async (meetingId, confirmedUids) => {
    await settleMeetingWithScores(
      meetingId,
      confirmedUids,
      members,
      meetings
    );
  };

  const handleUpdateMeeting = async (meetingId, patch) => {
    await updateMeetingDetails(meetingId, patch);
  };

  const handleDeleteMeeting = async (meetingId) => {
    await deleteMeeting(meetingId);
    handleSelectMeetingId(null);
  };

  const handleUpdateProfile = async (updatedFields) => {
    if (!currentUser) return;
    await updateMemberProfile(currentUser.uid, updatedFields);
  };

  const handleAdminUpdateMember = async (targetUid, patch) => {
    await adminUpdateMember(targetUid, patch);
  };

  const handleAdminAdjustEventScore = async (targetUid, delta, reason) => {
    await adminAdjustEventScore(targetUid, delta, reason, members);
  };

  const handleAdminUpdateConfig = async (nextConfig) => {
    await updateCommunityConfig(nextConfig);
  };

  const handleResetDemoData = () => {
    resetToInitialDemoData();
    setCurrentUserUid('kakao:1001');
    navigateToTab('home');
  };

  // Common Before-Login View (retains current sub-route so logging in opens that exact page)
  const renderBeforeLoginView = () => (
    <LoginOnboardingPage
      activeTab={activeTab}
      headerSummary={currentMeta.headerSummary}
      members={members}
      onSelectExistingMember={(uid) => {
        setCurrentUserUid(uid);
        saveCurrentUserUid(uid);
        if (activeTab === 'login') {
          navigateToTab('home');
        }
      }}
      onCompleteOnboarding={handleCompleteOnboarding}
      onNavigateTab={navigateToTab}
    />
  );

  // Determine main body content:
  // - '/nickname' is always accessible before and after login
  // - All other tabs show Before-Login screen when !currentUser, and After-Login screen when currentUser is present
  const renderPageBody = () => {
    if (activeTab === 'nickname') {
      return (
        <NicknamePage
          currentUser={currentUser}
          communityConfig={communityConfig}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onNavigateTab={navigateToTab}
          onSharePage={handleShareCurrentRoute}
        />
      );
    }

    if (!currentUser || activeTab === 'login') {
      return renderBeforeLoginView();
    }

    if (activeTab === 'meetings') {
      return (
        <MeetingsPage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          selectedMeetingId={selectedMeetingId}
          selectedMeetingSubView={selectedMeetingSubView}
          onSelectMeetingId={handleSelectMeetingId}
          onSelectMeetingSubView={(sub) =>
            handleSelectMeetingId(selectedMeetingId, sub)
          }
          onShareMeeting={handleShareSpecificMeeting}
          onToggleApplyMeeting={handleToggleApplyMeeting}
          onCreateMeeting={handleCreateMeeting}
          onUpdateMeeting={handleUpdateMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onSettleMeeting={handleSettleMeeting}
          onUpdateMemberProfile={handleUpdateProfile}
          onNavigateTab={navigateToTab}
        />
      );
    }

    if (activeTab === 'reports') {
      if (isAdminRole(currentUser?.role)) {
        return (
          <AdminPage
            members={members}
            meetings={meetings}
            communityConfig={communityConfig}
            onOpenMeetingDetail={handleOpenMeetingDetail}
            onDeleteMeeting={handleDeleteMeeting}
            onAdminUpdateMember={handleAdminUpdateMember}
            onAdminAdjustEventScore={handleAdminAdjustEventScore}
            onAdminUpdateConfig={handleAdminUpdateConfig}
          />
        );
      }
      return (
        <ProfilePage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          onOpenMeetingDetail={handleOpenMeetingDetail}
          onUpdateProfile={handleUpdateProfile}
          onSwitchUser={handleSwitchUser}
          onResetDemoData={handleResetDemoData}
          onLogout={() => handleSwitchUser('__LOGOUT__')}
        />
      );
    }

    if (activeTab === 'ranking') {
      return (
        <RankingPage
          currentUser={currentUser}
          members={members}
          scoreLogs={scoreLogs}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <ProfilePage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          onOpenMeetingDetail={handleOpenMeetingDetail}
          onUpdateProfile={handleUpdateProfile}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onSwitchUser={handleSwitchUser}
          onResetDemoData={handleResetDemoData}
          onLogout={() => handleSwitchUser('__LOGOUT__')}
        />
      );
    }

    if (activeTab === 'admin' && isAdminUser(currentUser, communityConfig)) {
      return (
        <AdminPage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          onOpenMeetingDetail={handleOpenMeetingDetail}
          onDeleteMeeting={handleDeleteMeeting}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminAdjustEventScore={handleAdminAdjustEventScore}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onImpersonateUser={(uid) => {
            setImpersonatedUid(uid);
            navigateToTab('home');
          }}
        />
      );
    }

    return (
      <HomePage
        currentUser={currentUser}
        members={members}
        meetings={meetings}
        communityConfig={communityConfig}
        onAdminUpdateConfig={handleAdminUpdateConfig}
        onToggleApplyMeeting={handleToggleApplyMeeting}
        onNavigateTab={navigateToTab}
        onOpenMeetingDetail={handleOpenMeetingDetail}
        onShareMeeting={handleShareSpecificMeeting}
      />
    );
  };

  return (
    <>
      {impersonatedUid && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99999,
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
            color: '#ffffff',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👁️</span>
            <span>
              현재 <strong>{currentUser ? formatMemberNickname(currentUser) : effectiveUid}</strong> 님의 시점으로 열람 중입니다.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: '#ffffff',
              color: '#4f46e5',
              fontWeight: 600,
              padding: '3px 10px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '4px'
            }}
            onClick={() => setImpersonatedUid(null)}
          >
            어드민으로 복귀 ↩
          </button>
        </aside>
      )}
      <AppLayout
        activeTab={activeTab}
        onChangeTab={navigateToTab}
        currentUser={currentUser}
        members={members}
        communityConfig={communityConfig}
        onSwitchUser={handleSwitchUser}
        onResetDemoData={handleResetDemoData}
        headerSummary={currentMeta.headerSummary}
        onShareCurrentRoute={handleShareCurrentRoute}
        shareToast={shareToast}
        theme={theme}
        onChangeTheme={handleChangeTheme}
      >
        {renderPageBody()}
      </AppLayout>
    </>
  );
}
