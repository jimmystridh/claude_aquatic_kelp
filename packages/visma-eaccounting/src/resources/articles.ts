import { VismaEAccountingClient } from '../client';
import {
  Article,
  CreateArticleRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class ArticlesResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all articles (products) with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Article>> {
    return this.client.get<PaginatedResponse<Article>>('/v2/articles', params);
  }

  /**
   * Get a single article by ID
   */
  async get(id: string): Promise<Article> {
    return this.client.get<Article>(`/v2/articles/${id}`);
  }

  /**
   * Create a new article
   */
  async create(data: CreateArticleRequest): Promise<Article> {
    return this.client.post<Article>('/v2/articles', data);
  }

  /**
   * Update an existing article
   */
  async update(id: string, data: Partial<Article>): Promise<Article> {
    return this.client.put<Article>(`/v2/articles/${id}`, data);
  }

  /**
   * Delete an article
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/articles/${id}`);
  }

  /**
   * Search articles by name or article number
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Article>> {
    return this.client.get<PaginatedResponse<Article>>('/v2/articles', {
      ...params,
      name: query,
    });
  }
}
