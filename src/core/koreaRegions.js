/**
 * 대한민국 전체 행정구역(시·군·구) 및 주요 생활권 데이터 모듈
 * 힐링78 커뮤니티 규격 닉네임 [이름(지역/결혼/성별)뱃지] 표준에 맞춘 숏네임 지원
 */

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export function getChosung(str) {
  let res = '';
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i) - 0xac00;
    if (code >= 0 && code <= 11171) {
      res += CHOSUNG_LIST[Math.floor(code / 588)];
    } else {
      res += str[i];
    }
  }
  return res;
}

/**
 * 전국 구·시·군 마스터 데이터
 * value: 닉네임 표기용 숏네임 (구/시/군 접미사 제거)
 * label: 전체 행정구역 명칭
 * province: 상위 시·도
 * aliases: 검색용 추가 키워드 (원래 구명, 생활권 등)
 */
export const KOREA_DISTRICTS = [
  // 1. 서울특별시 (25개 자치구)
  { value: '강남', label: '강남구', province: '서울', aliases: ['강남구', '서울'] },
  { value: '강동', label: '강동구', province: '서울', aliases: ['강동구', '서울'] },
  { value: '강북', label: '강북구', province: '서울', aliases: ['강북구', '서울', '미아', '수유'] },
  { value: '강서', label: '강서구', province: '서울', aliases: ['강서구', '서울', '화곡', '마곡'] },
  { value: '관악', label: '관악구', province: '서울', aliases: ['관악구', '서울', '신림', '봉천'] },
  { value: '광진', label: '광진구', province: '서울', aliases: ['광진구', '서울', '건대', '구의'] },
  { value: '구로', label: '구로구', province: '서울', aliases: ['구로구', '서울', '신도림'] },
  { value: '금천', label: '금천구', province: '서울', aliases: ['금천구', '서울', '가산'] },
  { value: '노원', label: '노원구', province: '서울', aliases: ['노원구', '서울', '상계', '중계'] },
  { value: '도봉', label: '도봉구', province: '서울', aliases: ['도봉구', '서울', '창동'] },
  { value: '동대문', label: '동대문구', province: '서울', aliases: ['동대문구', '서울', '청량리', '이문'] },
  { value: '동작', label: '동작구', province: '서울', aliases: ['동작구', '서울', '노량진', '사당'] },
  { value: '마포', label: '마포구', province: '서울', aliases: ['마포구', '서울', '홍대', '상암', '공덕'] },
  { value: '서대문', label: '서대문구', province: '서울', aliases: ['서대문구', '서울', '신촌'] },
  { value: '서초', label: '서초구', province: '서울', aliases: ['서초구', '서울', '양재', '반포'] },
  { value: '성동', label: '성동구', province: '서울', aliases: ['성동구', '서울', '성수', '왕십리'] },
  { value: '성북', label: '성북구', province: '서울', aliases: ['성북구', '서울', '길음', '성북동'] },
  { value: '송파', label: '송파구', province: '서울', aliases: ['송파구', '서울', '잠실', '문정'] },
  { value: '양천', label: '양천구', province: '서울', aliases: ['양천구', '서울', '목동'] },
  { value: '영등포', label: '영등포구', province: '서울', aliases: ['영등포구', '서울', '여의도', '문래'] },
  { value: '용산', label: '용산구', province: '서울', aliases: ['용산구', '서울', '이태원', '한남'] },
  { value: '은평', label: '은평구', province: '서울', aliases: ['은평구', '서울', '불광', '연신내'] },
  { value: '종로', label: '종로구', province: '서울', aliases: ['종로구', '서울', '혜화', '광화문'] },
  { value: '중구', label: '서울 중구', province: '서울', aliases: ['서울중구', '명동', '을지로'] },
  { value: '중랑', label: '중랑구', province: '서울', aliases: ['중랑구', '서울', '상봉'] },

  // 2. 경기도 (31개 시·군 및 주요 대표 생활권)
  { value: '수원', label: '수원시', province: '경기', aliases: ['수원시', '영통', '팔달', '권선', '장안'] },
  { value: '성남', label: '성남시', province: '경기', aliases: ['성남시', '수정', '중원'] },
  { value: '분당', label: '성남시 분당구', province: '경기', aliases: ['분당구', '성남'] },
  { value: '판교', label: '성남시 판교', province: '경기', aliases: ['판교동', '백현동', '성남'] },
  { value: '고양', label: '고양시', province: '경기', aliases: ['고양시', '덕양'] },
  { value: '일산', label: '고양시 일산', province: '경기', aliases: ['일산동구', '일산서구', '고양'] },
  { value: '용인', label: '용인시', province: '경기', aliases: ['용인시', '처인'] },
  { value: '수지', label: '용인시 수지구', province: '경기', aliases: ['수지구', '용인'] },
  { value: '기흥', label: '용인시 기흥구', province: '경기', aliases: ['기흥구', '용인'] },
  { value: '부천', label: '부천시', province: '경기', aliases: ['부천시', '원미', '소사', '오정'] },
  { value: '안산', label: '안산시', province: '경기', aliases: ['안산시', '단원', '상록'] },
  { value: '안양', label: '안양시', province: '경기', aliases: ['안양시', '동안', '만안', '평촌'] },
  { value: '평택', label: '평택시', province: '경기', aliases: ['평택시', '송탄'] },
  { value: '시흥', label: '시흥시', province: '경기', aliases: ['시흥시', '배곧'] },
  { value: '김포', label: '김포시', province: '경기', aliases: ['김포시', '한강신도시'] },
  { value: '파주', label: '파주시', province: '경기', aliases: ['파주시', '운정'] },
  { value: '의정부', label: '의정부시', province: '경기', aliases: ['의정부시'] },
  { value: '화성', label: '화성시', province: '경기', aliases: ['화성시', '봉담', '남양'] },
  { value: '동탄', label: '화성시 동탄', province: '경기', aliases: ['동탄신도시', '화성'] },
  { value: '광명', label: '광명시', province: '경기', aliases: ['광명시', '철산'] },
  { value: '하남', label: '하남시', province: '경기', aliases: ['하남시', '미사'] },
  { value: '군포', label: '군포시', province: '경기', aliases: ['군포시', '산본'] },
  { value: '남양주', label: '남양주시', province: '경기', aliases: ['남양주시', '다산', '별내'] },
  { value: '오산', label: '오산시', province: '경기', aliases: ['오산시'] },
  { value: '이천', label: '이천시', province: '경기', aliases: ['이천시'] },
  { value: '양주', label: '양주시', province: '경기', aliases: ['양주시', '옥정'] },
  { value: '구리', label: '구리시', province: '경기', aliases: ['구리시'] },
  { value: '안성', label: '안성시', province: '경기', aliases: ['안성시'] },
  { value: '포천', label: '포천시', province: '경기', aliases: ['포천시'] },
  { value: '의왕', label: '의왕시', province: '경기', aliases: ['의왕시', '인덕원'] },
  { value: '양평', label: '양평군', province: '경기', aliases: ['양평군'] },
  { value: '여주', label: '여주시', province: '경기', aliases: ['여주시'] },
  { value: '동두천', label: '동두천시', province: '경기', aliases: ['동두천시'] },
  { value: '가평', label: '가평군', province: '경기', aliases: ['가평군'] },
  { value: '과천', label: '과천시', province: '경기', aliases: ['과천시'] },
  { value: '연천', label: '연천군', province: '경기', aliases: ['연천군'] },

  // 3. 인천광역시
  { value: '인천', label: '인천광역시', province: '인천', aliases: ['인천시'] },
  { value: '부평', label: '인천 부평구', province: '인천', aliases: ['부평구', '인천'] },
  { value: '연수', label: '인천 연수구', province: '인천', aliases: ['연수구', '인천'] },
  { value: '송도', label: '인천 송도', province: '인천', aliases: ['송도국제도시', '인천'] },
  { value: '남동', label: '인천 남동구', province: '인천', aliases: ['남동구', '인천', '구월'] },
  { value: '계양', label: '인천 계양구', province: '인천', aliases: ['계양구', '인천', '계산'] },
  { value: '미추홀', label: '인천 미추홀구', province: '인천', aliases: ['미추홀구', '인천', '주안'] },
  { value: '인천서구', label: '인천 서구', province: '인천', aliases: ['서구', '인천', '청라', '검단'] },
  { value: '인천중구', label: '인천 중구', province: '인천', aliases: ['중구', '인천', '영종'] },
  { value: '인천동구', label: '인천 동구', province: '인천', aliases: ['동구', '인천'] },
  { value: '강화', label: '강화군', province: '인천', aliases: ['강화군', '인천'] },
  { value: '옹진', label: '옹진군', province: '인천', aliases: ['옹진군', '인천'] },

  // 4. 대전광역시 & 세종특별자치시
  { value: '대전', label: '대전광역시', province: '대전', aliases: ['대전시'] },
  { value: '유성', label: '대전 유성구', province: '대전', aliases: ['유성구', '대전'] },
  { value: '대전서구', label: '대전 서구', province: '대전', aliases: ['서구', '대전', '둔산'] },
  { value: '대전중구', label: '대전 중구', province: '대전', aliases: ['중구', '대전'] },
  { value: '대전동구', label: '대전 동구', province: '대전', aliases: ['동구', '대전'] },
  { value: '대덕', label: '대전 대덕구', province: '대전', aliases: ['대덕구', '대전', '신탄진'] },
  { value: '세종', label: '세종특별자치시', province: '세종', aliases: ['세종시', '조치원'] },

  // 5. 충청남도 & 충청북도
  { value: '천안', label: '천안시', province: '충남', aliases: ['천안시', '서북', '동남'] },
  { value: '아산', label: '아산시', province: '충남', aliases: ['아산시', '배방', '탕정'] },
  { value: '청주', label: '청주시', province: '충북', aliases: ['청주시', '흥덕', '상당', '청원', '서원'] },
  { value: '충주', label: '충주시', province: '충북', aliases: ['충주시'] },
  { value: '제천', label: '제천시', province: '충북', aliases: ['제천시'] },
  { value: '서산', label: '서산시', province: '충남', aliases: ['서산시'] },
  { value: '당진', label: '당진시', province: '충남', aliases: ['당진시'] },
  { value: '공주', label: '공주시', province: '충남', aliases: ['공주시'] },
  { value: '보령', label: '보령시', province: '충남', aliases: ['보령시', '대천'] },
  { value: '논산', label: '논산시', province: '충남', aliases: ['논산시'] },
  { value: '홍성', label: '홍성군', province: '충남', aliases: ['홍성군', '내포'] },
  { value: '예산', label: '예산군', province: '충남', aliases: ['예산군'] },
  { value: '진천', label: '진천군', province: '충북', aliases: ['진천군', '혁신도시'] },
  { value: '음성', label: '음성군', province: '충북', aliases: ['음성군'] },
  { value: '계룡', label: '계룡시', province: '충남', aliases: ['계룡시'] },
  { value: '부여', label: '부여군', province: '충남', aliases: ['부여군'] },
  { value: '금산', label: '금산군', province: '충남', aliases: ['금산군'] },
  { value: '태안', label: '태안군', province: '충남', aliases: ['태안군', '안면도'] },
  { value: '서천', label: '서천군', province: '충남', aliases: ['서천군'] },
  { value: '청양', label: '청양군', province: '충남', aliases: ['청양군'] },
  { value: '옥천', label: '옥천군', province: '충북', aliases: ['옥천군'] },
  { value: '영동', label: '영동군', province: '충북', aliases: ['영동군'] },
  { value: '증평', label: '증평군', province: '충북', aliases: ['증평군'] },
  { value: '괴산', label: '괴산군', province: '충북', aliases: ['괴산군'] },
  { value: '보은', label: '보은군', province: '충북', aliases: ['보은군'] },
  { value: '단양', label: '단양군', province: '충북', aliases: ['단양군'] },

  // 6. 강원특별자치도
  { value: '춘천', label: '춘천시', province: '강원', aliases: ['춘천시'] },
  { value: '원주', label: '원주시', province: '강원', aliases: ['원주시'] },
  { value: '강릉', label: '강릉시', province: '강원', aliases: ['강릉시'] },
  { value: '속초', label: '속초시', province: '강원', aliases: ['속초시'] },
  { value: '동해', label: '동해시', province: '강원', aliases: ['동해시'] },
  { value: '삼척', label: '삼척시', province: '강원', aliases: ['삼척시'] },
  { value: '태백', label: '태백시', province: '강원', aliases: ['태백시'] },
  { value: '홍천', label: '홍천군', province: '강원', aliases: ['홍천군'] },
  { value: '횡성', label: '횡성군', province: '강원', aliases: ['횡성군'] },
  { value: '평창', label: '평창군', province: '강원', aliases: ['평창군'] },
  { value: '영월', label: '영월군', province: '강원', aliases: ['영월군'] },
  { value: '정선', label: '정선군', province: '강원', aliases: ['정선군'] },
  { value: '철원', label: '철원군', province: '강원', aliases: ['철원군'] },
  { value: '화천', label: '화천군', province: '강원', aliases: ['화천군'] },
  { value: '양구', label: '양구군', province: '강원', aliases: ['양구군'] },
  { value: '인제', label: '인제군', province: '강원', aliases: ['인제군'] },
  { value: '고성', label: '고성군 (강원)', province: '강원', aliases: ['강원고성'] },
  { value: '양양', label: '양양군', province: '강원', aliases: ['양양군'] },

  // 7. 대구광역시 & 경상북도
  { value: '대구', label: '대구광역시', province: '대구', aliases: ['대구시'] },
  { value: '수성', label: '대구 수성구', province: '대구', aliases: ['수성구', '대구'] },
  { value: '달서', label: '대구 달서구', province: '대구', aliases: ['달서구', '대구'] },
  { value: '대구중구', label: '대구 중구', province: '대구', aliases: ['중구', '대구', '동성로'] },
  { value: '대구동구', label: '대구 동구', province: '대구', aliases: ['동구', '대구'] },
  { value: '대구서구', label: '대구 서구', province: '대구', aliases: ['서구', '대구'] },
  { value: '대구남구', label: '대구 남구', province: '대구', aliases: ['남구', '대구'] },
  { value: '대구북구', label: '대구 북구', province: '대구', aliases: ['북구', '대구'] },
  { value: '달성', label: '대구 달성군', province: '대구', aliases: ['달성군', '대구', '현풍'] },
  { value: '군위', label: '대구 군위군', province: '대구', aliases: ['군위군', '대구'] },
  { value: '포항', label: '포항시', province: '경북', aliases: ['포항시', '남구', '북구'] },
  { value: '구미', label: '구미시', province: '경북', aliases: ['구미시'] },
  { value: '경주', label: '경주시', province: '경북', aliases: ['경주시'] },
  { value: '안동', label: '안동시', province: '경북', aliases: ['안동시', '도청'] },
  { value: '김천', label: '김천시', province: '경북', aliases: ['김천시'] },
  { value: '경산', label: '경산시', province: '경북', aliases: ['경산시'] },
  { value: '영주', label: '영주시', province: '경북', aliases: ['영주시'] },
  { value: '영천', label: '영천시', province: '경북', aliases: ['영천시'] },
  { value: '상주', label: '상주시', province: '경북', aliases: ['상주시'] },
  { value: '문경', label: '문경시', province: '경북', aliases: ['문경시'] },
  { value: '칠곡', label: '칠곡군', province: '경북', aliases: ['칠곡군', '왜관'] },
  { value: '의성', label: '의성군', province: '경북', aliases: ['의성군'] },
  { value: '청도', label: '청도군', province: '경북', aliases: ['청도군'] },
  { value: '고령', label: '고령군', province: '경북', aliases: ['고령군'] },
  { value: '성주', label: '성주군', province: '경북', aliases: ['성주군'] },
  { value: '예천', label: '예천군', province: '경북', aliases: ['예천군'] },
  { value: '봉화', label: '봉화군', province: '경북', aliases: ['봉화군'] },
  { value: '울진', label: '울진군', province: '경북', aliases: ['울진군'] },
  { value: '울릉', label: '울릉군', province: '경북', aliases: ['울릉군', '독도'] },
  { value: '영덕', label: '영덕군', province: '경북', aliases: ['영덕군'] },
  { value: '청송', label: '청송군', province: '경북', aliases: ['청송군'] },
  { value: '영양', label: '영양군', province: '경북', aliases: ['영양군'] },

  // 8. 부산광역시 & 울산광역시 & 경상남도
  { value: '부산', label: '부산광역시', province: '부산', aliases: ['부산시'] },
  { value: '해운대', label: '부산 해운대구', province: '부산', aliases: ['해운대구', '부산', '센텀'] },
  { value: '부산진', label: '부산 부산진구', province: '부산', aliases: ['부산진구', '서면', '부산'] },
  { value: '동래', label: '부산 동래구', province: '부산', aliases: ['동래구', '부산'] },
  { value: '수영', label: '부산 수영구', province: '부산', aliases: ['수영구', '광안리', '부산'] },
  { value: '남구(부산)', label: '부산 남구', province: '부산', aliases: ['부산남구', '대연'] },
  { value: '북구(부산)', label: '부산 북구', province: '부산', aliases: ['부산북구', '화명', '덕천'] },
  { value: '금정', label: '부산 금정구', province: '부산', aliases: ['금정구', '부산대'] },
  { value: '사하', label: '부산 사하구', province: '부산', aliases: ['사하구', '하단'] },
  { value: '사상', label: '부산 사상구', province: '부산', aliases: ['사상구'] },
  { value: '연제', label: '부산 연제구', province: '부산', aliases: ['연제구', '연산'] },
  { value: '기장', label: '부산 기장군', province: '부산', aliases: ['기장군', '정관', '일광'] },
  { value: '강서(부산)', label: '부산 강서구', province: '부산', aliases: ['부산강서구', '명지'] },
  { value: '영도', label: '부산 영도구', province: '부산', aliases: ['영도구'] },
  { value: '중구(부산)', label: '부산 중구', province: '부산', aliases: ['부산중구', '남포'] },
  { value: '서구(부산)', label: '부산 서구', province: '부산', aliases: ['부산서구', '송도'] },
  { value: '동구(부산)', label: '부산 동구', province: '부산', aliases: ['부산동구', '부산역'] },
  { value: '울산', label: '울산광역시', province: '울산', aliases: ['울산시', '삼산'] },
  { value: '울주', label: '울산 울주군', province: '울산', aliases: ['울주군', '언양'] },
  { value: '남구(울산)', label: '울산 남구', province: '울산', aliases: ['울산남구'] },
  { value: '중구(울산)', label: '울산 중구', province: '울산', aliases: ['울산중구'] },
  { value: '동구(울산)', label: '울산 동구', province: '울산', aliases: ['울산동구', '방어진'] },
  { value: '북구(울산)', label: '울산 북구', province: '울산', aliases: ['울산북구'] },
  { value: '창원', label: '창원시', province: '경남', aliases: ['창원시', '의창', '성산'] },
  { value: '마산', label: '창원시 마산', province: '경남', aliases: ['마산합포', '마산회원', '창원'] },
  { value: '진해', label: '창원시 진해', province: '경남', aliases: ['진해구', '창원'] },
  { value: '김해', label: '김해시', province: '경남', aliases: ['김해시', '율하', '장유'] },
  { value: '양산', label: '양산시', province: '경남', aliases: ['양산시', '물금'] },
  { value: '진주', label: '진주시', province: '경남', aliases: ['진주시', '혁신'] },
  { value: '거제', label: '거제시', province: '경남', aliases: ['거제시'] },
  { value: '통영', label: '통영시', province: '경남', aliases: ['통영시'] },
  { value: '사천', label: '사천시', province: '경남', aliases: ['사천시', '삼천포'] },
  { value: '밀양', label: '밀양시', province: '경남', aliases: ['밀양시'] },
  { value: '거창', label: '거창군', province: '경남', aliases: ['거창군'] },
  { value: '함안', label: '함안군', province: '경남', aliases: ['함안군'] },
  { value: '창녕', label: '창녕군', province: '경남', aliases: ['창녕군'] },
  { value: '고성(경남)', label: '고성군 (경남)', province: '경남', aliases: ['경남고성'] },
  { value: '하동', label: '하동군', province: '경남', aliases: ['하동군'] },
  { value: '남해', label: '남해군', province: '경남', aliases: ['남해군'] },
  { value: '합천', label: '합천군', province: '경남', aliases: ['합천군'] },
  { value: '산청', label: '산청군', province: '경남', aliases: ['산청군'] },
  { value: '함양', label: '함양군', province: '경남', aliases: ['함양군'] },
  { value: '의령', label: '의령군', province: '경남', aliases: ['의령군'] },

  // 9. 광주광역시 & 전라남도 & 전북특별자치도
  { value: '광주', label: '광주광역시', province: '광주', aliases: ['광주시', '상무'] },
  { value: '광산', label: '광주 광산구', province: '광주', aliases: ['광산구', '광주', '수완'] },
  { value: '수완', label: '광주 수완지구', province: '광주', aliases: ['수완동', '광산', '광주'] },
  { value: '광주서구', label: '광주 서구', province: '광주', aliases: ['서구', '광주', '치평', '풍암'] },
  { value: '광주북구', label: '광주 북구', province: '광주', aliases: ['북구', '광주', '용봉', '일곡'] },
  { value: '광주남구', label: '광주 남구', province: '광주', aliases: ['남구', '광주', '봉선'] },
  { value: '광주동구', label: '광주 동구', province: '광주', aliases: ['동구', '광주', '충장로'] },
  { value: '전주', label: '전주시', province: '전북', aliases: ['전주시', '완산', '덕진', '에코'] },
  { value: '군산', label: '군산시', province: '전북', aliases: ['군산시'] },
  { value: '익산', label: '익산시', province: '전북', aliases: ['익산시'] },
  { value: '정읍', label: '정읍시', province: '전북', aliases: ['정읍시'] },
  { value: '남원', label: '남원시', province: '전북', aliases: ['남원시'] },
  { value: '김제', label: '김제시', province: '전북', aliases: ['김제시'] },
  { value: '완주', label: '완주군', province: '전북', aliases: ['완주군', '봉동'] },
  { value: '부안', label: '부안군', province: '전북', aliases: ['부안군'] },
  { value: '고창', label: '고창군', province: '전북', aliases: ['고창군'] },
  { value: '순창', label: '순창군', province: '전북', aliases: ['순창군'] },
  { value: '임실', label: '임실군', province: '전북', aliases: ['임실군'] },
  { value: '진안', label: '진안군', province: '전북', aliases: ['진안군'] },
  { value: '무주', label: '무주군', province: '전북', aliases: ['무주군'] },
  { value: '장수', label: '장수군', province: '전북', aliases: ['장수군'] },
  { value: '여수', label: '여수시', province: '전남', aliases: ['여수시', '돌산'] },
  { value: '순천', label: '순천시', province: '전남', aliases: ['순천시', '신대'] },
  { value: '목포', label: '목포시', province: '전남', aliases: ['목포시', '하당', '남악'] },
  { value: '광양', label: '광양시', province: '전남', aliases: ['광양시', '중마'] },
  { value: '나주', label: '나주시', province: '전남', aliases: ['나주시', '빛가람', '혁신'] },
  { value: '무안', label: '무안군', province: '전남', aliases: ['무안군', '남악'] },
  { value: '해남', label: '해남군', province: '전남', aliases: ['해남군'] },
  { value: '화순', label: '화순군', province: '전남', aliases: ['화순군'] },
  { value: '담양', label: '담양군', province: '전남', aliases: ['담양군'] },
  { value: '영암', label: '영암군', province: '전남', aliases: ['영암군', '삼호'] },
  { value: '영광', label: '영광군', province: '전남', aliases: ['영광군'] },
  { value: '완도', label: '완도군', province: '전남', aliases: ['완도군'] },
  { value: '진도', label: '진도군', province: '전남', aliases: ['진도군'] },
  { value: '신안', label: '신안군', province: '전남', aliases: ['신안군'] },
  { value: '장성', label: '장성군', province: '전남', aliases: ['장성군'] },
  { value: '고흥', label: '고흥군', province: '전남', aliases: ['고흥군', '나로도'] },
  { value: '보성', label: '보성군', province: '전남', aliases: ['보성군'] },
  { value: '강진', label: '강진군', province: '전남', aliases: ['강진군'] },
  { value: '장흥', label: '장흥군', province: '전남', aliases: ['장흥군'] },
  { value: '함평', label: '함평군', province: '전남', aliases: ['함평군'] },
  { value: '곡성', label: '곡성군', province: '전남', aliases: ['곡성군'] },
  { value: '구례', label: '구례군', province: '전남', aliases: ['구례군'] },

  // 10. 제주특별자치도 & 기타
  { value: '제주', label: '제주시', province: '제주', aliases: ['제주시', '노형', '연동'] },
  { value: '서귀포', label: '서귀포시', province: '제주', aliases: ['서귀포시', '중문'] },
  { value: '해외', label: '해외', province: '해외', aliases: ['해외', '글로벌'] }
];

