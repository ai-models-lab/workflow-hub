import { Project, Task, Member, Activity } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Alice Smith', role: 'project_manager', email: 'alice.smith@workflowhub.com', avatarColor: '#F59E0B' }, // Amber
  { id: 'm2', name: 'Bob Johnson', role: 'developer', email: 'bob.johnson@workflowhub.com', avatarColor: '#3B82F6' }, // Blue
  { id: 'm3', name: 'Charlie Brown', role: 'designer', email: 'charlie.brown@workflowhub.com', avatarColor: '#10B981' }, // Emerald
  { id: 'm4', name: 'Diana Prince', role: 'qa', email: 'diana.prince@workflowhub.com', avatarColor: '#EC4899' }, // Pink
  { id: 'm5', name: 'Evan Wright', role: 'product_owner', email: 'evan.wright@workflowhub.com', avatarColor: '#8B5CF6' } // Violet
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '智能客服 AI 升级',
    description: '集成大语言模型（LLM）升级现有客服系统，支持多轮对话、情感分析和自动工单创建，全面提升客服效率。',
    status: 'active',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    memberIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
    ownerId: 'm1',
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'p2',
    name: '电商平台 2.0 重构',
    description: '全面重构前端与后端，提升页面加载速度、优化结账流程，并引入响应式设计以改善移动端体验。',
    status: 'active',
    startDate: '2026-05-15',
    endDate: '2026-09-15',
    memberIds: ['m1', 'm2', 'm3'],
    ownerId: 'm1',
    createdAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'p3',
    name: '移动端 App 交互设计',
    description: '重新设计核心页面的微交互和手势反馈，提升用户的沉浸感与日常活跃留存率。',
    status: 'planning',
    startDate: '2026-07-10',
    endDate: '2026-08-20',
    memberIds: ['m1', 'm3'],
    ownerId: 'm1',
    createdAt: '2026-07-01T14:30:00Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  // Project 1 Tasks
  {
    id: 't1',
    projectId: 'p1',
    title: '核心对话框原型及动效设计',
    description: '设计用户与 AI 客服对话的各种交互细节，包括气泡展开、载入等待状态、打字机动效等。',
    status: 'done',
    priority: 'high',
    assigneeId: 'm3',
    dueDate: '2026-06-20',
    createdAt: '2026-06-02T10:00:00Z',
    subtasks: [
      { id: 's1', title: '主界面对话气泡排版', completed: true },
      { id: 's2', title: 'AI 思考中骨架屏动效', completed: true },
      { id: 's3', title: '卡片推荐项交互设计', completed: true }
    ],
    comments: [
      {
        id: 'c1',
        taskId: 't1',
        authorId: 'm1',
        content: 'Charlie，原型的动效非常平滑，符合我们对高端感的要求！已批准。',
        createdAt: '2026-06-18T15:30:00Z'
      },
      {
        id: 'c2',
        taskId: 't1',
        authorId: 'm3',
        content: '谢谢 Alice，我已经把设计资源发布到了 Figma，Bob 可以直接导出切图了。',
        createdAt: '2026-06-19T09:15:00Z'
      },
      {
        id: 'c3',
        taskId: 't1',
        authorId: 'm2',
        content: '收到，前端组件已经在按照最新的原型图开发，细节还原度没问题。',
        createdAt: '2026-06-19T14:20:00Z'
      }
    ],
    activityLog: [
      { id: 'a1', taskId: 't1', userId: 'm1', action: '创建任务', details: '创建了任务：核心对话框原型及动效设计', createdAt: '2026-06-02T10:00:00Z' },
      { id: 'a2', taskId: 't1', userId: 'm3', action: '认领任务', details: '认领了此任务', createdAt: '2026-06-03T11:00:00Z' },
      { id: 'a3', taskId: 't1', userId: 'm3', action: '完成子任务', details: '完成了子任务: 主界面对话气泡排版', createdAt: '2026-06-10T16:00:00Z' },
      { id: 'a4', taskId: 't1', userId: 'm3', action: '更新状态', details: '将状态更新为 [已完成]', createdAt: '2026-06-19T16:00:00Z' }
    ]
  },
  {
    id: 't2',
    projectId: 'p1',
    title: '后端 Gemini API 路由及流式对接',
    description: '在服务端对接 Google GenAI SDK。引入流式响应（Streaming Response），并实现会话历史（Thread Memory）在服务端的高效持久化。',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm2',
    dueDate: '2026-07-15',
    createdAt: '2026-06-05T09:00:00Z',
    subtasks: [
      { id: 's4', title: '配置 Node.js 后端 SDK', completed: true },
      { id: 's5', title: '实现流式回复 SSE 接口', completed: false },
      { id: 's6', title: '添加会话历史持久化逻辑', completed: false }
    ],
    comments: [
      {
        id: 'c4',
        taskId: 't2',
        authorId: 'm2',
        content: '目前 SDK 已经跑通，单次提问响应正常。SSE 流式返回在本地联调时偶尔有中断，明天排查一下 Nginx 的缓冲区配置。',
        createdAt: '2026-07-05T18:30:00Z'
      },
      {
        id: 'c5',
        taskId: 't2',
        authorId: 'm1',
        content: '辛苦了 Bob，这部分是核心。如果有需要架构会诊，随时拉上我。',
        createdAt: '2026-07-06T10:00:00Z'
      }
    ],
    activityLog: [
      { id: 'a5', taskId: 't2', userId: 'm1', action: '创建任务', details: '创建了该任务并设定截止日期为 2026-07-15', createdAt: '2026-06-05T09:00:00Z' },
      { id: 'a6', taskId: 't2', userId: 'm2', action: '分配任务', details: '接受了任务分配并开始实施', createdAt: '2026-06-06T09:30:00Z' },
      { id: 'a7', taskId: 't2', userId: 'm2', action: '完成子任务', details: '完成了子任务: 配置 Node.js 后端 SDK', createdAt: '2026-07-02T14:00:00Z' }
    ]
  },
  {
    id: 't3',
    projectId: 'p1',
    title: '异常应答及兜底话术系统方案',
    description: '设计并验证客服系统在 API 限制、断网、回答敏感内容等异常状态下的前端反馈与本地兜底话术，保证极致体验。',
    status: 'in_review',
    priority: 'medium',
    assigneeId: 'm5',
    dueDate: '2026-07-12',
    createdAt: '2026-06-10T14:00:00Z',
    subtasks: [
      { id: 's7', title: '整理异常场景话术表', completed: true },
      { id: 's8', title: '配置前端一键重试与人工客服入口', completed: true }
    ],
    comments: [],
    activityLog: [
      { id: 'a8', taskId: 't3', userId: 'm5', action: '创建任务', details: '创建了异常话术定义任务', createdAt: '2026-06-10T14:00:00Z' },
      { id: 'a9', taskId: 't3', userId: 'm5', action: '更新状态', details: '将状态推进为 [审核中]，等待 Alice 最终把关', createdAt: '2026-07-06T11:00:00Z' }
    ]
  },
  {
    id: 't4',
    projectId: 'p1',
    title: '对话情感分析与满意度监控面板',
    description: '设计并搭建数据看板，利用 AI 对聊天记录进行实时文本情感挖掘，统计满意度变化并可视化输出日度报表。',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'm2',
    dueDate: '2026-07-30',
    createdAt: '2026-06-15T09:00:00Z',
    subtasks: [
      { id: 's9', title: '满意度指标公式设计', completed: false },
      { id: 's10', title: '引入 Recharts 图表库', completed: false },
      { id: 's11', title: '对接情感分类 API', completed: false }
    ],
    comments: [],
    activityLog: [
      { id: 'a10', taskId: 't4', userId: 'm1', action: '创建任务', details: '创建了该看板分析任务并指派给 Bob', createdAt: '2026-06-15T09:00:00Z' }
    ]
  },
  {
    id: 't5',
    projectId: 'p1',
    title: '对话系统全量自动化回归测试',
    description: '编写端到端自动化集成测试，模拟高并发、多轮对话场景下的服务压力。重点检验转接人工工单的准确度和延迟。',
    status: 'todo',
    priority: 'low',
    assigneeId: 'm4',
    dueDate: '2026-08-15',
    createdAt: '2026-06-20T10:00:00Z',
    subtasks: [
      { id: 's12', title: '测试用例大纲编写', completed: false },
      { id: 's13', title: '搭建多轮对话回归测试套件', completed: false }
    ],
    comments: [],
    activityLog: []
  },

  // Project 2 Tasks
  {
    id: 't6',
    projectId: 'p2',
    title: '系统整体高并发架构设计与方案评审',
    description: '评估电商系统2.0重构的数据库结构、缓存方案与高并发扣减库存逻辑，产出系统架构设计文档。',
    status: 'done',
    priority: 'high',
    assigneeId: 'm2',
    dueDate: '2026-06-10',
    createdAt: '2026-05-16T10:00:00Z',
    subtasks: [
      { id: 's14', title: 'Redis 缓存击穿兜底设计', completed: true },
      { id: 's15', title: '架构方案评审会议', completed: true }
    ],
    comments: [],
    activityLog: []
  },
  {
    id: 't7',
    projectId: 'p2',
    title: '移动端响应式网格及结账链路重构',
    description: '对核心购物车和结账提交订单链路进行响应式适配，提高在小屏设备上的成单转化率。',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'm3',
    dueDate: '2026-07-25',
    createdAt: '2026-05-20T09:00:00Z',
    subtasks: [
      { id: 's16', title: '结账页面交互重构', completed: true },
      { id: 's17', title: '购物车滑出面板适配', completed: false }
    ],
    comments: [
      {
        id: 'c6',
        taskId: 't7',
        authorId: 'm3',
        content: '結账页面的第一轮适配已搞定，购物车滑出面板还剩点移动端滚屏穿透的 Bug，我本周能解决。',
        createdAt: '2026-07-06T14:45:00Z'
      }
    ],
    activityLog: []
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act1', projectId: 'p1', userId: 'm1', action: '创建项目', details: '启动了 [智能客服 AI 升级] 项目，指定初始成员', createdAt: '2026-06-01T09:00:00Z' },
  { id: 'act2', projectId: 'p1', userId: 'm3', action: '完成任务', details: '将任务 [核心对话框原型及动效设计] 标记为已完成', createdAt: '2026-06-19T16:00:00Z' },
  { id: 'act3', projectId: 'p1', userId: 'm5', action: '更新状态', details: '将任务 [异常应答及兜底话术系统方案] 提交审核', createdAt: '2026-07-06T11:00:00Z' },
  { id: 'act4', projectId: 'p2', userId: 'm2', action: '完成任务', details: '完成了电商2.0项目的 [系统整体高并发架构设计与方案评审] 任务', createdAt: '2026-06-10T17:00:00Z' }
];

export const STORAGE_KEY = 'workflow_hub_data';

export interface WorkflowHubStore {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  activities: Activity[];
}

export function loadStore(): WorkflowHubStore {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse workflow storage data, loading defaults.", e);
    }
  }

  // Fallback / Initial
  const store: WorkflowHubStore = {
    projects: INITIAL_PROJECTS,
    tasks: INITIAL_TASKS,
    members: INITIAL_MEMBERS,
    activities: INITIAL_ACTIVITIES
  };
  saveStore(store);
  return store;
}

export function saveStore(store: WorkflowHubStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
