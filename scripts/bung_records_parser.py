#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
개선된 벙기록 문서 파서 (Bung Records Parser)
- 벙 제목 제약 완전 해제:
  - 제목 끝 글자 제한('벙/회/모' 등) 없음
  - 제목 내 띄어쓰기 자유롭게 허용 (예: "목포 본 벙", "대전 아침 식사 벙")
  - 제목 누락 시에도 안전하게 날짜 기준 기본 제목 부여 ("8월15일벙")
- 총 인원수 제약 완전 해제:
  - '총 20명', '총20명', '총 20 명', '20명' 모두 인식
  - 총 인원수 줄 누락 시 실제 참석자 수로 자동 산출
- 26년 8월 15일 목포 모임의 잔치님(및 참석자 20명) 파싱 누락 버그 완벽 수정
- 'people.py' 모듈이 없어도 단독 실행 가능 (있으면 people 모듈 사용)
"""

import sys
import codecs
import re
from datetime import datetime, timedelta

# Windows 콘솔 유니코드 인코딩 설정
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# people 모듈 로드 (없으면 내장 로직 폴백)
try:
    import people as pl
except ImportError:
    class FallbackPeople:
        @staticmethod
        def get_badge(score):
            """벙점수 구간별 뱃지 반환"""
            if score < 15: return ""
            if score < 30: return "🦓"
            if score < 50: return "🐎"
            if score < 78: return "🐴"
            if score < 100: return "🦄"
            
            hundreds = (score // 100) * 100
            remainder = score % 100
            
            base_badge = ""
            stars = score // 500
            if stars > 0:
                base_badge += "⭐️" * stars
                rem_500 = score % 500
                h_rem = rem_500 // 100
                if h_rem == 1: base_badge += "🥉"
                elif h_rem == 2: base_badge += "🥈"
                elif h_rem == 3: base_badge += "🥇"
                elif h_rem == 4: base_badge += "🏆"
            else:
                if hundreds == 100: base_badge = "🥉"
                elif hundreds == 200: base_badge = "🥈"
                elif hundreds == 300: base_badge = "🥇"
                elif hundreds == 400: base_badge = "🏆"
                
            sub_badge = ""
            if remainder >= 78: sub_badge = "🦄"
            elif remainder >= 50: sub_badge = "🐴"
            elif remainder >= 30: sub_badge = "🐎"
            elif remainder >= 15: sub_badge = "🦓"
            
            return f"{base_badge}{sub_badge}"

        @staticmethod
        def get_badge_level(bungcount):
            levels = [15, 30, 50, 78, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
            curr = 0
            for l in levels:
                if bungcount >= l:
                    curr = l
                else:
                    break
            return curr

        @staticmethod
        def get_vips_and_bans(vip_file, ban_file):
            vips = []
            bans = []
            try:
                with open(vip_file, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    vips = [line.strip() for line in f if line.strip()]
            except:
                pass
            try:
                with open(ban_file, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    bans = [line.strip() for line in f if line.strip()]
            except:
                pass
            return vips, bans

    pl = FallbackPeople()

welcome_title = "#️⃣ 벙기록 문서 #️⃣"

welcome_msg = """
2️⃣  벙점수 안내

1. 벙점수 : 거리 가산점이 부여된 벙참석수

다른 도의 벙에 참석할 경우 : 2점
해외 친구의 경우 1회 참석시 3점

서울 경기는 같은 지역, 남도 북도 같은 지역,
광역시도 해당 지역에 통합하여 계산합니다.

2. 금은동

15점 : 🦓 멈춰있는 얼룩말
30점 : 🐎 달리는 말
50점 : 🐴 대왕말
78점 : 🦄 유니콘
100점 : 🥉
200점 : 🥈
300점 : 🥇
400점 : 🏆
500점 : ⭐️
600점 : ⭐️🥉

계속 반복되며 500단위로 별이 하나씩 늘어남

