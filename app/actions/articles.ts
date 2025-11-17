'use server';

import { getVismaClient } from '@/lib/visma';
import type { Article, CreateArticleRequest } from '@visma-eaccounting/client';

export async function getArticles(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.articles.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch articles',
    };
  }
}

export async function getArticle(id: string) {
  try {
    const client = getVismaClient();
    const article = await client.articles.get(id);
    return { success: true, data: article };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch article',
    };
  }
}

export async function createArticle(data: CreateArticleRequest) {
  try {
    const client = getVismaClient();
    const article = await client.articles.create(data);
    return { success: true, data: article };
  } catch (error) {
    console.error('Failed to create article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create article',
    };
  }
}

export async function updateArticle(id: string, data: Partial<Article>) {
  try {
    const client = getVismaClient();
    const article = await client.articles.update(id, data);
    return { success: true, data: article };
  } catch (error) {
    console.error('Failed to update article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update article',
    };
  }
}

export async function deleteArticle(id: string) {
  try {
    const client = getVismaClient();
    await client.articles.delete(id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete article',
    };
  }
}

export async function searchArticles(query: string, page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.articles.search(query, { page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to search articles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search articles',
    };
  }
}
