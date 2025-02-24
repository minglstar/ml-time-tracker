import { create } from 'zustand';
import { TimerRecord } from '../types/types';
import { storageUtils } from '../utils/storage';
import { generateId } from '../utils/idGenerator';
import { useTaskStore } from './taskStore';
import { useTimerStore } from './timerStore';

interface RecordStore {
  // 记录状态
  records: TimerRecord[];

  // 操作方法
  saveRecord: (title: string, time: number, projectId: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  continueRecord: (record: TimerRecord) => void;
  loadRecords: () => Promise<void>;
}

export const useRecordStore = create<RecordStore>((set, get) => ({
  // 初始状态
  records: [],

  // 记录操作
  saveRecord: async (title: string, time: number, projectId: string) => {
    const trimmedTitle = title.trim() || '未命名任务';
    // 使用本地时间获取时间戳
    const now = new Date();
    const currentTime = now.getTime();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    // 查找当天是否存在相同标题和项目的记录
    const existingRecord = get().records.find(
      record =>
        record.date === currentDate &&
        record.title === trimmedTitle &&
        record.projectId === projectId
    );

    if (existingRecord) {
      // 更新现有记录
      const updatedRecord = {
        ...existingRecord,
        time: existingRecord.time + time,
        timeSegments: [
          ...existingRecord.timeSegments,
          {
            startTime: currentTime - time * 1000,
            endTime: currentTime,
            duration: time,
          },
        ],
      };

      const records = get().records.map(record =>
        record.id === existingRecord.id ? updatedRecord : record
      );
      set({ records });
      await storageUtils.saveTimerRecords(records);
    } else {
      // 创建新记录
      const newRecord: TimerRecord = {
        id: generateId(),
        title: trimmedTitle,
        time,
        date: currentDate,
        timeSegments: [
          {
            startTime: currentTime - time * 1000,
            endTime: currentTime,
            duration: time,
          },
        ],
        projectId,
        createdAt: currentTime,
      };

      const records = [newRecord, ...get().records];
      set({ records });
      await storageUtils.saveTimerRecords(records);
    }
  },

  deleteRecord: async (id: string) => {
    const records = get().records.filter(record => record.id !== id);
    set({ records });
    await storageUtils.saveTimerRecords(records);
  },

  continueRecord: (record: TimerRecord) => {
    const taskStore = useTaskStore.getState();
    const timerStore = useTimerStore.getState();

    // 设置任务信息
    taskStore.setTitle(record.title);
    taskStore.setSelectedProject(record.projectId ?? '');

    // 重置并启动计时器
    void timerStore.reset().then(() => {
      void timerStore.startStop();
    });
  },

  loadRecords: async () => {
    const records = await storageUtils.getTimerRecords();
    set({ records });
  },
}));
