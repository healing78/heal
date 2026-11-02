import React, { useEffect, useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import { isAdminRole } from './core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCORE_LOGS
} from './core/initialData';
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
  updateMemberProfile
} from './services/communityService';
import { logoutFromKakao } from './services/kakaoAuthService';
import LoginOnboardingPage from './pages/LoginOnboardingPage';
import HomePage from './pages/HomePage';
import MeetingsPage from './pages/MeetingsPage';
import RankingPage from './pages/RankingPage';
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
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const unsubscribe = subscribeCommunityData((snapshot) => {
      setMembers(snapshot.members);
      setMeetings(snapshot.meetings);
      setScoreLogs(snapshot.scoreLogs);
      setCommunityConfig(snapshot.communityConfig);
    });
    return () => unsubscribe();
  }, []);

  const currentUser = members.find((m) => m.uid === currentUserUid) || null;

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
      setActiveTab('home');
    }
  };

  const handleCompleteOnboarding = async (form, customUid) => {
    const newMember = await registerOnboardingMember(form, customUid);
    setCurrentUserUid(newMember.uid);
    saveCurrentUserUid(newMember.uid);
    setActiveTab('home');
  };

  const handleToggleApplyMeeting = async (meetingId) => {
    if (!currentUser) return;
    await toggleMeetingApplicant(meetingId, currentUser.uid);
  };

  const handleCreateMeeting = async (meetingInput) => {
    if (!currentUser) return;
    await createMeeting(currentUser.uid, meetingInput);
  };

  const handleSettleMeeting = async (meetingId, confirmedUids) => {
    await settleMeetingWithScores(
      meetingId,
      confirmedUids,
      members,
      meetings
    );
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
    setActiveTab('home');
  };

  if (!currentUser) {
    return (
      <LoginOnboardingPage
        members={members}
        onSelectExistingMember={(uid) => {
          setCurrentUserUid(uid);
          saveCurrentUserUid(uid);
          setActiveTab('home');
        }}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  return (
    <AppLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      currentUser={currentUser}
      members={members}
      onSwitchUser={handleSwitchUser}
      onResetDemoData={handleResetDemoData}
    >
      {activeTab === 'home' && (
        <HomePage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          communityConfig={communityConfig}
          onToggleApplyMeeting={handleToggleApplyMeeting}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'meetings' && (
        <MeetingsPage
          currentUser={currentUser}
          members={members}
          meetings={meetings}
          onToggleApplyMeeting={handleToggleApplyMeeting}
          onCreateMeeting={handleCreateMeeting}
          onSettleMeeting={handleSettleMeeting}
        />
      )}

      {activeTab === 'ranking' && (
        <RankingPage
          currentUser={currentUser}
          members={members}
          scoreLogs={scoreLogs}
        />
      )}

      {activeTab === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onLogout={() => handleSwitchUser('__LOGOUT__')}
        />
      )}

      {activeTab === 'admin' && isAdminRole(currentUser.role) && (
        <AdminPage
          members={members}
          communityConfig={communityConfig}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminAdjustEventScore={handleAdminAdjustEventScore}
          onAdminUpdateConfig={handleAdminUpdateConfig}
        />
      )}
    </AppLayout>
  );
}
