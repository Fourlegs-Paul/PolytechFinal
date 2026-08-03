# PolytechFinal

한국폴리텍대학 AI Agent Engineering 수업의 최종 요약이자, 수업 후에도 계속 사용하는 종합 실전 지침서입니다.

메인 페이지는 에이전트 개념, MD 하네스, 프로젝트 기억, 개발 루프, 전체 커리큘럼, 프롬프트 키트, 장애 진단표, 공식 문서 아틀라스와 학생 결과물을 연결합니다. `guide.html`은 API·Postman·Agentria·GitHub·Supabase·Google Cloud·Vercel을 실제 설정 순서대로 안내합니다.

## 프로젝트 루트

현재 실제 프로젝트는 다음 최하단 폴더입니다.

```text
H:\Codex\PolytechFinal\PolytechFinal\PolytechFinal
```

## 실행

Windows에서 `start.bat`을 더블클릭하거나 아래 명령을 실행합니다.

```powershell
cd H:\Codex\PolytechFinal\PolytechFinal\PolytechFinal
node server.js --open
```

## 서비스 연결 가이드

`guide.html`은 “오늘뭐먹지”라는 하나의 현실적인 앱을 예제로 사용합니다. Google 로그인 → 네이버에서 “성수동 파스타” 검색 → Supabase 즐겨찾기 저장 → GitHub push → Vercel 배포를 따라가며 API, Postman, Agentria와 플랫폼 설정을 설명합니다.

- 메인 상단 메뉴의 `Guide`에서 이동
- Next.js/Vite 환경변수 예시 전환 및 복사
- Supabase publishable/secret 키 보안 구분
- 노션 수업 원문과 최신 공식 문서 링크
- 메인 페이지와 가이드에서 노션 ①~⑦ 전체 수업 원문 연결

## 환경변수 보안 원칙

- 실제 API 키, 데이터베이스 비밀번호, secret은 프로젝트 루트의 `.env.local`에 저장합니다.
- `.env.local`은 `.gitignore`로 제외하여 GitHub에 커밋하거나 공유하지 않습니다.
- GitHub에는 실제 값이 없는 `.env.example`만 올려 필요한 변수 이름을 안내합니다.
- Vercel에는 `.env.local`과 동일한 변수 이름으로 값을 별도 등록합니다.
- 키가 이미 Git에 올라갔다면 파일을 지우는 것만으로 부족하며 해당 키를 즉시 폐기하고 재발급해야 합니다.

브라우저 주소는 `http://localhost:4173`입니다. Node.js 외 별도 패키지는 필요하지 않습니다.

## 구성

```text
index.html       화면 콘텐츠와 구조
styles.css       디자인, 반응형, 애니메이션
script.js        탭, 복사, 스크롤 연출, 학생 작품 표시
gsap.min.js      GSAP 애니메이션 엔진
ScrollTrigger.min.js  스크롤 기반 장면 제어
student-projects.json 네이버 게시글에서 추출한 작품·반응·댓글 피드
NAVER_SYNC.md   게시판 수집 범위와 안전한 갱신 절차
server.js        의존성 없는 로컬 웹서버
start.bat        Windows 실행 파일
```

GSAP과 ScrollTrigger는 프로젝트에 포함되어 있어 오프라인에서도 작동합니다.

## 네이버 카페 결과물 게시판 동기화

수집 원본은 `결과물 자랑하기` 메뉴(`cafes/31752795/menus/7`)입니다. 2026-08-03 00:00 이후 작성된 모든 게시글을 대상으로 글 제목, 본문 텍스트, 본문 링크의 표시 문자열과 실제 `href`에서 `*.vercel.app` 주소를 찾습니다. 주소를 제목에만 적은 글도 작품으로 포함합니다.

`student-projects.json`에는 작성자, 글 제목, 작성일, 조회수, 좋아요, 댓글 수, 공개 댓글 일부, 게시글 URL과 Vercel 작품 URL을 저장합니다. 작품 화면은 외부 썸네일 서비스로 최신 대표 이미지를 요청합니다.

일반 웹앱은 브라우저의 동일 출처 정책과 네이버 로그인 쿠키 보호 때문에 사용자가 열어 둔 다른 네이버 탭을 읽을 수 없습니다. 실제 재수집은 로그인된 운영자 브라우저에서 수행하며 로그인 쿠키는 파일이나 Vercel에 저장하지 않습니다. 메인 페이지의 새로고침 버튼은 배포된 최신 JSON과 작품 스크린샷만 다시 읽습니다.

```json
{
  "source": "naver-cafe-menu-browser-sync",
  "fromDate": "2026-08-03",
  "updatedAt": "2026-08-03T14:00:00+09:00",
  "projects": [
    {
      "author": "카페 닉네임",
      "title": "게시글 제목",
      "publishedAt": "2026-08-03T15:00:00+09:00",
      "url": "https://student-project.vercel.app/",
      "articleUrl": "네이버 게시글 주소",
      "summary": "본문에서 확인한 프로젝트 설명",
      "views": 12,
      "likes": 3,
      "commentCount": 1,
      "comments": [{ "author": "댓글 작성자", "text": "공개 댓글" }]
    }
  ]
}
```

공개 배포 전에는 작성자 닉네임과 개인정보 노출 여부를 반드시 확인하세요.
