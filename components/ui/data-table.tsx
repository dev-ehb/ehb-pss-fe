'use client';

import { useState, type ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Skeleton } from './skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { RefreshButton } from './refresh-button';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  totalRows?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  enableGlobalFilter?: boolean;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  /** Below this width the table becomes stacked cards. Default 'xl' (1280px);
   *  use '2xl' for wide tables (many columns) so they don't cram on laptops. */
  cardBreakpoint?: 'lg' | 'xl' | '2xl';
  /** Pass the query's refetch to show a per-table refresh button in the footer. */
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Static class sets (Tailwind can't see dynamically-built class names).
const BREAKPOINT_CLASSES = {
  lg: { table: 'hidden overflow-x-auto lg:block', hide: 'lg:hidden' },
  xl: { table: 'hidden overflow-x-auto xl:block', hide: 'xl:hidden' },
  '2xl': { table: 'hidden overflow-x-auto 2xl:block', hide: '2xl:hidden' },
} as const;

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  totalRows,
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  enableGlobalFilter = true,
  onRowClick,
  emptyMessage = 'No records found.',
  cardBreakpoint = 'xl',
  onRefresh,
  isRefreshing,
}: DataTableProps<TData>) {
  const bp = BREAKPOINT_CLASSES[cardBreakpoint];
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const sorting = controlledSorting ?? internalSorting;
  const pagination = controlledPagination ?? internalPagination;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting,
    rowCount: totalRows,
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;
  const totalDisplayed = totalRows ?? table.getFilteredRowModel().rows.length;

  // Column header text keyed by column id — used as the field label in the
  // mobile card view (where there is no <thead> to show column names).
  const headerLabelById: Record<string, ReactNode> = {};
  table.getFlatHeaders().forEach((header) => {
    headerLabelById[header.column.id] = header.isPlaceholder
      ? null
      : flexRender(header.column.columnDef.header, header.getContext());
  });

  const rows = table.getRowModel().rows;

  // Card view has no clickable column headers, so expose sorting via a control.
  const sortableColumns = table.getAllLeafColumns().filter((c) => c.getCanSort());
  const activeSort = sorting[0];

  return (
    <div className="w-full rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {(enableGlobalFilter || onRefresh) && (
        <div className="flex items-center justify-between gap-2 border-b dark:border-gray-800 p-3">
          {enableGlobalFilter ? (
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          ) : (
            <span />
          )}
          {onRefresh && (
            <RefreshButton onClick={onRefresh} busy={isRefreshing} title="Refresh table" />
          )}
        </div>
      )}

      {/* Desktop: classic table (above the card breakpoint) */}
      <div className={bp.table}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400 dark:text-gray-500">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile sort bar — replaces the clickable column headers that the card view hides */}
      {sortableColumns.length > 0 && rows.length > 0 && (
        <div className={`flex items-center gap-2 border-b dark:border-gray-800 px-4 py-2.5 ${bp.hide}`}>
          <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">Sort by</span>
          <Select
            value={activeSort?.id ?? 'none'}
            onValueChange={(id) =>
              table.setSorting(id !== 'none' ? [{ id, desc: activeSort?.desc ?? false }] : [])
            }
          >
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {sortableColumns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            disabled={!activeSort}
            onClick={() =>
              activeSort && table.setSorting([{ id: activeSort.id, desc: !activeSort.desc }])
            }
            title={activeSort?.desc ? 'Descending — tap for ascending' : 'Ascending — tap for descending'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {activeSort?.desc ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Mobile / narrow desktop (<xl): each row as a stacked label/value card (no horizontal scroll) */}
      <div className={`divide-y divide-gray-100 dark:divide-gray-800 ${bp.hide}`}>
        {rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                'space-y-2 p-4',
                onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const label = headerLabelById[cell.column.id];
                return (
                  <div key={cell.id} className="flex items-start justify-between gap-3">
                    {label ? (
                      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {label}
                      </span>
                    ) : null}
                    <div
                      className={cn(
                        'min-w-0 text-sm text-gray-700 dark:text-gray-300',
                        label ? 'text-right' : 'flex-1',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalDisplayed > 0
            ? `Page ${currentPage} of ${Math.max(pageCount, 1)} · ${totalDisplayed} total`
            : 'No results'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
