#!/usr/bin/env node

import readline from 'readline';
import axios from 'axios';

// MCP_SERVER_URL은 필수 환경변수
const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

if (!MCP_SERVER_URL) {
  console.error('❌ MCP_SERVER_URL environment variable is required');
  console.error('');
  console.error('Please set the MCP server URL in your Claude Desktop configuration:');
  console.error('{');
  console.error('  "mcpServers": {');
  console.error('    "incident-analysis": {');
  console.error('      "command": "incident-analysis-inbridge",');
  console.error('      "env": {');
  console.error('        "MCP_SERVER_URL": "http://20.41.120.173:8100"');
  console.error('      }');
  console.error('    }');
  console.error('  }');
  console.error('}');
  console.error('');
  console.error('Contact your system administrator for the correct MCP_SERVER_URL value.');
  process.exit(1);
}

// 헬스체크
async function healthCheck() {
  try {
    await axios.get(`${MCP_SERVER_URL}/health`, { timeout: 5000 });
    console.error(`✅ Incident Analysis MCP Server connected: ${MCP_SERVER_URL}`);
    console.error(`🔧 incident-analysis-inbridge v1.0.0 - HTTP proxy client for incident analysis tools`);
  } catch (error) {
    console.error(`❌ Cannot connect to Incident Analysis MCP server: ${MCP_SERVER_URL}`);
    console.error(`Error: ${error.message}`);
    console.error('');
    console.error('Please check:');
    console.error('- Server URL is correct');
    console.error('- Incident Analysis MCP server is running on port 8100');
    console.error('- Network connectivity');
    process.exit(1);
  }
}

// 시작 시 헬스체크
healthCheck();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// MCP 도구 목록 (정적 정의)
const TOOLS = [
  {
    name: 'get_incident_statistics',
    description: '인시던트 통계 데이터를 가져와서 마크다운 테이블로 생성합니다',
    inputSchema: {
      type: 'object',
      properties: {
        index_pattern: {
          type: 'string',
          description: '검색할 인덱스 패턴 (예: logs-cortex_xdr-incidents-*, logs-cortex_xdr-alerts-*)',
          default: 'logs-cortex_xdr-incidents-*',
        },
        days: {
          type: 'number',
          description: '분석할 일수 (기본값: 7일)',
          default: 7,
        },
        severity_field: {
          type: 'string',
          description: '심각도 필드명 (기본값: severity)',
          default: 'severity',
        },
      },
      required: ['index_pattern'],
    },
  },
  {
    name: 'create_incident_trend_chart',
    description: '인시던트 트렌드 차트를 생성합니다 (시간별, 일별)',
    inputSchema: {
      type: 'object',
      properties: {
        index_pattern: {
          type: 'string',
          description: '검색할 인덱스 패턴',
          default: 'logs-cortex_xdr-incidents-*',
        },
        days: {
          type: 'number',
          description: '분석할 일수',
          default: 7,
        },
        interval: {
          type: 'string',
          description: '시간 간격 (1h, 1d)',
          enum: ['1h', '1d'],
          default: '1d',
        },
      },
      required: ['index_pattern'],
    },
  },
  {
    name: 'analyze_top_threats',
    description: '상위 위협 유형을 분석하고 테이블과 차트로 생성합니다',
    inputSchema: {
      type: 'object',
      properties: {
        index_pattern: {
          type: 'string',
          description: '검색할 인덱스 패턴',
          default: 'logs-cortex_xdr-incidents-*',
        },
        days: {
          type: 'number',
          description: '분석할 일수',
          default: 7,
        },
        threat_field: {
          type: 'string',
          description: '위협 유형 필드명',
          default: 'threat_type',
        },
        top_count: {
          type: 'number',
          description: '상위 몇 개 위협을 분석할지',
          default: 10,
        },
      },
      required: ['index_pattern'],
    },
  },
  {
    name: 'generate_incident_report',
    description: '종합적인 인시던트 분석 보고서를 생성합니다',
    inputSchema: {
      type: 'object',
      properties: {
        index_pattern: {
          type: 'string',
          description: '검색할 인덱스 패턴',
          default: 'logs-cortex_xdr-incidents-*',
        },
        days: {
          type: 'number',
          description: '분석할 일수',
          default: 7,
        },
        report_title: {
          type: 'string',
          description: '보고서 제목',
          default: '보안 인시던트 분석 보고서',
        },
      },
      required: ['index_pattern'],
    },
  },
  {
    name: 'analyze_geographic_distribution',
    description: '지리적 분포 분석 및 시각화',
    inputSchema: {
      type: 'object',
      properties: {
        index_pattern: {
          type: 'string',
          description: '검색할 인덱스 패턴',
          default: 'logs-cortex_xdr-incidents-*',
        },
        days: {
          type: 'number',
          description: '분석할 일수',
          default: 7,
        },
        geo_field: {
          type: 'string',
          description: '지리 정보 필드명',
          default: 'geoip.country_name',
        },
      },
      required: ['index_pattern'],
    },
  },
];

