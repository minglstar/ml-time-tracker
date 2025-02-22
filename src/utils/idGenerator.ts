import { v4 as uuidv4 } from 'uuid';

/**
 * 生成一个新的唯一标识符
 * @returns 返回一个UUID v4格式的字符串
 */
export const generateId = (): string => {
    return uuidv4();
};