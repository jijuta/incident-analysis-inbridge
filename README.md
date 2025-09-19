# 인시던트 분석 MCP 프록시 클라이언트

Windows Claude Desktop에서 원격 인시던트 분석 MCP 서버에 연결하기 위한 프록시 클라이언트입니다.

## 🚀 Quick Install

```bash
npm install -g git+https://github.com/jijuta/incident-analysis-inbridge.git
```

## 📦 설치 및 설정

### 1. NPM으로 글로벌 설치
```bash
npm install -g git+https://github.com/jijuta/incident-analysis-inbridge.git
```

### 2. Claude Desktop 설정

Claude Desktop 설정 파일에 다음을 추가하세요:

```json
{
  "mcpServers": {
    "incident-analysis": {
      "command": "incident-analysis-inbridge",
      "env": {
        "MCP_SERVER_URL": "http://20.41.120.173:8100"
      }
    }
  }
}
```

**🔒 보안**: IP 주소와 포트는 시스템 관리자가 제공한 값으로 설정하세요.

### 3. 양쪽 도구 모두 사용하기 (권장)

OpenSearch 검색 + 인시던트 분석 기능을 모두 사용하려면:

```json
{
  "mcpServers": {
    "opensearch": {
      "command": "opensearch-mcp-inbridge",
      "env": {
        "MCP_SERVER_URL": "http://20.41.120.173:8099"
      }
    },
    "incident-analysis": {
      "command": "incident-analysis-inbridge",
      "env": {
        "MCP_SERVER_URL": "http://20.41.120.173:8100"
      }
    }
  }
}
```

**💡 이렇게 설정하면 Claude Desktop에서 다음 모든 기능을 사용할 수 있습니다:**
- 📝 OpenSearch 인덱스 검색 및 조회 (8099 포트)
- 📊 인시던트 통계 분석 (8100 포트)
- 📈 트렌드 차트 생성 (8100 포트)
- 🎯 위협 유형 분석 (8100 포트)
- 🌍 지리적 분포 분석 (8100 포트)
- 📋 종합 보고서 생성 (8100 포트)

## 🔧 사용 가능한 도구

1. **get_incident_statistics**: 인시던트 통계 테이블 생성
2. **create_incident_trend_chart**: 트렌드 차트 생성
3. **analyze_top_threats**: 상위 위협 유형 분석
4. **analyze_geographic_distribution**: 지리적 분포 분석
5. **generate_incident_report**: 종합 보고서 생성

## 💬 Claude Desktop에서 사용하는 방법

### 📊 기본 통계 분석
```
"최근 7일간 인시던트 통계를 security-logs-* 인덱스에서 분석해줘"
"threat-intelligence-* 인덱스의 인시던트 통계를 테이블로 보여줘"
"지난 30일간 심각도별 인시던트 분포를 분석해줘"
```

### 📈 트렌드 분석 및 차트
```
"최근 7일간 인시던트 트렌드를 일별로 차트로 보여줘"
"시간별 인시던트 발생 패턴을 1시간 간격으로 분석해줘"
"최근 2주간 보안 이벤트 증감 추세를 그래프로 그려줘"
```

### 🎯 위협 유형 분석
```
"상위 10개 위협 유형을 분석해서 테이블과 파이차트로 보여줘"
"malware 관련 위협을 분석하고 분포도를 차트로 생성해줘"
"가장 빈번한 공격 유형 5개를 찾아서 시각화해줘"
```

### 🌍 지리적 분포 분석
```
"국가별 인시던트 분포를 분석해서 막대그래프로 보여줘"
"지역별 보안 위험도를 분석하고 상위 10개국을 차트로 표시해줘"
"아시아 지역의 인시던트 패턴을 분석해줘"
```

### 📋 종합 보고서 생성
```
"최근 7일간의 종합적인 보안 인시던트 분석 보고서를 작성해줘"
"월간 보안 동향 보고서를 생성해줘 (최근 30일 기준)"
"CEO용 보안 요약 보고서를 만들어줘"
```

### 🔍 고급 분석 요청
```
"특정 IP 대역(192.168.*)에서 발생한 인시던트를 분석해줘"
"critical 등급 인시던트의 시간대별 분포를 분석해줘"
"반복되는 공격 패턴을 찾아서 보고서로 정리해줘"
```

### ⚙️ 커스텀 분석 옵션
```
"log-security-* 인덱스에서 최근 14일간 데이터로 분석해줘"
"threat_category 필드를 기준으로 위협 분류를 해줘"
"source_country 필드로 지리적 분석을 수행해줘"
```

## 🏗️ 아키텍처

```
Windows Claude Desktop → incident-analysis-inbridge → Linux Server (port 8100)
                                     ↓
                          incident-analysis-mcp-server → OpenSearch
```

- **🔒 보안**: IP/포트 정보는 환경변수로 전달, 코드에 하드코딩 없음
- **⚡ HTTP 프록시**: Windows에서 Linux 서버로 안전한 연결
- **🛡️ 독립 실행**: 별도 인증정보 노출 없이 안전한 프록시 역할
- **📊 차트 지원**: Linux 서버에서 차트 생성, Windows에서 표시

## 📊 데이터 요구사항

### 필수 필드
- `@timestamp`: 인시던트 발생 시간
- `severity`: 심각도 (critical, high, medium, low)
- `threat_type`: 위협 유형
- `geoip.country_name`: 국가명 (지리적 분석용)

### 인덱스 패턴
- 기본값: `security-logs-*`
- 사용자 정의 인덱스 패턴 지원

## 🔍 문제 해결

### 연결 오류
```bash
# 서버 연결 확인
curl http://20.41.120.173:8100/health

# 환경 변수 확인
echo $MCP_SERVER_URL
```

### Claude Desktop 연결 문제
1. 설정 파일 확인
2. Claude Desktop 재시작
3. 네트워크 연결 확인
4. 서버 포트 8100 확인

## 📄 라이선스

MIT License

---

**🎯 목표**: Windows Claude Desktop에서 원격 인시던트 분석 서버에 안전하게 연결하여 보안 데이터 분석 및 시각화 기능을 제공합니다.