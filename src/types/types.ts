export interface TimerRecord {
    id: string;
    date: string;
    title: string;
    time: number;
    earned?: string;
    customer?: string;
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