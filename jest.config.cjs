module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/__mocks__/styleMock.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/test/**',
    '!src/**/*.d.ts',
  ],
  // 添加模拟模块的路径
  moduleDirectories: ['node_modules', 'src/test/__mocks__'],
  // 忽略特定文件夹
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  // 转换器配置
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true
    }]
  },
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}; 