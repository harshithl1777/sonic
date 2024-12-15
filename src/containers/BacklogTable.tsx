'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, InboxIcon, NotepadText, RefreshCw, Search, Timer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type Contact = {
    name: string;
    email: string;
    labURL: string;
    university: string;
};
interface BacklogTableProps {
    scheduleEmailFn: Function;
    draftEmailFn: Function;
    refreshNotionDataFn: Function;
    data: Contact[];
    drafts: { [email: string]: string };
    isLoading: boolean;
}

type UniversityNames = 'Waterloo' | 'Toronto' | 'Western' | 'McMaster' | 'Laurier' | 'Queens' | 'Manitoba';

const universityColors = {
    Waterloo: 'text-amber-500',
    Toronto: 'text-blue-500',
    Western: 'text-violet-500',
    McMaster: 'text-rose-500',
    Laurier: 'text-indigo-400',
    Queens: 'text-yellow-400',
    Manitoba: 'text-amber-700',
};

export const BacklogTable: React.FC<BacklogTableProps> = ({
    refreshNotionDataFn,
    scheduleEmailFn,
    draftEmailFn,
    data,
    drafts,
    isLoading,
}) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pageIndex, setPageIndex] = React.useState(0);

    const columns: ColumnDef<Contact>[] = [
        {
            accessorKey: 'status',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Status
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: (_) => (
                <div className='dark:text-slate-200'>
                    <Button
                        variant='ghost'
                        className='h-8 w-28 mr-4 bg-stone-400 text-white dark:text-slate-900 hover:bg-stone-400 hover:text-slate-900'
                    >
                        <InboxIcon strokeWidth={2.25} />
                        Backlog
                    </Button>
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Name
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className='dark:text-slate-200 flex flex-row gap-2 items-center'>
                    <strong>{row.getValue('name')}</strong>
                    <Tooltip>
                        <TooltipTrigger>
                            {row.original.email in drafts && <div className='w-2 h-2 bg-blue-500 rounded-full' />}
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>Drafted</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Email
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <Popover>
                    <PopoverTrigger>
                        <div onClick={() => navigator.clipboard.writeText(row.getValue('email'))} className='lowercase'>
                            <p className='ml-[-8px] w-fit hover:cursor-pointer p-2 dark:text-slate-400 darkLhover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md'>
                                {row.getValue('email')}
                            </p>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='text-sm w-20 h-10 p-0 flex items-center justify-center rounded-lg'>
                        Copied
                    </PopoverContent>
                </Popover>
            ),
        },
        {
            accessorKey: 'university',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        University
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                    className={`${
                        (row.getValue('university') as string) in universityColors
                            ? universityColors[row.getValue('university') as UniversityNames]
                            : 'text-slate-200'
                    } font-medium`}
                >
                    {row.getValue('university')}
                </div>
            ),
        },
        {
            accessorKey: 'labURL',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Lab URL
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className='flex flex-row ml-[-8px] items-center gap-2 hover:cursor-pointer p-2 w-fit underline dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm'>
                    <a onClick={() => window.open(row.getValue('labURL'))}>Click to Open</a>
                </div>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row gap-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant='ghost'
                                        className='h-8 w-8 bg-orange-500 text-white dark:text-slate-900 hover:bg-orange-400 hover:text-slate-900 font-semibold'
                                        onClick={() => draftEmailFn(row.original)}
                                    >
                                        <span className='sr-only'>Draft</span>
                                        <NotepadText strokeWidth={2.25} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='bottom'>Draft</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant='ghost'
                                        className='h-8 w-8 mr-4 bg-violet-500 text-white dark:text-slate-900 hover:bg-violet-400 hover:text-slate-900 font-semibold'
                                        onClick={() => scheduleEmailFn(row.original)}
                                    >
                                        <span className='sr-only'>Schedule</span>
                                        <Timer strokeWidth={2.25} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='bottom'>Schedule</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];

    const [pageSize, setPageSize] = React.useState(5);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageSize: pageSize,
                pageIndex: pageIndex,
            },
        },
    });

    return (
        <div className='w-full !mt-2'>
            <div className='flex items-center py-4'>
                <Input
                    placeholder='Filter contacts by name...'
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className='max-w-sm'
                    startIcon={Search}
                />
                <div className='ml-auto flex gap-2'>
                    <Button variant='outline' disabled={isLoading} onClick={() => refreshNotionDataFn()}>
                        Refresh <RefreshCw />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline'>
                                {table.getState().pagination.pageSize} rows <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {[5, 10, 15, 20, 25].map((size) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={size}
                                        className='capitalize'
                                        checked={pageSize === size}
                                        onClick={() => setPageSize(size)}
                                    >
                                        {size}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline'>
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className='capitalize'
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className='rounded-md border max-h-[500px] overflow-y-auto'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length && !isLoading ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    {isLoading ? (
                                        [1, 2, 3, 4, 5, 6].map((_) => (
                                            <Skeleton className='bg-slate-800 w-full h-10 mb-2' key={_} />
                                        ))
                                    ) : (
                                        <>No results</>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='flex-1 text-sm text-muted-foreground'>
                    Rows {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getRowCount(),
                    )}{' '}
                    of {table.getFilteredRowModel().rows.length} total rows.
                </div>
                <div className='space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-10'
                        onClick={() => {
                            setPageIndex(pageIndex - 1);
                            table.previousPage();
                        }}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-10'
                        onClick={() => {
                            setPageIndex(pageIndex + 1);
                            table.nextPage();
                        }}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};
