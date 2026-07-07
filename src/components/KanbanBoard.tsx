import React, { useState } from 'react';
import { Project, Task, Member, TaskStatus, TaskPriority } from '../types';
import {
  ListTodo,
  Play,
  Eye,
  CheckCircle,
  Plus,
  Calendar,
  AlertTriangle,
  User,
  Search,
  SlidersHorizontal,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  members: Member[];
  onSelectTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'activityLog'>) => void;
  currentMember: Member;
}

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string; border: string; bg: string }[] = [
  { id: 'todo', label: '待处理', icon: ListTodo, color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50' },
  { id: 'in_progress', label: '进行中', icon: Play, color: 'text-blue-500', border: 'border-blue-200', bg: 'bg-blue-50/40' },
  { id: 'in_review', label: '审核中', icon: Eye, color: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50/40' },
  { id: 'done', label: '已完成', icon: CheckCircle, color: 'text-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50/20' }
];

export default function KanbanBoard({
  project,
  tasks,
  members,
  onSelectTask,
  onUpdateTaskStatus,
  onCreateTask,
  currentMember
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-07-15');
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<string[]>([]);
  const [currentSubtaskInput, setCurrentSubtaskInput] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const filteredTasks = projectTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const getPriorityBadge = (prio: TaskPriority) => {
    switch (prio) {
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-150">
          <AlertTriangle className="w-3 h-3" /> 高优先级
        </span>;
      case 'medium':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
          <AlertTriangle className="w-3 h-3" /> 中
        </span>;
      case 'low':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          低
        </span>;
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onCreateTask({
      projectId: project.id,
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'todo',
      priority: newTaskPriority,
      assigneeId: newTaskAssignee || null,
      dueDate: newTaskDueDate,
      subtasks: newTaskSubtasks.map((title, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        title,
        completed: false
      }))
    });

    // Reset
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskAssignee('');
    setNewTaskDueDate('2026-07-15');
    setNewTaskSubtasks([]);
    setCurrentSubtaskInput('');
    setIsNewTaskModalOpen(false);
  };

  const addSubtaskItem = () => {
    if (currentSubtaskInput.trim()) {
      setNewTaskSubtasks([...newTaskSubtasks, currentSubtaskInput.trim()]);
      setCurrentSubtaskInput('');
    }
  };

  const removeSubtaskItem = (index: number) => {
    setNewTaskSubtasks(newTaskSubtasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Filtering Section */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索任务名称、详情..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800"
            >
              <option value="all">所有优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800 shrink-0"
          >
            <option value="all">所有负责人</option>
            {members.filter(m => project.memberIds.includes(m.id)).map(member => (
              <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>添加任务</span>
        </button>
      </div>

      {/* Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(column => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);

          return (
            <div key={column.id} className="flex flex-col bg-slate-50/70 border border-slate-200 rounded-xl p-4 min-h-[500px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-4">
                <div className="flex items-center gap-2">
                  <column.icon className={`w-4 h-4 ${column.color}`} />
                  <span className="font-bold text-slate-800 text-sm">{column.label}</span>
                  <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Items Container */}
              <div className="space-y-3 flex-grow overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white/50">
                    暂无任务
                  </div>
                ) : (
                  columnTasks.map(task => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                    const totalSubtasks = task.subtasks.length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer relative group/item"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          {getPriorityBadge(task.priority)}

                          {/* Quick status cycle button */}
                          <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity">
                            {column.id !== 'done' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatusMap: Record<TaskStatus, TaskStatus> = {
                                    'todo': 'in_progress',
                                    'in_progress': 'in_review',
                                    'in_review': 'done',
                                    'done': 'done'
                                  };
                                  onUpdateTaskStatus(task.id, nextStatusMap[column.id]);
                                }}
                                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                                title="推进任务状态"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                          {task.title}
                        </h4>

                        <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {task.description || '无详细描述'}
                        </p>

                        {/* Subtasks progress indicator */}
                        {totalSubtasks > 0 && (
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>检查项</span>
                              <span>{completedSubtasks}/{totalSubtasks} ({Math.round((completedSubtasks / totalSubtasks) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1">
                              <div
                                className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer details */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{task.dueDate}</span>
                          </div>

                          {assignee ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <div
                                className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                style={{ backgroundColor: assignee.avatarColor }}
                                title={`${assignee.name} (${assignee.role})`}
                              >
                                {assignee.name[0]}
                              </div>
                              <span className="text-[10px] text-slate-500 max-w-16 truncate">{assignee.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <User className="w-3 h-3" />
                              <span>未指派</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">新建项目任务</h3>
              <p className="text-xs text-slate-500 mt-1">为此项目创建一个新的工作实体，可以附带具体的子任务列表</p>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">任务名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="例如：开发对话流式接口"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">任务描述与详细要求</label>
                <textarea
                  rows={3}
                  placeholder="提供任务的背景、具体要解决的问题，以及验收标准..."
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">截止日期</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">优先级</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  >
                    <option value="low">低 (Low)</option>
                    <option value="medium">中 (Medium)</option>
                    <option value="high">高 (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">指派负责人 (Assignee)</label>
                <select
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                >
                  <option value="">-- 未指派负责人 --</option>
                  {members.filter(m => project.memberIds.includes(m.id)).map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>

              {/* Subtasks addition */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">分解子任务 (检查清单)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入子任务项名称..."
                    value={currentSubtaskInput}
                    onChange={e => setCurrentSubtaskInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtaskItem();
                      }
                    }}
                    className="flex-grow px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addSubtaskItem}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg transition text-slate-600 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                {newTaskSubtasks.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 max-h-24 overflow-y-auto border border-slate-100 p-2 rounded-lg bg-slate-50/50">
                    {newTaskSubtasks.map((st, i) => (
                      <div key={i} className="flex justify-between items-center bg-white px-2.5 py-1 rounded border border-slate-200/60 text-xs">
                        <span className="text-slate-700 truncate font-medium">{st}</span>
                        <button
                          type="button"
                          onClick={() => removeSubtaskItem(i)}
                          className="text-slate-400 hover:text-red-500 font-semibold cursor-pointer px-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
