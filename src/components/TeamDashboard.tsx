import React, { useState } from 'react';
import { Project, Task, Member, Activity } from '../types';
import {
  Users,
  Award,
  Activity as ActivityIcon,
  MessageSquare,
  Send,
  Zap,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface TeamDashboardProps {
  project: Project;
  tasks: Task[];
  members: Member[];
  activities: Activity[];
  currentMember: Member;
  onSwitchMember: (memberId: string) => void;
  onAddActivity: (projectId: string, action: string, details: string) => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const PRESET_MESSAGES: ChatMessage[] = [
  { id: 'ch1', senderId: 'm1', text: '大家好！[智能客服 AI 升级] 的核心接口本周需要进入提测阶段，大家手头进度怎么样了？', timestamp: '2026-07-06T10:00:00Z' },
  { id: 'ch2', senderId: 'm2', text: '核心的 Gemini API 服务端调用已经调试通了，流式 SSE 有点超时重试的 Bug，我正在排除中，今天能合入 dev。', timestamp: '2026-07-06T10:15:00Z' },
  { id: 'ch3', senderId: 'm3', text: '我的视觉原型和交互动画切图已经发在 Figma 社区了，Bob 如果有疑问可以对齐一下。', timestamp: '2026-07-06T11:00:00Z' },
  { id: 'ch4', senderId: 'm5', text: '兜底的话术我已经准备好了，发在异常处理任务的附件里了，大家抽空看看是否合规。', timestamp: '2026-07-06T11:30:00Z' }
];

export default function TeamDashboard({
  project,
  tasks,
  members,
  activities,
  currentMember,
  onSwitchMember,
  onAddActivity
}: TeamDashboardProps) {
  const [chatList, setChatList] = useState<ChatMessage[]>(PRESET_MESSAGES);
  const [messageInput, setMessageInput] = useState('');

  const projectMembers = members.filter(m => project.memberIds.includes(m.id));
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectActivities = activities.filter(act => act.projectId === project.id || (act.taskId && tasks.find(t => t.id === act.taskId)?.projectId === project.id));

  // Calculate workloads
  const memberStats = projectMembers.map(member => {
    const assignedTasks = projectTasks.filter(t => t.assigneeId === member.id);
    const completedTasks = assignedTasks.filter(t => t.status === 'done');
    const inProgressTasks = assignedTasks.filter(t => t.status === 'in_progress');
    return {
      member,
      total: assignedTasks.length,
      completed: completedTasks.length,
      progress: inProgressTasks.length,
      completionRate: assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 100
    };
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      senderId: currentMember.id,
      text: messageInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatList([...chatList, newMessage]);
    setMessageInput('');

    // Trigger log entry
    onAddActivity(project.id, '群组发信', `在群组频道中发布了一条消息: "${messageInput.trim().substring(0, 30)}..."`);
  };

  // Simulate team discussion
  const handleSimulateDiscussion = () => {
    const simulateScenarios = [
      { senderId: 'm1', text: '好的，Bob，今天辛苦把流式 SSE 的 Bug 推一下，明天我找 Diana (QA) 来介入联调。' },
      { senderId: 'm4', text: '收到！回归测试用例框架已经搭好了，随时可以接入自动化路由测试，坐等 Bob 的接口！' },
      { senderId: 'm2', text: '没问题，Bug 已经排查到了，是中间件缓存没有关闭，我已关闭并在开发环境测试通过！现在提 PR。' },
      { senderId: 'm1', text: '效率太棒了！今晚我们就可以发布 alpha 测试版了。🚀' }
    ];

    let delay = 300;
    simulateScenarios.forEach((sc, index) => {
      setTimeout(() => {
        setChatList(prev => [
          ...prev,
          {
            id: `sim_${Date.now()}_${index}`,
            senderId: sc.senderId,
            text: sc.text,
            timestamp: new Date(Date.now() + index * 60000).toISOString()
          }
        ]);
        const senderName = members.find(m => m.id === sc.senderId)?.name || '团队成员';
        onAddActivity(project.id, '模拟讨论', `${senderName} 进行了模拟跟帖反馈`);
      }, delay);
      delay += 1000; // 1-second interval
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT & CENTER columns */}
      <div className="lg:col-span-2 space-y-6">
        {/* Roleplayer Switcher */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
            <h4 className="font-bold text-slate-800 text-sm">团队协作角色身份切换</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            为了方便在单人预览模式下测试<b>多成员协作</b>，您可以通过下方按钮快速切换当前的操作身份。
            切换后，您写的评论、指派的任务、以及在协同留言板上的消息都会以此角色发表。
          </p>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {members.map(member => {
              const isCurrent = member.id === currentMember.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSwitchMember(member.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer select-none ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: member.avatarColor }}
                  />
                  <span>{member.name}</span>
                  <span className="opacity-60 text-[10px] font-normal">({member.role === 'project_manager' ? 'PM' : member.role === 'developer' ? '研发' : member.role === 'designer' ? '设计' : member.role === 'qa' ? 'QA' : '产品'})</span>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            当前身份：<span className="text-blue-700 font-bold">{currentMember.name}</span> | 角色职责：<span className="text-slate-700 font-bold">{currentMember.role.toUpperCase()}</span>
          </div>
        </div>

        {/* Workload Analysis Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-base">成员工作负载监控</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">共计 {projectMembers.length} 名项目成员</span>
          </div>

          <div className="space-y-4">
            {memberStats.map(({ member, total, completed, progress, completionRate }) => (
              <div key={member.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name[0]}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{member.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{member.role} | {member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700">{completed}/{total} 任务完成</span>
                    <p className="text-[10px] text-slate-400 font-mono">完成率 {completionRate}%</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-1.5 transition-all duration-300"
                      style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                      title={`已完成: ${completed}`}
                    />
                    <div
                      className="bg-blue-500 h-1.5 transition-all duration-300"
                      style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                      title={`进行中: ${progress}`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />已完成: {completed}</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />进行中: {progress}</span>
                    <span>待办/审核: {total - completed - progress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-base">项目动态 & 操作审计日志</h3>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {projectActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-100 rounded-xl">
                暂无项目操作记录
              </div>
            ) : (
              projectActivities.map(act => {
                const actMember = members.find(m => m.id === act.userId);
                return (
                  <div key={act.id} className="flex gap-3 text-xs items-start p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 bg-white">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[10px]"
                      style={{ backgroundColor: actMember?.avatarColor || '#cbd5e1' }}
                    >
                      {actMember?.name[0] || '?'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-700">
                        <strong className="text-slate-900">{actMember?.name || '未知人员'}</strong>
                        <span className="mx-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono border border-slate-200">{act.action}</span>
                      </p>
                      <p className="text-slate-500 text-xs font-medium">{act.details}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT column - Messaging Channel */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-[580px] relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">项目协同留言板</h3>
                <p className="text-[10px] text-slate-400">实时交互的讨论频道</p>
              </div>
            </div>

            {/* Simulated chat trigger */}
            <button
              onClick={handleSimulateDiscussion}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold rounded-lg border border-blue-200 cursor-pointer shadow-2xs"
              title="模拟成员在群内进行项目周会更新和反馈讨论"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>一键模拟讨论</span>
            </button>
          </div>

          {/* Chat message listing */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4 select-text">
            {chatList.map(chat => {
              const sender = members.find(m => m.id === chat.senderId);
              const isMe = chat.senderId === currentMember.id;

              return (
                <div key={chat.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Sender Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[10px]"
                    style={{ backgroundColor: sender?.avatarColor || '#64748b' }}
                    title={sender?.name}
                  >
                    {sender?.name[0] || '?'}
                  </div>

                  <div className={`space-y-1 max-w-[78%] ${isMe ? 'items-end text-right' : ''}`}>
                    {/* Name & Date */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">{sender?.name || '未知成员'}</span>
                      <span className="font-mono">{new Date(chat.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div className={`p-3 rounded-xl text-xs leading-relaxed text-left ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat messaging input form */}
          <form onSubmit={handleSendMessage} className="mt-auto border-t border-slate-100 pt-3 shrink-0 flex gap-2">
            <input
              type="text"
              placeholder={`以 ${currentMember.name} 身份发表消息...`}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
            <button
              type="submit"
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
