# PolytechFinal

한국폴리텍대학 AI Agent Engineering 수업의 최종 요약 웹페이지입니다.

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

`guide.html`은 Vercel, Supabase, Google Cloud Console을 처음 로그인하는 단계부터 프로젝트 생성, 환경변수 배치, Google OAuth 연결, 최종 검증까지 설명하는 별도 메뉴입니다.

- 메인 상단 메뉴의 `Guide`에서 이동
- Next.js/Vite 환경변수 예시 전환 및 복사
- Supabase publishable/secret 키 보안 구분
- 노션 수업 원문과 최신 공식 문서 링크

브라우저 주소는 `http://localhost:4173`입니다. Node.js 외 별도 패키지는 필요하지 않습니다.

## 구성

```text
index.html       화면 콘텐츠와 구조
styles.css       디자인, 반응형, 애니메이션
script.js        탭, 복사, 스크롤 연출, 댓글 표시
gsap.min.js      GSAP 애니메이션 엔진
ScrollTrigger.min.js  스크롤 기반 장면 제어
comments.json    네이버 카페 댓글 로컬 동기화 결과
server.js        의존성 없는 로컬 웹서버
start.bat        Windows 실행 파일
```

GSAP과 ScrollTrigger는 프로젝트에 포함되어 있어 오프라인에서도 작동합니다.

## 네이버 카페 댓글 표시

페이지가 로그인 정보나 네이버 쿠키를 직접 저장하지 않습니다. 로그인된 브라우저에서 사용자가 지정한 게시글의 댓글을 수집한 뒤 `comments.json`에 저장하는 반자동 방식을 사용합니다.

```json
{
  "source": "naver-cafe-manual-sync",
  "updatedAt": "2026-08-03T12:00:00+09:00",
  "comments": [
    {
      "author": "익명 처리된 이름",
      "date": "2026.08.03",
      "text": "수업 후기",
      "url": "게시글 주소"
    }
  ]
}
```

공개 배포 전에는 작성자 닉네임과 개인정보 노출 여부를 반드시 확인하세요.
