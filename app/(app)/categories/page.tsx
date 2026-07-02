"use client"

import { useState } from "react"
import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArchiveCategoryDialog } from "@/components/categories/archive-category-dialog"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { useCategoriesQuery } from "@/features/categories/hooks"
import { ICategory } from "@/features/categories/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatDateTime } from "@/lib/date"

const PAGE_SIZE = 20

export default function CategoriesPage() {
  const [tab, setTab] = useState<"active" | "archived">("active")
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const [archivingCategory, setArchivingCategory] = useState<ICategory | null>(null)

  // Reset to page 1 whenever search/tab change — adjusted during render (React's documented
  // pattern for this) rather than in an effect, which would cost an extra cascading render.
  const [prevQueryKey, setPrevQueryKey] = useState([search, tab])
  if (prevQueryKey[0] !== search || prevQueryKey[1] !== tab) {
    setPrevQueryKey([search, tab])
    setPage(1)
  }

  const categoriesQuery = useCategoriesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    archived: tab === "archived",
  })

  const items = categoriesQuery.data?.items ?? []
  const totalPages = categoriesQuery.data?.totalPages ?? 1

  const openCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const openEdit = (category: ICategory) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(value) => setTab(value as "active" | "archived")}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <InputGroup className="w-48">
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search categories"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </InputGroup>
          <Button onClick={openCreate}>
            <PlusIcon /> New category
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {categoriesQuery.isSuccess &&
                items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant={category.isArchived ? "outline" : "default"}>
                        {category.isArchived ? "Archived" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(category.updatedAtUtc)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => openEdit(category)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={
                            category.isArchived
                              ? `Restore ${category.name}`
                              : `Archive ${category.name}`
                          }
                          onClick={() => setArchivingCategory(category)}
                        >
                          {category.isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {categoriesQuery.isError && (
            <Empty className="py-10">
              <EmptyTitle>Couldn&apos;t load categories</EmptyTitle>
              <EmptyDescription>Please try again.</EmptyDescription>
            </Empty>
          )}

          {categoriesQuery.isSuccess && items.length === 0 && (
            <Empty className="py-10">
              <EmptyTitle>
                {search
                  ? "No categories match your search."
                  : tab === "archived"
                    ? "No archived categories."
                    : "No categories yet."}
              </EmptyTitle>
              {!search && tab === "active" && (
                <EmptyDescription>
                  Categories help you group transactions — create your first one.
                </EmptyDescription>
              )}
            </Empty>
          )}

          {categoriesQuery.isSuccess && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />
      <ArchiveCategoryDialog
        category={archivingCategory}
        onOpenChange={(open) => !open && setArchivingCategory(null)}
      />
    </div>
  )
}
