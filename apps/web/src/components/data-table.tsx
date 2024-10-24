"use client"


import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "./ui/multiselect";

import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
 // DropdownMenuLabel,
 // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

import { useEffect, useState } from "react";
import { getTopics } from "~/server/actions/get-topics";
import { getTags } from "~/server/actions/get-tags";

import {
  Dialog,
  DialogContent,
 // DialogDescription,
 // DialogHeader,
 // DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import Thread from "./thread";
//import { set } from "zod";

interface tagsProps {
  id: bigint;
  name: string;
  emoji: string | null;
}

type ColumnProps = {
  id: bigint;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: { name: string; emoji: string | null }[]; // Updated to allow null
};


const multiStringFilterFn = (
  row: Row<ColumnProps>,
  columnId: string,
  filterValue: string[]
): boolean => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }

  const tags = row.getValue<{ name: string; emoji: string }[]>(columnId);

  if (!tags || !Array.isArray(tags)) {
    return false;
  }

  const cellValues = tags.map((tag: { name: string; emoji: string }) => tag.name.toLowerCase());

  console.log('cell values', cellValues);
  console.log('filter values', filterValue);

  // Sprawdź, czy wszystkie wybrane wartości znajdują się w tagach wiersza
  return filterValue.every(value => cellValues.includes(value.toLowerCase()));
};



export const columns: ColumnDef<ColumnProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "content",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Temat
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("content")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "author",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nickname
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("author")}</div>,
  },
  {
    accessorKey: "tags",
    header: () => <div>Tags</div>,
    filterFn: multiStringFilterFn, 
    cell: ({ row }) => {
      const tags = row.getValue("tags") satisfies tagsProps[];
      if (!tags) {
        return <div></div>;
      }
      return (
        <div className="text-right font-medium flex">
          {tags.map((tag) => (
            <div key={tag.name} className="mx-1 p-1 bg-slate-800 rounded-md">
              {tag.emoji} {tag.name}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ 
      //row
     }) => {
      //const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            
            <DropdownMenuItem>Test option</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    id: "open",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;

      console.log('ttid', id);

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600">
              Otwórz
            </Button>
          </DialogTrigger>
        <DialogContent>
          <Thread id={id} />
        </DialogContent>
      </Dialog>
      )
    },
  },
]

export function DataTable()  {

  useEffect(() => {
    void (async () => {
      const res = await getTopics();
      if (!res?.data) return;
      setData(res.data);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const res = await getTags();
      if (!res?.data) return;
  
      try {
        const processedTags: tagsProps[] = res.data.map(tag => ({
          id: BigInt(tag.id), 
          name: tag.name,
          emoji: tag.emoji ?? '', 
        }));
  
        setTags(processedTags);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);




  const [data, setData] = useState<ColumnProps[]>([])
  const [tags, setTags] = useState<tagsProps[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
    },
  })

  const [valueMultiSelect,setValueMultiSelect ] = useState<string[]>([])

  const handleMultiSelect = (value: string[]) => {
    setValueMultiSelect(value)
    console.log(value)
    //table.getColumn("tags")?.setFilterValue(value)
    setColumnFilters([{ id: 'tags', value }]);
  }

  return (

    
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Wyszukaj"
          value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("content")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <MultiSelector values={valueMultiSelect} onValuesChange={handleMultiSelect} loop className="max-w-xs ml-4 ">
          <MultiSelectorTrigger>
            <MultiSelectorInput placeholder="Wybierz tagi" />
          </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList className="z-10 text-white bg-slate-950" >
           {tags.map((tag)=>{
            return (
              <MultiSelectorItem key={tag.id} value={tag.name}>{tag.emoji ?? '❓'}{tag.name}</MultiSelectorItem>
            )
           })}
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelector>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-950 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-gray-950 ">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Brak wyników.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground text-white">
          {table.getFilteredSelectedRowModel().rows.length} z {" "}
          {table.getFilteredRowModel().rows.length} wierszy wybrano.
        </div>
        <div className="space-x-2">
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
  )
}
