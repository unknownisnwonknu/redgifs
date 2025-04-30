import Home from "@/components/home"; // Assure-toi que c'est bien le bon chemin d'importation.
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <main className="flex flex-col">
        <div className="grid h-dvh grid-rows-12 place-items-center">
          <Home />
        </div>
      </main>
    </Suspense>
  );
}

function HomeSkeleton() {
  return (
    <>
      <main className="flex flex-col">
        <div className="grid h-dvh grid-rows-12 place-items-center">
          <div className="grid grid-cols-3 row-span-11"></div>
        </div>
      </main>
      <Pagination className="row-span-1">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className={"pointer-events-none opacity-50"}>
              Previous
            </PaginationPrevious>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext className={"pointer-events-none opacity-50"}>
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
