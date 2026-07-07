import React, { useState } from 'react';
import { Project, Task, Member } from '../types';
import { Briefcase, Calendar, Users, Plus, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onDeleteProject: (projectId: string) => void;
  currentMember: Member;
}

export default function ProjectList({
  projects,
  tasks,
  members,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  currentMember
}: ProjectListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planning' | 'active' | 'paused' | 'completed'>('active');
  const [startDate, setStartDate] = useState('2026-07-07');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['m1']);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name,
      description,
      status,
      startDate,
      endDate,
      memberIds: selectedMembers,
      ownerId: currentMember.id
    });

    // Reset
    setName('');
    setDescription('');
    setStatus('active');
    setStartDate('2026-07-07');
    setEndDate('2026-09-30');
    setSelectedMembers([currentMember.id]);
    setIsModalOpen(false);
  };

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      }
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const getStatusBadge = (projStatus: string) => {
    switch (projStatus) {
      case 'planning':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3.5 h-3.5" /> 规划中
        </span>;
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 animate-pulse">
          <Clock className="w-3.5 h-3.5" /> 进行中
        </span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5" /> 已挂起
        </span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">项目工作区</h2>
          <p className="text-sm text-slate-500">追踪、管理并协同推动多个核心项目的进展</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition duration-150 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>新建项目</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const projectMembers = members.filter(m => project.memberIds.includes(m.id));

          return (
            <div
              key={project.id}
              className="flex flex-col bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 relative group"
            >
              {/* Delete Button (Hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`确认要删除项目「${project.name}」吗？这将同时清空相关的所有任务。`)) {
                    onDeleteProject(project.id);
                  }
                }}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                title="删除项目"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-100 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="space-y-1 pr-6">
                  <h3
                    onClick={() => onSelectProject(project.id)}
                    className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer text-base line-clamp-1"
                  >
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                {project.description || '暂无描述信息...'}
              </p>

              {/* Progress Slider */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>项目进度</span>
                  <span className="text-slate-800 font-bold">{stats.percent}% ({stats.completed}/{stats.total} 任务)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                {/* Date range */}
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{project.startDate} ~ {project.endDate}</span>
                </div>

                {/* Member avatars */}
                <div className="flex -space-x-2 overflow-hidden" title={`${projectMembers.length} 名成员`}>
                  {projectMembers.slice(0, 4).map(member => (
                    <div
                      key={member.id}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white border border-slate-200 shrink-0 select-none"
                      style={{ backgroundColor: member.avatarColor }}
                      title={`${member.name} (${member.role})`}
                    >
                      {member.name[0]}
                    </div>
                  ))}
                  {projectMembers.length > 4 && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-600 ring-2 ring-white shrink-0 select-none border border-slate-300">
                      +{projectMembers.length - 4}
                    </div>
                  )}
                </div>
              </div>

              {/* View workspace Link */}
              <button
                onClick={() => onSelectProject(project.id)}
                className="w-full text-center mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer border border-slate-200/50"
              >
                进入项目工作台 &rarr;
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">启动新项目</h3>
              <p className="text-xs text-slate-500 mt-1">设置项目的起止时间，分配初始团队成员并启动任务跟踪</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="例如：电商系统 2.0 重构"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">项目描述</label>
                <textarea
                  rows={3}
                  placeholder="详细描述项目背景、目标及预期交付物..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">截止日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">项目初始状态</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  >
                    <option value="planning">规划中 (Planning)</option>
                    <option value="active">进行中 (Active)</option>
                    <option value="paused">已挂起 (Paused)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">项目负责人 (Owner)</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentMember.name} (${currentMember.role})`}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>分配项目团队成员 (多选)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-100 p-2 rounded-lg bg-slate-50">
                  {members.map(member => {
                    const isSelected = selectedMembers.includes(member.id);
                    return (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => handleMemberToggle(member.id)}
                        className={`flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: member.avatarColor }}
                        />
                        <span className="truncate">{member.name} - {member.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
                >
                  确认启动
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