rl.on('line', async (line) => {
  let request = null;
  try {
    request = JSON.parse(line);

    if (request.method === 'initialize') {
      // 초기화 응답
      const safeId = request.id !== null && request.id !== undefined ? request.id : 0;
      const response = {
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "incident-analysis-inbridge",
            version: "1.0.0"
          }
        },
        id: safeId
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'tools/list') {
      // 도구 목록 응답
      const response = {
        jsonrpc: "2.0",
        result: {
          tools: TOOLS
        },
        id: request.id !== null && request.id !== undefined ? request.id : 0
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'prompts/list') {
      // 프롬프트 목록 응답 (빈 목록)
      const response = {
        jsonrpc: "2.0",
        result: {
          prompts: []
        },
        id: request.id !== null && request.id !== undefined ? request.id : 0
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'resources/list') {
      // 리소스 목록 응답 (빈 목록)
      const response = {
        jsonrpc: "2.0",
        result: {
          resources: []
        },
        id: request.id !== null && request.id !== undefined ? request.id : 0
      };
      console.log(JSON.stringify(response));

    } else if (request.method === 'tools/call') {
      // 도구 실행 - HTTP 서버로 프록시
      const { name, arguments: args } = request.params;

      console.error(`📤 Tool call: ${name} | Args: ${JSON.stringify(args)} | Server: ${MCP_SERVER_URL}`);

      const endpoint = `${MCP_SERVER_URL}/tools/${name}`;
      const httpResponse = await axios.post(endpoint, args, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      console.error(`📥 HTTP Response status: ${httpResponse.status} | Success: ${httpResponse.data.success}`);

      // ID가 null인 경우 적절한 기본값 설정
      const safeRequestId = request.id !== null && request.id !== undefined ? request.id : 0;

      if (httpResponse.data.success) {
        const response = {
          jsonrpc: "2.0",
          result: httpResponse.data,
          id: safeRequestId
        };
        console.log(JSON.stringify(response));
      } else {
        throw new Error(httpResponse.data.error || 'Tool execution failed');
      }

    } else {
      // 알 수 없는 메서드
      throw new Error(`Unknown method: ${request.method}`);
    }

  } catch (error) {
    let requestId = null;
    try {
      if (request && typeof request.id !== 'undefined') {
        requestId = request.id;
      }
    } catch {
      requestId = null;
    }

    console.error(`❌ Error: ${error.message}`);

    // ID가 null인 경우 적절한 기본값 설정
    const safeRequestId = requestId !== null ? requestId : 0;

    const errorResponse = {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: error.message
      },
      id: safeRequestId
    };
    console.log(JSON.stringify(errorResponse));
  }
});

process.on('SIGINT', () => {
  console.error('✅ incident-analysis-inbridge terminated');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('✅ incident-analysis-inbridge terminated');
  process.exit(0);
});