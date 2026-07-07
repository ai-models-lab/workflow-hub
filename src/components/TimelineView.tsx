import React from 'react';
import { Project, Task, Member } from '../types';
import { Calendar, Clock, AlertTriangle, ChevronRight, CheckSquare } from 'lucide-react';

interface TimelineViewProps {
  project: Project;
  tasks: Task[];
  members: Member[];
  onSelectTask: (taskId: string) => void;
}

export default function TimelineView({
  project,
  tasks,
  members,
  onSelectTask
}: TimelineViewProps) {
  const projectTasks = tasks.filter(t => t.projectId === project.id);

  // Helper to parse date
  const parseDate = (dStr: string) => {
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Timeline scope from project startDate to endDate
  const pStart = parseDate(project.startDate);
  const pEnd = parseDate(project.endDate);

  // Fallback if dates are invalid
  const projectStart = pStart.getTime() > pEnd.getTime() ? new Date('2026-06-01') : pStart;
  const projectEnd = pStart.getTime() > pEnd.getTime() ? new Date('2026-08-30') : pEnd;

  // Let's calculate total days in the project
  const diffTime = Math.abs(projectEnd.getTime() - projectStart.getTime());
  const projectDurationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;

  // Render month labels above the timeline
  const getMonthIntervals = () => {
    const intervals: { label: string; widthPercent: number }[] = [];
    let current = new Date(projectStart);

    while (current <= projectEnd) {
      const monthName = current.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      const endOfSegment = nextMonth > projectEnd ? projectEnd : nextMonth;

      const segmentDays = Math.ceil((endOfSegment.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      const widthPercent = (segmentDays / projectDurationDays) * 100;

      if (widthPercent > 2) {
        intervals.push({ label: monthName, widthPercent });
      }
      current = nextMonth;
    }
    return intervals;
  };

  const months = getMonthIntervals();

  // Helper to get task span style
  const getTaskStyle = (task: Task) => {
    const taskDue = parseDate(task.dueDate);

    // Approximate a start date (e.g., 6 days before due date, bounded by project start)
    const taskStart = new Date(taskDue.getTime() - 6 * 24 * 60 * 60 * 1000);
    const startBounded = taskStart < projectStart ? projectStart : taskStart;
    const dueBounded = taskDue > projectEnd ? projectEnd : taskDue;

    // Calculate left percentage
    const leftTime = startBounded.getTime() - projectStart.getTime();
    const leftDays = leftTime / (1000 * 60 * 60 * 24);
    const leftPercent = Math.max(0, Math.min(100, (leftDays / projectDurationDays) * 100));

    // Calculate width percentage
    const widthTime = dueBounded.getTime() - startBounded.getTime();
    const widthDays = Math.max(1, widthTime / (1000 * 60 * 60 * 24)); // at least 1 day width
    const widthPercent = Math.max(2, Math.min(100 - leftPercent, (widthDays / projectDurationDays) * 100));

    let colorBg = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300';
    if (task.status === 'done') {
      colorBg = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (task.priority === 'high') {
      colorBg = 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300';
    } else if (task.status === 'in_progress') {
      colorBg = 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300';
    } else if (task.status === 'in_review') {
      colorBg = 'bg-amber-50 hover:bg-amber-100 text-amber-850 border-amber-300';
    }

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      className: colorBg
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">甘特时间线</h3>
        <p className="text-xs text-slate-500 mt-1">项目任务的周期排期与交期图。点击色块可直达任务详情</p>
      </div>

      {projectTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
          目前本项目没有任务排期，去看板增加一个任务吧！
        </div>
      ) : (
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          {/* Timeline Grid Header (Months scale) */}
          <div className="flex bg-slate-50 border-b border-slate-200">
            <div className="w-1/3 md:w-1/4 p-3 border-r border-slate-200 shrink-0 font-bold text-xs text-slate-500">
              工作任务清单
            </div>
            <div className="w-2/3 md:w-3/4 flex relative">
              {months.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 text-center border-r border-slate-200/50 shrink-0 font-mono text-[10px] font-bold text-slate-500 truncate"
                  style={{ width: `${m.widthPercent}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid Rows */}
          <div className="divide-y divide-slate-150">
            {projectTasks.map(task => {
              const assignee = members.find(m => m.id === task.assigneeId);
              const pos = getTaskStyle(task);

              return (
                <div key={task.id} className="flex hover:bg-slate-50/50 transition duration-150">
                  {/* Task meta info on left */}
                  <div className="w-1/3 md:w-1/4 p-3 border-r border-slate-200 shrink-0 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <span
                        onClick={() => onSelectTask(task.id)}
                        className="text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer block line-clamp-1"
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.status === 'done' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">已完成</span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {task.status === 'in_progress' ? '进行中' : task.status === 'in_review' ? '审核中' : '待处理'}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400 font-mono">截止 {task.dueDate}</span>
                      </div>
                    </div>

                    {assignee && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0"
                          style={{ backgroundColor: assignee.avatarColor }}
                        >
                          {assignee.name[0]}
                        </span>
                        <span className="truncate">{assignee.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Visual timeline bar on right */}
                  <div className="w-2/3 md:w-3/4 p-4 relative flex items-center bg-slate-50/30">
                    {/* Inner vertical guideline grid */}
                    <div className="absolute inset-0 flex divide-x divide-slate-100 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-grow h-full" />
                      ))}
                    </div>

                    {/* Timeline slider block */}
                    <div
                      onClick={() => onSelectTask(task.id)}
                      className={`absolute h-7 rounded-md border text-[10px] px-2.5 font-semibold flex items-center justify-between shadow-xs transition duration-150 cursor-pointer select-none truncate ${pos.className}`}
                      style={{ left: pos.left, width: pos.width }}
                      title={`${task.title} (截止: ${task.dueDate})`}
                    >
                      <span className="truncate">{task.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1 opacity-60" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Summary Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Calendar className="w-4 h-4" />
            <span>项目周期</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{project.startDate} 至 {project.endDate}</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>项目总时长</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{projectDurationDays} 天</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span>总计任务数</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{projectTasks.length} 个任务</p>
        </div>
      </div>
    </div>
  );
}
