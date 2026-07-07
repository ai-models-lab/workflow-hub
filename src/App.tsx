import React, { useState, useEffect } from 'react';
import { Project, Task, Member, Activity, TaskStatus } from './types';
import { loadStore, saveStore } from './data';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import TimelineView from './components/TimelineView';
import TeamDashboard from './components/TeamDashboard';
import TaskDetailModal from './components/TaskDetailModal';
import {
  Layers,
  ArrowLeft,
  Calendar,
  Users,
  Trello,
  Clock,
  ShieldAlert,
  ChevronDown,
  Info
} from 'lucide-react';

export default function App() {
  // Global States
  const [store, setStore] = useState(() => loadStore());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'kanban' | 'timeline' | 'team'>('kanban');
  const [currentMemberId, setCurrentMemberId] = useState<string>('m1');
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false);

  // Auto-sync store changes with LocalStorage
  useEffect(() => {
    saveStore(store);
  }, [store]);

  const { projects, tasks, members, activities } = store;

  // Active items
  const currentProject = projects.find(p => p.id === selectedProjectId) || null;
  const currentTask = tasks.find(t => t.id === selectedTaskId) || null;
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // Helper to add activity log
  const logActivity = (projectId: string, action: string, details: string, taskId?: string) => {
    const newAct: Activity = {
      id: `act_${Date.now()}`,
      projectId,
      taskId,
      userId: currentMemberId,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    setStore(prev => ({
      ...prev,
      activities: [newAct, ...prev.activities]
    }));
  };

  // Switch Member Identity
  const handleSwitchMember = (memberId: string) => {
    setCurrentMemberId(memberId);
    setIsIdentityDropdownOpen(false);
  };

  // Project Actions
  const handleCreateProject = (newProjectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...newProjectData,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setStore(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
    logActivity(newProj.id, '创建项目', `新建了项目「${newProj.name}」，分配了 ${newProj.memberIds.length} 名初始团队成员`);
  };

  const handleDeleteProject = (projectId: string) => {
    setStore(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      tasks: prev.tasks.filter(t => t.projectId !== projectId),
      activities: prev.activities.filter(act => act.projectId !== projectId)
    }));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  // Task Actions
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'comments' | 'activityLog'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `t_${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
      activityLog: [
        {
          id: `act_init_${Date.now()}`,
          userId: currentMemberId,
          action: '创建任务',
          details: `在项目中创建了此项任务，指派给「${members.find(m => m.id === newTaskData.assigneeId)?.name || '未指派'}」`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    setStore(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    logActivity(
      newTask.projectId,
      '创建任务',
      `创建了任务「${newTask.title}」，截止日期：${newTask.dueDate}`,
      newTask.id
    );
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setStore(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const oldStatusLabel = taskToUpdate.status.toUpperCase();
    const newStatusLabel = newStatus.toUpperCase();

    const newActivity: Activity = {
      id: `act_status_${Date.now()}`,
      taskId,
      userId: currentMemberId,
      action: '更新状态',
      details: `将状态从 [${oldStatusLabel}] 更新为 [${newStatusLabel}]`,
      createdAt: new Date().toISOString()
    };

    setStore(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? {
        ...t,
        status: newStatus,
        activityLog: [newActivity, ...t.activityLog]
      } : t)
    }));

    logActivity(
      taskToUpdate.projectId,
      '更新任务状态',
      `将任务「${taskToUpdate.title}」状态变更为 [${newStatusLabel}]`,
      taskId
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setStore(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));

    logActivity(
      taskToDelete.projectId,
      '删除任务',
      `永久删除了任务「${taskToDelete.title}」`
    );
    setSelectedTaskId(null);
  };

  // Calculate project overall progress
  const getProjectProgress = (projId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projId);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.status === 'done').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased select-none">
      
      {/* GLOBAL SYSTEM TOPBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3.5 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* System Brand Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Workflow Hub</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-150 px-1.5 py-0.5 rounded">V1.0</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">多项目工作流管理与团队协同系统</p>
            </div>
          </div>

          {/* Identity switcher & Hints */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[11px] text-slate-600 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>协同模式已开：写评论、操作任务将自动模拟当前选定成员的行为。</span>
            </div>

            {/* Current Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsIdentityDropdownOpen(!isIdentityDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-xs cursor-pointer select-none"
              >
                <span
                  className="w-2 h-2 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: currentMember.avatarColor }}
                />
                <span className="max-w-20 sm:max-w-none truncate">我是: {currentMember.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </button>

              {isIdentityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="p-2.5 bg-slate-50 text-[10px] font-bold text-slate-400 tracking-wider">
                    切换操作员身份 (模拟团队协作)
                  </div>
                  <div className="p-1 space-y-1">
                    {members.map(member => {
                      const isMe = member.id === currentMemberId;
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleSwitchMember(member.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-left text-xs font-medium hover:bg-slate-50 transition cursor-pointer ${
                            isMe ? 'bg-blue-50/50 text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: member.avatarColor }}
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px]">{member.name}</p>
                              <p className="text-[9px] text-slate-400 truncate">{member.role.toUpperCase()}</p>
                            </div>
                          </div>
                          {isMe && <span className="text-[10px] text-blue-600 font-bold font-mono">ACTIVE</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* WORKSPACE AREA CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 overflow-x-hidden space-y-6">
        
        {currentProject === null ? (
          
          /* VIEW 1: PROJECTS PORTFOLIO OVERVIEW */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <ProjectList
              projects={projects}
              tasks={tasks}
              members={members}
              onSelectProject={setSelectedProjectId}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              currentMember={currentMember}
            />
          </div>

        ) : (

          /* VIEW 2: SINGLE PROJECT WORKSPACE */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            
            {/* Project Context Subheader */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              
              <div className="space-y-3 flex-1">
                {/* Back Link */}
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>返回项目大厅</span>
                </button>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-slate-850 leading-tight">{currentProject.name}</h2>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-3xl">{currentProject.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap font-medium">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    周期: {currentProject.startDate} ~ {currentProject.endDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    团队: {currentProject.memberIds.length} 名成员
                  </span>
                </div>
              </div>

              {/* Progress visualizer on right */}
              <div className="w-full md:w-52 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2.5 shrink-0 self-center">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>总进度</span>
                  <span className="text-blue-700 font-bold">{getProjectProgress(currentProject.id)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProjectProgress(currentProject.id)}%` }}
                  />
                </div>
              </div>

            </div>

            {/* TAB SYSTEM NAVIGATION */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'border-slate-900 text-slate-900 bg-white/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trello className="w-4 h-4" />
                <span>任务看板 (Kanban)</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'border-slate-900 text-slate-900 bg-white/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>甘特排期 (Timeline)</span>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer ${
                  activeTab === 'team'
                    ? 'border-slate-900 text-slate-900 bg-white/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>团队协同与负载 (Team Workload)</span>
              </button>
            </div>

            {/* VIEW SEGMENTS */}
            <div className="transition-all duration-200">
              {activeTab === 'kanban' && (
                <KanbanBoard
                  project={currentProject}
                  tasks={tasks}
                  members={members}
                  onSelectTask={setSelectedTaskId}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onCreateTask={handleCreateTask}
                  currentMember={currentMember}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  project={currentProject}
                  tasks={tasks}
                  members={members}
                  onSelectTask={setSelectedTaskId}
                />
              )}

              {activeTab === 'team' && (
                <TeamDashboard
                  project={currentProject}
                  tasks={tasks}
                  members={members}
                  activities={activities}
                  currentMember={currentMember}
                  onSwitchMember={handleSwitchMember}
                  onAddActivity={(pId, action, details) => logActivity(pId, action, details)}
                />
              )}
            </div>

          </div>

        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-medium text-slate-400">
          <span>&copy; 2026 Workflow Hub. 保留所有权利。</span>
          <div className="flex items-center gap-3">
            <span>本地客户端数据自动留存 (LocalStorage)</span>
            <span>&bull;</span>
            <span className="text-slate-500 font-bold">高还原团队协作交互沙盒</span>
          </div>
        </div>
      </footer>

      {/* MODAL OVERLAYS */}
      {currentTask && (
        <TaskDetailModal
          task={currentTask}
          members={members}
          currentMember={currentMember}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

    </div>
  );
}
