import React, { useState } from 'react';
import { Task, Member, TaskStatus, TaskPriority, Comment, Subtask } from '../types';
import {
  X,
  Calendar,
  AlertTriangle,
  User,
  CheckSquare,
  Square,
  MessageSquare,
  Send,
  History,
  Trash2,
  Clock,
  Plus
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  members: Member[];
  currentMember: Member;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDetailModal({
  task,
  members,
  currentMember,
  onClose,
  onUpdateTask,
  onDeleteTask
}: TaskDetailModalProps) {
  const [commentInput, setCommentInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Handle comment submit
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      taskId: task.id,
      authorId: currentMember.id,
      content: commentInput.trim(),
      createdAt: new Date().toISOString()
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '添加评论',
      details: `发表了新评论: "${commentInput.trim().substring(0, 30)}..."`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      comments: [...task.comments, newComment],
      activityLog: [newActivity, ...task.activityLog]
    });

    setCommentInput('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('确认要删除这条评论吗？')) {
      onUpdateTask({
        ...task,
        comments: task.comments.filter(c => c.id !== commentId)
      });
    }
  };

  // Toggle subtask completed status
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    const toggledSub = task.subtasks.find(s => s.id === subtaskId);
    const actionText = toggledSub?.completed ? '取消完成子任务' : '完成子任务';

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: actionText,
      details: `${actionText}: ${toggledSub?.title}`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      activityLog: [newActivity, ...task.activityLog]
    });
  };

  // Add new subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: `sub_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '创建子任务',
      details: `添加了检查项: ${newSubtaskTitle.trim()}`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSub],
      activityLog: [newActivity, ...task.activityLog]
    });

    setNewSubtaskTitle('');
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.filter(s => s.id !== subtaskId)
    });
  };

  // Update status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus === task.status) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '更新状态',
      details: `将任务状态变更为 [${newStatus}]`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      status: newStatus,
      activityLog: [newActivity, ...task.activityLog]
    });
  };

  // Update priority
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as TaskPriority;
    if (newPriority === task.priority) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '更新优先级',
      details: `将任务优先级设置为 [${newPriority}]`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      priority: newPriority,
      activityLog: [newActivity, ...task.activityLog]
    });
  };

  // Update assignee
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value || null;
    if (newAssigneeId === task.assigneeId) return;

    const assignedName = newAssigneeId ? (members.find(m => m.id === newAssigneeId)?.name || '未名人员') : '未指派';

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '重指派负责人',
      details: `将负责人变更为 [${assignedName}]`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      assigneeId: newAssigneeId,
      activityLog: [newActivity, ...task.activityLog]
    });
  };

  // Update due date
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate === task.dueDate) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: currentMember.id,
      action: '更改截止时间',
      details: `将截止日期修改为 [${newDate}]`,
      createdAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      dueDate: newDate,
      activityLog: [newActivity, ...task.activityLog]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs select-text">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150">
        
        {/* Modal Topbar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <span className="text-xs text-slate-500 font-bold font-mono">TASK: {task.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('确认要永久删除这个任务吗？此操作无法撤销。')) {
                  onDeleteTask(task.id);
                }
              }}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-transparent hover:border-red-200 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除任务</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body Grid */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 Columns: Task Title, Desc, Subtasks, Comments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{task.title}</h2>
              <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">任务详述</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {task.description || '暂无详细描述信息。'}
                </p>
              </div>
            </div>

            {/* Subtasks Checklists */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>检查清单子任务 ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50/50 group">
                    <button
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2.5 text-left text-xs font-medium text-slate-700 flex-grow cursor-pointer"
                    >
                      {sub.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                      )}
                      <span className={sub.completed ? 'line-through text-slate-400' : ''}>{sub.title}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="text-slate-400 hover:text-red-500 font-bold px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-150"
                      title="删除检查项"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask mini form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="添加新的检查步骤..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="flex-grow px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加</span>
                </button>
              </form>
            </div>

            {/* Comments Discussion Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>协同讨论及意见 ({task.comments.length})</span>
              </h3>

              {/* Comments Feed */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {task.comments.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-100 rounded-xl">
                    还没有人发表讨论，以当前身份说点什么吧！
                  </p>
                ) : (
                  task.comments.map(comment => {
                    const author = members.find(m => m.id === comment.authorId);
                    const isMyComment = comment.authorId === currentMember.id;

                    return (
                      <div key={comment.id} className="flex gap-3 text-xs items-start p-3 border border-slate-100/80 bg-slate-50/30 rounded-xl hover:bg-slate-50 transition duration-150 relative group">
                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[10px]"
                          style={{ backgroundColor: author?.avatarColor || '#64748b' }}
                        >
                          {author?.name[0] || '?'}
                        </div>

                        {/* Content bubble */}
                        <div className="flex-grow space-y-1 pr-6">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="font-bold text-slate-700">{author?.name}</span>
                            <span className="text-slate-400">({author?.role === 'project_manager' ? 'PM' : author?.role === 'developer' ? '研发' : author?.role === 'designer' ? '设计' : '其他'})</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400 font-mono">{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed leading-normal">{comment.content}</p>
                        </div>

                        {/* Comment Delete */}
                        {isMyComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-150"
                            title="删除评论"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Comment Input */}
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 space-y-2">
                <div className="text-[10px] text-slate-500 font-medium">
                  发信人：以 <strong className="text-blue-700">{currentMember.name}</strong> 身份评论...
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="输入具体意见、反馈、或当前遇到的堵点..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="flex-grow px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT 1 Column: Meta Sidebar controls */}
          <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200/50 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
              属性与控制
            </h3>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">工作状态</label>
              <select
                value={task.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold focus:outline-none focus:border-slate-800"
              >
                <option value="todo">待处理 (To Do)</option>
                <option value="in_progress">进行中 (In Progress)</option>
                <option value="in_review">审核中 (In Review)</option>
                <option value="done">已完成 (Done)</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">优先级</label>
              <select
                value={task.priority}
                onChange={handlePriorityChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold focus:outline-none focus:border-slate-800"
              >
                <option value="high">高 (High)</option>
                <option value="medium">中 (Medium)</option>
                <option value="low">低 (Low)</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">指派给谁</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <select
                  value={task.assigneeId || ''}
                  onChange={handleAssigneeChange}
                  className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="">-- 未指派 --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date Datepicker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500">截止日期</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={handleDueDateChange}
                  className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-mono focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Task Change History specific to this task */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3" /> 变更履历 (审计追踪)
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px] leading-relaxed">
                {task.activityLog.length === 0 ? (
                  <p className="text-slate-400 text-xs py-1">暂无变更履历</p>
                ) : (
                  task.activityLog.map(act => {
                    const op = members.find(m => m.id === act.userId);
                    return (
                      <div key={act.id} className="p-1.5 bg-white border border-slate-100 rounded-md">
                        <span className="font-bold text-slate-700">{op?.name || '未知'}:</span>{' '}
                        <span className="text-slate-500">{act.details}</span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {new Date(act.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
