import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // 基本配置
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // 模块映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/__mocks__/styleMock.js',
  },

  // 测试文件匹配
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // 覆盖率收集
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts,tsx,jsx}', '!src/test/**', '!src/**/*.d.ts'],

  // 模块配置
  moduleDirectories: ['node_modules', 'src/test/__mocks__'],

  // 忽略路径
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // 转换器配置
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },

  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 监视模式配置（已注释，可根据需要启用）
  /*
  watchPathIgnorePatterns: ['node_modules'],
  watchAll: false,
  watch: true
  */
};

export default config;
