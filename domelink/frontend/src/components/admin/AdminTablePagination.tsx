import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

interface AdminTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function AdminTablePagination({ page, pageSize, total, onPageChange }: AdminTablePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pageNumbers.push(i);
    } else if (
      (i === page - 2 && page > 3) ||
      (i === page + 2 && page < totalPages - 2)
    ) {
      pageNumbers.push("...");
    }
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={e => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            aria-disabled={page === 1}
          />
        </PaginationItem>
        {pageNumbers.map((num, idx) =>
          num === "..." ? (
            <PaginationItem key={"ellipsis-" + idx}>
              <span className="px-2">…</span>
            </PaginationItem>
          ) : (
            <PaginationItem key={num}>
              <PaginationLink
                href="#"
                isActive={num === page}
                onClick={e => {
                  e.preventDefault();
                  if (num !== page) onPageChange(Number(num));
                }}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={e => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            aria-disabled={page === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