/**
 * 자주 사용되는 핫스팟 퀵 칩 리스트
 * 힐링78 회원들이 가장 많이 거주/활동하는 대표 거점 18개
 */
export const HOTSPOT_REGIONS = [
  '강남', '마포', '송파', '영등포', '용산', '강서',
  '수원', '분당', '일산', '부천', '안양', '인천',
  '부평', '대전', '대구', '부산', '해운대', '광주'
];

/**
 * 키워드 및 초성 검색 함수
 * @param {string} query 검색어 (예: '강', '강남', 'ㄱㄴ', '수원')
 * @param {number} limit 최대 반환 개수 (기본 8개)
 * @returns {Array} 매칭된 지역 목록
 */
export function searchKoreaRegions(query, limit = 8) {
  const clean = String(query || '').trim().toLowerCase();
  if (!clean) return [];

  const queryChosung = getChosung(clean);
  const isChosungOnly = /^[ㄱ-ㅎ]+$/.test(clean);

  const scored = [];

  for (const item of KOREA_DISTRICTS) {
    const val = item.value.toLowerCase();
    const lbl = item.label.toLowerCase();
    const prov = item.province.toLowerCase();
    const valChosung = getChosung(val);
    const lblChosung = getChosung(lbl);

    let score = 0;

    if (val === clean) {
      score = 100;
    } else if (val.startsWith(clean)) {
      score = 80;
    } else if (val.includes(clean)) {
      score = 60;
    } else if (lbl.includes(clean) || prov.includes(clean)) {
      score = 40;
    } else if (item.aliases && item.aliases.some((a) => a.toLowerCase().includes(clean))) {
      score = 30;
    } else if (isChosungOnly) {
      if (valChosung.startsWith(queryChosung)) {
        score = 50;
      } else if (valChosung.includes(queryChosung) || lblChosung.includes(queryChosung)) {
        score = 30;
      }
    }

    if (score > 0) {
      scored.push({ ...item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
