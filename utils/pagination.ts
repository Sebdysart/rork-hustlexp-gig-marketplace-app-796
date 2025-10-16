export const ITEMS_PER_PAGE = 20;

export function paginateArray<T>(array: T[], page: number, itemsPerPage: number = ITEMS_PER_PAGE): T[] {
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

export function getTotalPages<T>(array: T[], itemsPerPage: number = ITEMS_PER_PAGE): number {
  return Math.ceil(array.length / itemsPerPage);
}

export function hasMorePages<T>(array: T[], currentPage: number, itemsPerPage: number = ITEMS_PER_PAGE): boolean {
  return (currentPage + 1) * itemsPerPage < array.length;
}
