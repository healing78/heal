import React, { useEffect, useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import {
  formatMemberNickname,
  isAdminRole,
  isAdminUser,
  isSuperAdmin
} from './core/communityRules';
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
  adminSaveFullMeeting,
  adminUpdateMember,
  approveAccountLinkRequest,
  approveSubPhoneRequest,
  batchSyncCommunityData,
  createMeeting,
  deleteMember,
  deleteMeeting,
  disconnectSubPhone,
  getSavedCurrentUserUid,
  reassignMemberUid,
  recalculateAndApplyAllBungScores,
  recordKakaoLogin,
  registerOnboardingMember,
  rejectAccountLinkRequest,
  resetToInitialDemoData,
  rollbackMeetingSettlement,
  saveCurrentUserUid,
  settleMeetingWithScores,
  subscribeCommunityData,
  toggleMeetingApplicant,
  updateCommunityConfig,
  updateMeetingDetails,
  updateMemberProfile,
  validateAndAuditBungScores
} from './services/communityService';
import { logoutFromKakao } from './services/kakaoAuthService';
import LoginOnboardingPage from './pages/LoginOnboardingPage';
import HomePage from './pages/HomePage';
import MeetingsPage from './pages/MeetingsPage';
import ReportsPage from './pages/ReportsPage';
import FriendsPage from './pages/FriendsPage';
import MemberProfilePage from './pages/MemberProfilePage';
import RankingPage from './pages/RankingPage';
import NicknamePage from './pages/NicknamePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';

