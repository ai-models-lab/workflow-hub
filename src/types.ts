export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type MemberRole = 'project_manager' | 'developer' | 'designer' | 'qa' | 'product_owner';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  email: string;
  avatarColor: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string;
  createdAt: string;
  subtasks: Subtask[];
  comments: Comment[];
  activityLog: Activity[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  memberIds: string[];
  ownerId: string;
  createdAt: string;
}
