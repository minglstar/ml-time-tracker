export interface Project {
  id: string;
  name: string;
  color: string; // hex color string
  description: string;
}

export interface TimeSegment {
  startTime: number; // 时间段开始时间戳
  endTime: number; // 时间段结束时间戳
  duration: number; // 持续时间（秒）
}

export interface TimerRecord {
  id: string;
  date: string;
  title: string;
  time: number;
  timeSegments: TimeSegment[];
  earned?: string;
  customer?: string;
  projectId?: string; // Optional to maintain backward compatibility
  createdAt: number; // Record creation timestamp
}

export interface TimerState {
  isRunning: boolean;
  time: number;
  lastUpdated?: number;
  title?: string;
  earned?: string;
  customer?: string;
}

export interface TaskInfo {
  title: string;
  earned: string;
  customer: string;
}

export interface ChromeMessage {
  type: string;
  data: any;
}
