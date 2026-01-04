/**
 * Tests for pagination utilities
 */

import { getPaginationMetadata } from '../pagination';

describe('pagination utilities', () => {
  describe('getPaginationMetadata', () => {
    it('should calculate correct metadata for first page', () => {
      const metadata = getPaginationMetadata(10, 1, 25);
      
      expect(metadata.currentPage).toBe(1);
      expect(metadata.totalPages).toBe(3);
      expect(metadata.totalItems).toBe(25);
      expect(metadata.pageSize).toBe(10);
      expect(metadata.hasNextPage).toBe(true);
      expect(metadata.hasPreviousPage).toBe(false);
      expect(metadata.startIndex).toBe(1);
      expect(metadata.endIndex).toBe(10);
    });

    it('should calculate correct metadata for middle page', () => {
      const metadata = getPaginationMetadata(10, 2, 25);
      
      expect(metadata.currentPage).toBe(2);
      expect(metadata.totalPages).toBe(3);
      expect(metadata.hasNextPage).toBe(true);
      expect(metadata.hasPreviousPage).toBe(true);
      expect(metadata.startIndex).toBe(11);
      expect(metadata.endIndex).toBe(20);
    });

    it('should calculate correct metadata for last page', () => {
      const metadata = getPaginationMetadata(10, 3, 25);
      
      expect(metadata.currentPage).toBe(3);
      expect(metadata.hasNextPage).toBe(false);
      expect(metadata.hasPreviousPage).toBe(true);
      expect(metadata.startIndex).toBe(21);
      expect(metadata.endIndex).toBe(25);
    });

    it('should handle empty results', () => {
      const metadata = getPaginationMetadata(10, 1, 0);
      
      expect(metadata.totalPages).toBe(0);
      expect(metadata.hasNextPage).toBe(false);
      expect(metadata.hasPreviousPage).toBe(false);
      expect(metadata.startIndex).toBe(1);
      expect(metadata.endIndex).toBe(0);
    });

    it('should handle single page', () => {
      const metadata = getPaginationMetadata(10, 1, 5);
      
      expect(metadata.totalPages).toBe(1);
      expect(metadata.hasNextPage).toBe(false);
      expect(metadata.hasPreviousPage).toBe(false);
      expect(metadata.endIndex).toBe(5);
    });
  });
});





