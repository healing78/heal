import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import {
  calculateMeetingScoreForMember,
  isAdminRole
} from './core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCORE_LOGS
} from './core/initialData';
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

  // Default logged-in user for immediate preview; null shows Login / Onboarding page
  const [currentUserUid, setCurrentUserUid] = useState('kakao:1001');
  const [activeTab, setActiveTab] = useState('home');

  const currentUser = members.find((m) => m.uid === currentUserUid) || null;

  const handleSwitchUser = (uid) => {
    if (uid === '__LOGOUT__') {
      setCurrentUserUid(null);
      return;
    }
    setCurrentUserUid(uid);
    const nextUser = members.find((m) => m.uid === uid);
    if (activeTab === 'admin' && (!nextUser || !isAdminRole(nextUser.role))) {
      setActiveTab('home');
    }
  };

  // Complete Onboarding for a new member -> immediately registers as 'Member' (0 attendance)
  const handleCompleteOnboarding = (form) => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const newUid = `kakao:${Date.now()}`;

    const newMember = {
      uid: newUid,
      realName: form.realName.trim(),
      city: form.city.trim(),
      homeCity: (form.homeCity || form.city).trim(),
      maritalStatus: form.maritalStatus,
      gender: form.gender,
      role: 'Member',
      entryBadge: `${mm}${dd}`,
      customBadge: '',
      attendanceCount: 0,
      baseScore: 0,
      expeditionScore: 0,
      eventScore: 0,
      totalScore: 0,
      monthlyScore: 0
    };

    setMembers((prev) => [...prev, newMember]);
    setCurrentUserUid(newUid);
    setActiveTab('home');
  };

  // Toggle meeting attendance application
  const handleToggleApplyMeeting = (meetingId) => {
    if (!currentUser) return;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId || m.status !== 'open') return m;
        const exists = m.applicants.includes(currentUser.uid);
        const nextApplicants = exists
          ? m.applicants.filter((id) => id !== currentUser.uid)
          : [...m.applicants, currentUser.uid];
        return { ...m, applicants: nextApplicants };
      })
    );
  };

  // Create a new meeting (requires attendanceCount >= 1 or admin)
  const handleCreateMeeting = (meetingInput) => {
    if (!currentUser) return;
    const created = {
      id: `mtg-${Date.now()}`,
      title: meetingInput.title,
      date: meetingInput.date,
      location: meetingInput.location,
      placeDetail: meetingInput.placeDetail,
      hostUid: currentUser.uid,
      type: meetingInput.type,
      status: 'open',
      applicants: [currentUser.uid],
      confirmedParticipants: [],
      description: meetingInput.description
    };
    setMeetings((prev) => [created, ...prev]);
  };

  // Settle a meeting (Host or Admin confirms actual participants & awards points)
  const handleSettleMeeting = (meetingId, confirmedUids) => {
    const targetMeeting = meetings.find((m) => m.id === meetingId);
    if (!targetMeeting || targetMeeting.status === 'settled') return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newLogs = [];

    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        if (!confirmedUids.includes(member.uid)) return member;
        const calc = calculateMeetingScoreForMember(
          member,
          targetMeeting.location
        );
        newLogs.push({
          id: `log-${Date.now()}-${member.uid}`,
          uid: member.uid,
          type: 'meeting',
          title: `${targetMeeting.title} 참석 확정${
            calc.isExpedition
              ? ` (${member.homeCity}→${targetMeeting.location} 원정)`
              : ''
          }`,
          baseDelta: calc.base,
          expeditionDelta: calc.expedition,
          eventDelta: 0,
          totalDelta: calc.total,
          date: todayStr
        });

        return {
          ...member,
          attendanceCount: member.attendanceCount + 1,
          baseScore: member.baseScore + calc.base,
          expeditionScore: member.expeditionScore + calc.expedition,
          totalScore: member.totalScore + calc.total,
          monthlyScore: (member.monthlyScore || 0) + calc.total
        };
      })
    );

    setMeetings((prevMeetings) =>
      prevMeetings.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: 'settled',
              confirmedParticipants: confirmedUids
            }
          : m
      )
    );

    if (newLogs.length > 0) {
      setScoreLogs((prev) => [...newLogs, ...prev]);
    }
  };

  // Update my profile in My Info page
  const handleUpdateProfile = (updatedFields) => {
    if (!currentUser) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.uid === currentUser.uid ? { ...m, ...updatedFields } : m
      )
    );
  };

  // Admin: update member role or custom badge
  const handleAdminUpdateMember = (targetUid, patch) => {
    setMembers((prev) =>
      prev.map((m) => (m.uid === targetUid ? { ...m, ...patch } : m))
    );
  };

  // Admin: manual event score adjustment
  const handleAdminAdjustEventScore = (targetUid, delta, reason) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setMembers((prev) =>
      prev.map((m) =>
        m.uid === targetUid
          ? {
              ...m,
              eventScore: m.eventScore + delta,
              totalScore: m.totalScore + delta,
              monthlyScore: (m.monthlyScore || 0) + delta
            }
          : m
      )
    );
    setScoreLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        uid: targetUid,
        type: 'event',
        title: `[운영진 이벤트] ${reason}`,
        baseDelta: 0,
        expeditionDelta: 0,
        eventDelta: delta,
        totalDelta: delta,
        date: todayStr
      },
      ...prev
    ]);
  };

  if (!currentUser) {
    return (
      <LoginOnboardingPage
        members={members}
        onSelectExistingMember={(uid) => {
          setCurrentUserUid(uid);
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
          onLogout={() => setCurrentUserUid(null)}
        />
      )}

      {activeTab === 'admin' && isAdminRole(currentUser.role) && (
        <AdminPage
          members={members}
          communityConfig={communityConfig}
          onAdminUpdateMember={handleAdminUpdateMember}
          onAdminAdjustEventScore={handleAdminAdjustEventScore}
          onAdminUpdateConfig={setCommunityConfig}
        />
      )}
    </AppLayout>
  );
}
