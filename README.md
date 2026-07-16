# EtherTarot · 以太塔罗

高端 AI 驱动的塔罗解读 Web 应用。加密随机抽卡、Canvas 特效、LangChain 双语调解读引擎。

## 技术栈

**前端** React 18 + TypeScript + Vite · Framer Motion 3D 翻牌 · Canvas 粒子/流光/洗牌仪式 · Howler.js 音频  
**后端** Python FastAPI · LangChain + Claude · Pydantic 数据模型 · 78 张牌 JSON 知识库  
**随机性** `secrets` 模块生成种子 → `random.Random(seed)` 确定性洗牌，同一种子 100% 可复现，透明可验证

## 快速启动

### 后端

```bash
cd backend
cp .env.example .env          # 编辑 .env，填入 ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API 文档: http://localhost:8000/docs

### 前端

```bash
cd frontend
npm install
npx vite --port 5173
```

浏览器打开: http://localhost:5173

## 项目结构

```
EtherTarot/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # FastAPI 路由 (cards/draw/interpret)
│   │   ├── engine/           # Oracle 解读引擎 + 双语调 Prompts
│   │   ├── models/           # Pydantic 数据模型
│   │   ├── services/         # DrawService (加密随机)
│   │   ├── data/             # 78 张牌 JSON 知识库 + loader
│   │   └── main.py           # FastAPI 入口
│   ├── tests/                # pytest (15 个测试)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # TarotCard/Effects/Interpretation
│   │   ├── hooks/            # useStarfield/useMouseTrail/useAudio/useShuffleTracking
│   │   ├── pages/            # HomePage + ReadingPage
│   │   ├── api/              # API 客户端
│   │   └── types/            # TypeScript 类型
│   ├── public/audio/         # 合成音频 (氛围音乐 + 音效精灵)
│   └── vite.config.ts
└── scripts/                  # 音频生成脚本
```

## API 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/v1/cards/` | 全部 78 张牌 (可按 arcana/suit 筛选) |
| GET | `/api/v1/cards/{id}` | 单张牌详情 |
| GET | `/api/v1/cards/spreads/list` | 牌阵列表 |
| POST | `/api/v1/draw/` | 抽牌 (加密随机) |
| POST | `/api/v1/draw/verify` | 用种子复现抽牌 |
| POST | `/api/v1/interpret/` | AI 解读 (需 API key) |

## 解读引擎

两阶段流水线：
1. **意图分析** (Claude Haiku, temp=0.1) — 语义维度分类
2. **深度解读** (Claude Opus, temp=0.7/0.5) — 三维度框架 + 双语调

双语调模式：
- 🔮 **哲思型** — 荣格原型 · 炼金术 · 英雄之旅
- 🧠 **心理分析型** — CBT · 依恋理论 · 情绪智力

## 卡牌知识库

78 张 Rider-Waite-Smith 标准塔罗牌，每张包含：
- 中英文名称、正逆位关键词与释义
- 13 种荣格心理原型分类
- 元素、行星、黄道对应
- 灵魂拷问、光明面/阴影面
- 符号列表与卡牌关系

## 随机性透明度

每次抽卡生成 SHA-256 种子，显示在前端。用户可输入种子复现抽牌结果，验证系统未篡改。

## 测试

```bash
cd backend && python3 -m pytest tests/ -q  # 15/15 pass
cd frontend && npx tsc --noEmit            # TypeScript 零错误
```

## License

MIT
