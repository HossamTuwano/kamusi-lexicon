import { vi } from 'vitest';

export function createMockRepository() {
  return {
    create: vi.fn().mockImplementation((dto) => dto),
    save: vi.fn().mockImplementation((entity) => {
      if (Array.isArray(entity)) {
        return Promise.resolve(
          entity.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        );
      }
      return Promise.resolve({ ...entity, id: entity.id ?? 1 });
    }),
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
    count: vi.fn(),
    increment: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    delete: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(() => ({
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
      getOne: vi.fn().mockResolvedValue(null),
    })),
  };
}

export function createMockCache() {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}