예) 115점 🥉🦓
278점 🥈🦄
450점🏆🐴
"""

def welcome(count, bung, total):
    print(welcome_title)
    print(f"\n🔥 총 {count}회의 벙이 진행되었습니다.")
    if bung:
        print(f"🔥 마지막 벙 : {bung.month}월 {bung.day}일 {bung.locate}")

class UserBungRecords:
    def __init__(self, sname):
        self.sname = sname
        self.sday = datetime.now()
        self.bungcount = 0
        self.realcount = 0
        self.level = 0
        self.badges = {}
        self.days_from_first = {}
        self.days_from_prev = {}

    def print_all(self):
        if self.level == 0:
            return
        print(f"\n{self.sname} : {self.sday.strftime('%y.%m.%d')}")
        for k, v in self.days_from_first.items():
            buff = f"{pl.get_badge(k)} : {self.badges[k].strftime('%y.%m.%d')} --> "
            if k == 15:
                buff += f"{v}"
            else:
                buff += f"{v} ({self.days_from_prev[k]})"
            print(buff)

    def get_badges(self):
        for k, v in self.days_from_prev.items():
            yield self.sname, k, v

    def set_first_day(self, day, real=True):
        if real and day and day < self.sday:
            self.sday = day
            self.badges[0] = day

    def update_days(self, day, prev, curr):
        if not day or prev not in self.badges:
            return
        fdays = day - self.sday
        pdays = day - self.badges[prev]
        self.days_from_first[curr] = fdays.days
        self.days_from_prev[curr] = pdays.days

    def append_bung(self, day, count=1, real=True):
        self.set_first_day(day, real)
        if real: self.realcount += 1
        self.bungcount += count

        level = pl.get_badge_level(self.bungcount)
        if level > self.level:
            prev = self.level
            self.level = level
            self.badges[level] = day
            self.update_days(day, prev, level)
            return True
        return False

class BadgeList:
    def __init__(self, sname, level, days):
        self.sname = sname
        self.level = level
        self.days = days

    def __lt__(self, other):
        if self.level < other.level:
            return True
        elif self.level == other.level:
            return self.days < other.days
        return False

class Bungdata:
    def __init__(self, record_dict, vips, bans):
        """
        record_dict: {
            'header': {'year': 26, 'month': 8, 'day': 15, 'title': '목포본벙'},
            'attendees': ['승재2', '스캇2', ..., '잔치2', ...],
            'total': 20
        }
        """
        h = record_dict['header']
        self.year = h['year']
        self.month = h['month']
        self.day = h['day']
        self.locate = h['title']
        self.total = record_dict['total']
        self.vips = vips
        self.bans = bans

        # 이벤트 타입 자동 분류
        # 0: 점수만(개근상/이벤트), 1: 일반 모임, 2: 벙주 없는 모임(결혼식/조문)
        if any(self.locate.endswith(s) for s in ["문", "식"]):
            self.event_type = 2
        elif any(self.locate.endswith(s) for s in ["상", "트"]):
            self.event_type = 0
        else:
            self.event_type = 1

        self.people = {}
        for raw_name in record_dict['attendees']:
            name = re.sub(r'[0-9]', '', raw_name)
            pts_str = re.sub(r'[^0-9]', '', raw_name)
            pts = int(pts_str) if pts_str else 1
            if name:
                self.people[name] = pts

        if self.total == 0:
            self.total = len(self.people)

        try:
            full_year = 2000 + self.year if self.year < 100 else self.year
            self.datetime = datetime(full_year, self.month, self.day, 17)
        except:
            self.datetime = datetime.now()

def print_badge(badges):
    blist = []
    print("\n🔥 뱃지 획득일 순위")
    for b in badges.values():
        for n, k, v in b.get_badges():
            blist.append(BadgeList(n, k, v))
    blist.sort()

    level = 0
    rank = 0
    buff = ""
    for b in blist:
        if level < b.level:
            rank = 1
            level = b.level
            buff += f"\n{pl.get_badge(level)}\n"
        if rank < 10:
            buff += f" {rank} {b.sname}({b.days}일),"
            if rank in [3, 6]:
                buff += "\n"
        rank += 1
    print(buff)

def print_records(users1, users2):
    u1 = dict(sorted(users1.items(), key=lambda x: x[1], reverse=True))
    buff = ""
    cur = 0

    print("\n1️⃣  개인별 벙기록")
    print("\n벙점수 : 이름(실제 벙참석 횟수)")
    print("괄호의 점수는 벙점수와 실제 참석한 수가 다른 경우만 표시됨\n")

    for n, v in u1.items():
        if cur != v:
            if buff: print(buff)
            bg = pl.get_badge(v)
            buff = f"{v:2d} {bg}: {n}"
            cur = v
        else:
            buff += f" {n}"

        bung = users2.get(n, 0)
        if v != 1 and v != bung:
            buff += f"({bung})"

    if buff:
        print(buff)

def save_month_records(users3, vips):
    u3 = dict(sorted(users3.items(), key=lambda x: x[1], reverse=True))
    buff = ""
    cur = 0

    print("\n🔥 이번달 벙점수\n")
    for n, v in u3.items():
        if not v or (vips and n not in vips):
            continue
        if cur != v:
            if buff: print(buff)
            buff = f"{v:2d} : {n}"
            cur = v
        else:
            buff += f" {n}"
    if buff:
        print(buff)
    print("")

def print_masters(users4, vips):
    u4 = dict(sorted(users4.items(), key=lambda x: x[1], reverse=True))
    buff = ""
    cur = 0

    print("🔥 누가 얼마나 벙을 쳤을까요?\n")
    for n, v in u4.items():
        if not v or (vips and n not in vips):
            continue
        if cur != v:
            if buff: print(buff)
            buff = f"{v:2d} : {n}"
            cur = v
        else:
            buff += f" {n}"
    if buff:
        print(buff)

def print_all_records(caps):
    print("3️⃣  전체 벙기록")
    buff = ""
    for c in caps:
        buff += f"\n{c.year}년{c.month}월{c.day}일 {c.locate}\n"
        people_line = []
        for k, v in c.people.items():
            if v > 1:
                people_line.append(f"{k}{v}")
            else:
                people_line.append(f"{k}")
        buff += f" {' '.join(people_line)}\n"
        buff += f" 총 {c.total}명\n"
    print(buff)

def get_data_from_file(katalk_path):
    """
    유연한 정규식 기반 파일 파서:
    - 벙 제목 제약 없음 (띄어쓰기 자유, 끝 글자 무관, 누락 시 자동 보정)
    - 총 인원수 표기 제약 없음 (총10명, 총 10명, 10명, 공백 무관)
    """
    with open(katalk_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
        lines = f.readlines()

    start_idx = 0
    for idx, l in enumerate(lines):
        if "전체 벙기록" in l:
            start_idx = idx + 1
            break

    records = []
    current_header = None
    current_attendees = []
    current_total = 0

    header_regex = re.compile(r'^\s*(\d{2,4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(.*)$')
    total_regex = re.compile(r'총\s*(\d+)\s*명|총\s*(\d+)|(\d+)\s*명')

    for i in range(start_idx, len(lines)):
        raw_line = lines[i].replace('\r', '').rstrip()
        trimmed = raw_line.strip()
        if not trimmed:
            continue

        h_match = header_regex.match(raw_line)
        # 날짜로 시작하고 들여쓰기 공백이 없는 줄은 새로운 벙의 헤더 라인
        if h_match and not raw_line.startswith(' ') and not raw_line.startswith('\t'):
            if current_header:
                records.append({
                    'header': current_header,
                    'attendees': current_attendees,
                    'total': current_total or len(current_attendees)
                })
                current_attendees = []
                current_total = 0

            y = int(h_match.group(1)) % 100
            m = int(h_match.group(2))
            d = int(h_match.group(3))
            title = h_match.group(4).strip()
            # 제목이 아예 없던 경우 자동 기본 제목 부여
            if not title:
                title = f"{m}월{d}일벙"

            current_header = {'year': y, 'month': m, 'day': d, 'title': title}
            continue

        # 총 인원수 라인 감지
        if "총" in trimmed or trimmed.endswith("명"):
            tot_match = total_regex.search(trimmed)
            if tot_match:
                for g in tot_match.groups():
                    if g:
                        current_total = int(g)
                        break
                continue

        # 참석자 명단 라인
        for tok in trimmed.split():
            c = tok.replace(',', '').replace('.', '').strip()
            if c and c != '총' and not c.endswith('명'):
                current_attendees.append(c)

    if current_header:
        records.append({
            'header': current_header,
            'attendees': current_attendees,
            'total': current_total or len(current_attendees)
        })

    return records

def main(filepath):
    caps = []
    users1 = {}
    users2 = {}
    users3 = {}
    users4 = {}
    badge = {}
    total = 0
    total_bung = 0

    now = datetime.now()
    year = int(now.strftime("%y"))

    vips, bans = pl.get_vips_and_bans("members.txt", "members_banned.txt")

    raw_records = get_data_from_file(filepath)
    for rec in raw_records:
        bung = Bungdata(rec, vips, bans)
        caps.append(bung)
        if bung.event_type:
            total_bung += 1
            total += bung.total

    for c in caps:
        y = c.year
        m = c.month

        if c.event_type == 1 and c.people:
            master = next(iter(c.people))
            users4[master] = users4.get(master, 0) + 1

        for n, v in c.people.items():
            if bans and n in bans:
                continue

            if n not in users1:
                users1[n] = 0
                users2[n] = 0
                users3[n] = 0

            users1[n] += v
            if c.event_type:
                users2[n] += 1

            if now.month == m and year == y:
                users3[n] += v

    rcaps = sorted(caps, key=lambda c: c.year * 10000 + c.month * 100 + c.day, reverse=False)
    for c in rcaps:
        for n, v in c.people.items():
            if bans and n in bans:
                continue
            if n not in badge:
                badge[n] = UserBungRecords(n)
            badge[n].append_bung(c.datetime, v, c.event_type)

    if caps:
        welcome(total_bung, caps[0], total)
    print_records(users1, users2)
    print_badge(badge)
    save_month_records(users3, vips)
    print_masters(users4, vips)
    print(welcome_msg)
    print_all_records(caps)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python bung_records_parser.py <벙기록문서.txt>")
        sys.exit(1)
    main(sys.argv[1])
