import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // // 启用监视模式，只运行修改过的文件的测试
  // watchPathIgnorePatterns: ['node_modules'],
  // // 在观察模式下显示交互式界面
  // watchAll: false,
  // // 默认只运行与更改文件相关的测试
  // watch: true
};

export default config;
