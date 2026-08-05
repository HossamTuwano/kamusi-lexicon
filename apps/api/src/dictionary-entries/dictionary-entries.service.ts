import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictionaryEntry } from './entities/dictionary-entry.entity';
import { CreateEntryDto, SearchDto } from './dto/entry.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class DictionaryEntriesService {
  constructor(
    @InjectRepository(DictionaryEntry)
    private entryRepo: Repository<DictionaryEntry>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async search(dto: SearchDto) {
    const { q, page = 1, limit = 20 } = dto;
    const offset = (page - 1) * limit;
    
    const normQ = q?.trim().toLowerCase() || '';

    const cacheKey = `search:${normQ}:${page}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const query = this.entryRepo.createQueryBuilder('entry');

    if (normQ) {
      query.andWhere(
        'entry.lemma % :q', 
        { q: normQ }
      );
      query.orderBy(`similarity(entry.lemma, :q)`, 'DESC');
    }

    query.andWhere('entry.is_hidden = false');
    query.skip(offset).take(limit);

    const results = await query.getMany();
    await this.cacheManager.set(cacheKey, results, 3600);
    
    return results;
  }

  async create(dto: CreateEntryDto, userId: number) {
    try {
      const entry = this.entryRepo.create({
        ...dto,
        language: 'sw',
        creatorId: userId,
        is_verified: false,
        vote_count: 0,
      });
      return await this.entryRepo.save(entry);
    } catch (e: any) {
      throw e;
    }
  }

  async findOne(id: number) {
    return this.entryRepo.findOne({ where: { id } });
  }

  async delete(id: number, userId: number) {
    const entry = await this.findOne(id);
    if (!entry) throw new NotFoundException();
    if (entry.creatorId !== userId || entry.is_verified) {
      throw new ForbiddenException('You can only delete your own unverified entries');
    }
    await this.entryRepo.remove(entry);
    return { deleted: true };
  }
}
