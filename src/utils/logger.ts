// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 当前环境的日志级别设置
const currentLogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

// 日志工具类
export class Logger {
  private static instance: Logger;
  private context = 'App';

  private constructor() {}

  // 单例模式获取实例
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 设置上下文
  public setContext(context: string): Logger {
    this.context = context;
    return this;
  }

  // 格式化日志消息
  private formatMessage(message: string): string {
    return `[${this.context}] ${message}`;
  }

  // 调试日志
  public debug(message: string, ...args: any[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage(message), ...args);
    }
  }

  // 信息日志
  public info(message: string, ...args: any[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(this.formatMessage(message), ...args);
    }
  }

  // 警告日志
  public warn(message: string, ...args: any[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  // 错误日志
  public error(message: string, ...args: any[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage(message), ...args);
    }
  }
}

// 导出默认实例，方便直接使用
export const logger = Logger.getInstance();
