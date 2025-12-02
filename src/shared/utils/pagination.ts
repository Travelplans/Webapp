/**
 * Pagination utilities for Firestore queries
 */

import { Query, query, limit, startAfter, orderBy, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface PaginationOptions {
  pageSize: number;
  orderByField: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationState {
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  page: number;
}

/**
 * Creates a paginated query
 */
export const createPaginatedQuery = <T extends DocumentData>(
  baseQuery: Query<T>,
  options: PaginationOptions,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Query<T> => {
  let q = query(
    baseQuery,
    orderBy(options.orderByField, options.orderDirection || 'desc'),
    limit(options.pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  return q;
};

/**
 * Helper to get pagination metadata
 */
export const getPaginationMetadata = (
  pageSize: number,
  currentPage: number,
  totalItems: number
) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, totalItems),
  };
};