export default function App() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [scoreLogs, setScoreLogs] = useState(INITIAL_SCORE_LOGS);
  const [communityConfig, setCommunityConfig] = useState(
    INITIAL_COMMUNITY_CONFIG
  );
  const [loginLogs, setLoginLogs] = useState([]);

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
  const [selectedMemberUid, setSelectedMemberUid] = useState(
    initialRoute.memberUid || null
  );
  const [friendsFilter, setFriendsFilter] = useState(
    () => initialRoute.friendsFilter || 'ALL'
  );
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');
  const [memberUidList, setMemberUidList] = useState([]);
  const [shareToast, setShareToast] = useState('');
  const [theme, setTheme] = useState(() => getSavedTheme());
  const [isOnboardingSimulation, setIsOnboardingSimulation] = useState(
    () => initialRoute.debugMode === 'onboarding'
  );
  const [isMasterTabEnabled, setIsMasterTabEnabled] = useState(() => {
    try {
      return localStorage.getItem('heal78_master_tab_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleMasterTab = (enabled) => {
    setIsMasterTabEnabled(enabled);
    try {
      if (enabled) {
        localStorage.setItem('heal78_master_tab_enabled', 'true');
      } else {
        localStorage.removeItem('heal78_master_tab_enabled');
      }
    } catch {
      // ignore
    }
    if (!enabled && activeTab === 'master') {
      navigateToTab('profile');
    }
  };

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
      if (snapshot.loginLogs) {
        setLoginLogs(snapshot.loginLogs);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const route = parseCurrentRoute();
      setActiveTab(route.tab);
      setSelectedMeetingId(route.meetingId || null);
      setSelectedMeetingSubView(route.subView || null);
      if (route.friendsFilter) {
        setFriendsFilter(route.friendsFilter);
      }
      const rawMemberUid = route.memberUid || event?.state?.uid || null;
      let cleanMemberUid = rawMemberUid;
      if (cleanMemberUid) {
        try {
          cleanMemberUid = decodeURIComponent(cleanMemberUid);
        } catch {
          // ignore
        }
      }
      setSelectedMemberUid(cleanMemberUid);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [impersonatedUid, setImpersonatedUid] = useState(null);
  const [profileSubTab, setProfileSubTab] = useState('profile');
  const effectiveUid = impersonatedUid || currentUserUid;
  const currentUser =
    members.find(
      (m) =>
        m.uid === effectiveUid ||
        (Array.isArray(m.subUids) && m.subUids.includes(effectiveUid))
    ) || null;

  const navigateToTab = (nextTab, params = {}, options = {}) => {
    const meetingParam =
      nextTab === 'meetings' ? params.id ?? null : null;
    const subViewParam =
      nextTab === 'meetings' ? params.subView ?? null : null;
    let memberUidParam =
      nextTab === 'members'
        ? params.uid ?? selectedMemberUid ?? null
        : null;
    if (memberUidParam) {
      try {
        memberUidParam = decodeURIComponent(memberUidParam);
      } catch {
        // ignore
      }
    }
    const filterParam =
      params.filter ?? friendsFilter;

    setActiveTab(nextTab);
    setSelectedMeetingId(meetingParam);
    setSelectedMeetingSubView(subViewParam);
    if (nextTab === 'members') {
      setSelectedMemberUid(memberUidParam);
    }
    if (nextTab === 'friends' && params.filter) {
      setFriendsFilter(params.filter);
    }
    if (nextTab === 'profile' && params.subTab) {
      setProfileSubTab(params.subTab);
    }

    pushRouteUrl(
      nextTab,
      {
        ...(meetingParam ? { id: meetingParam } : {}),
        ...(subViewParam ? { subView: subViewParam } : {}),
        ...(memberUidParam ? { uid: memberUidParam } : {}),
        ...((nextTab === 'friends' || nextTab === 'members') && filterParam && filterParam !== 'ALL'
          ? { filter: filterParam }
          : {})
      },
      Boolean(options.replace)
    );
    if (typeof window !== 'undefined' && !options.noScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectMember = (uid, uidList = null, currentFilter = null, options = {}) => {
    let cleanUid = uid;
    try {
      cleanUid = decodeURIComponent(String(uid).trim());
    } catch {
      cleanUid = String(uid).trim();
    }
    setSelectedMemberUid(cleanUid);
    if (uidList && Array.isArray(uidList)) {
      setMemberUidList(uidList);
    }
    const filterToUse = currentFilter || friendsFilter;
    if (filterToUse) {
      setFriendsFilter(filterToUse);
    }
    navigateToTab('members', { uid: cleanUid, filter: filterToUse }, options);
  };

  const handleDeleteMember = async (targetUid) => {
    await deleteMember(targetUid);
  };

  const handleReassignMemberUid = async (oldUid, newUid) => {
    await reassignMemberUid(oldUid, newUid);
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
    memberUid: selectedMemberUid,
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
      showShareFeedback('공유 문구 및 링크가 복사되었습니다.');
    }
  };

  const handleShareSpecificMeeting = async (meeting, subView = null) => {
    if (!meeting) return;
    setActiveTab('meetings');
    setSelectedMeetingId(meeting.id);
    setSelectedMeetingSubView(subView);
    pushRouteUrl('meetings', {
      id: meeting.id,
      ...(subView ? { subView } : {})
    });

    const mtgMeta = buildRouteMeta({
      tab: 'meetings',
      meetingId: meeting.id,
      subView,
      meetings,
      members,
      communityConfig,
      currentUser
    });
    syncDocumentMeta(mtgMeta);

    const result = await shareRouteInfo(mtgMeta);
    if (result.copied) {
      showShareFeedback('공유 문구 및 링크가 복사되었습니다.');
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
    recordKakaoLogin(uid, nextUser?.realName || '');
    if (activeTab === 'admin' && (!nextUser || !isAdminRole(nextUser.role))) {
      navigateToTab('home');
    } else if (activeTab === 'login') {
      navigateToTab('home');
    }
  };

  const handleCompleteOnboarding = async (form, customUid) => {
    const newMember = await registerOnboardingMember(form, customUid);
    if (newMember?.uid) {
      recordKakaoLogin(newMember.uid, newMember.realName || '');
    }
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

  const handleSettleMeeting = async (meetingId, confirmedUids, overrideLocation = '') => {
    await settleMeetingWithScores(
      meetingId,
      confirmedUids,
      members,
      meetings,
      overrideLocation
    );
  };

  const handleRollbackMeeting = async (meetingId) => {
    await rollbackMeetingSettlement(
      meetingId,
      members,
      meetings
    );
  };

  const handleUpdateMeeting = async (meetingId, patch) => {
    await updateMeetingDetails(meetingId, patch);
  };

  const handleAdminSaveMeeting = async (meetingInput) => {
    return await adminSaveFullMeeting(meetingInput);
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

  const handleApproveAccountLink = async (applicantUid, sourceUid) => {
    await approveAccountLinkRequest(applicantUid, sourceUid);
  };

  const handleApproveSubPhone = async (applicantUid, primaryUid, subName) => {
    await approveSubPhoneRequest(applicantUid, primaryUid, subName);
  };

  const handleDisconnectSubPhone = async (primaryUid, subUid) => {
    await disconnectSubPhone(primaryUid, subUid);
  };

  const handleRejectAccountLink = async (applicantUid) => {
    await rejectAccountLinkRequest(applicantUid);
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
      isSimulation={isOnboardingSimulation}
      onExitSimulation={() => setIsOnboardingSimulation(false)}
      onSelectExistingMember={(uid) => {
        setIsOnboardingSimulation(false);
        setCurrentUserUid(uid);
        saveCurrentUserUid(uid);
        const targetMember = members.find((m) => m.uid === uid);
        recordKakaoLogin(uid, targetMember?.realName || '');
        if (activeTab === 'login') {
          navigateToTab('home');
        }
      }}
      onCompleteOnboarding={async (form, customUid) => {
        setIsOnboardingSimulation(false);
        await handleCompleteOnboarding(form, customUid);
      }}
      onNavigateTab={navigateToTab}
    />
  );

  // Determine main body content:
  // - '/nickname' is always accessible before and after login
  // - All other tabs show Before-Login screen when !currentUser, and After-Login screen when currentUser is present
  const renderPageBody = () => {
    if (isOnboardingSimulation) {
      return renderBeforeLoginView();
    }

    if (activeTab === 'nickname') {
      return (
        <NicknamePage
          currentUser={currentUser}
          members={members}
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
          onAdminSaveMeeting={handleAdminSaveMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onSettleMeeting={handleSettleMeeting}
          onRollbackMeeting={handleRollbackMeeting}
          onUpdateMemberProfile={handleUpdateProfile}
          onNavigateTab={navigateToTab}
        />
      );
    }

    if (activeTab === 'friends') {
      return (
        <FriendsPage
          currentUser={currentUser}
          members={members}
          communityConfig={communityConfig}
          activeFilter={friendsFilter}
          onChangeFilter={(filter) => {
            setFriendsFilter(filter);
            pushRouteUrl('friends', filter !== 'ALL' ? { filter } : {});
          }}
          searchQuery={friendsSearchQuery}
          onChangeSearchQuery={setFriendsSearchQuery}
          onSelectMember={handleSelectMember}
          onNavigateTab={navigateToTab}
        />
      );
    }

    if (activeTab === 'members') {
      const targetUid = selectedMemberUid || members[0]?.uid;
      return (
        <MemberProfilePage
          memberUid={targetUid}
          memberUidList={memberUidList}
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          onSelectMember={handleSelectMember}
          onAdminUpdateMember={handleAdminUpdateMember}
          onReassignMemberUid={handleReassignMemberUid}
          onBack={() => navigateToTab('friends', { filter: friendsFilter })}
          onNavigateTab={navigateToTab}
        />
      );
    }

    if (activeTab === 'reports') {
      if (isAdminRole(currentUser?.role)) {
        return (
          <AdminPage
            currentUser={currentUser}
            members={members}
            meetings={meetings}
            communityConfig={communityConfig}
            loginLogs={loginLogs}
            onOpenMeetingDetail={handleOpenMeetingDetail}
            onDeleteMeeting={handleDeleteMeeting}
            onAdminUpdateMember={handleAdminUpdateMember}
            onAdminAdjustEventScore={handleAdminAdjustEventScore}
            onAdminUpdateConfig={handleAdminUpdateConfig}
            onApproveAccountLink={handleApproveAccountLink}
            onApproveSubPhone={handleApproveSubPhone}
            onRejectAccountLink={handleRejectAccountLink}
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
          onLogout={() => handleSwitchUser('__LOGOUT__')}
        />
      );
    }

    if (activeTab === 'ranking') {
      return (
        <RankingPage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          scoreLogs={scoreLogs}
          onSelectMember={handleSelectMember}
          onOpenMeetingDetail={handleOpenMeetingDetail}
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
          onDisconnectSubPhone={handleDisconnectSubPhone}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onLogout={() => handleSwitchUser('__LOGOUT__')}
          isMasterTabEnabled={isMasterTabEnabled}
          onToggleMasterTab={handleToggleMasterTab}
          onNavigateTab={navigateToTab}
          initialSubTab={profileSubTab}
          onSubTabChange={setProfileSubTab}
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
          loginLogs={loginLogs}
          onOpenMeetingDetail={handleOpenMeetingDetail}
          onUpdateMeeting={handleUpdateMeeting}
          onAdminSaveMeeting={handleAdminSaveMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminAdjustEventScore={handleAdminAdjustEventScore}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onApproveAccountLink={handleApproveAccountLink}
          onApproveSubPhone={handleApproveSubPhone}
          onRejectAccountLink={handleRejectAccountLink}
        />
      );
    }

    if (activeTab === 'master' && isSuperAdmin(currentUser, communityConfig)) {
      return (
        <SuperAdminPage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminUpdateConfig={handleAdminUpdateConfig}
          onDeleteMember={handleDeleteMember}
          onReassignMemberUid={handleReassignMemberUid}
          onToggleMasterTab={handleToggleMasterTab}
          onNavigateTab={navigateToTab}
          onSwitchUser={handleSwitchUser}
          onBatchSyncData={batchSyncCommunityData}
          onResetInitialData={handleResetDemoData}
          onStartOnboardingSimulation={() => setIsOnboardingSimulation(true)}
          onAuditBungScores={validateAndAuditBungScores}
          onRecalculateBungScores={recalculateAndApplyAllBungScores}
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
        isMasterTabEnabled={isMasterTabEnabled}
      >
        <ErrorBoundary onReset={() => handleSelectMeetingId(null)}>
          {renderPageBody()}
        </ErrorBoundary>
      </AppLayout>
    </>
  );
}
