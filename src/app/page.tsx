"use client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clapperboard, Shuffle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") ?? "trending"
  );
  const [searchCreator, setSearchCreator] = useState(
    searchParams.get("creator") ?? ""
  );
  const [recommend, setRecommend] = useState(
    searchParams.get("recommend") ?? ""
  );
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(searchParams.get("page") ?? 1);
  const [count, setCount] = useState(searchParams.get("count") ?? 3);
  const [order, setOrder] = useState(searchParams.get("order") ?? "latest");
  const [quality, setQuality] = useState(searchParams.get("quality") ?? "sd");
  const [searchGif, setSearchGif] = useState(
    searchParams.get("gif") === "true" ? true : false
  );
  const [loadingVideos, setLoadingVideos] = useState([]); // Store new videos temporarily
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [creator, setCreator] = useState({ image: "", name: "" });
  const [tag, setTag] = useState("");
  const [lastPage, setLastPage] = useState(false);
  const [pages, setPages] = useState(1);
  const pathname = usePathname();
  const router = useRouter();
  async function fetchGifs() {
    setIsLoading(true);
    setLastPage(false);
    const response = await fetch(
      `/api/redgifs/search?query=${searchQuery}&page=${page}&count=${count}&order=${order}&gif=${searchGif}`
    );
    const data = await response.json();
    if (data.page === data.pages) {
      setLastPage(true);
    }
    console.log(data);
    const mergedGifs = data.gifs.map((gif, index) => ({
      ...gif,
      profileImageUrl: data.users[index]?.profileImageUrl,
    }));
    setPages(data.pages);
    setLoadingVideos(mergedGifs || []);
  }

  async function fetchAuthor(creator: string | null = null) {
    if (creator) {
      setSearchCreator(creator);
    }
    setIsLoading(true);
    setSearchQuery("");
    setLastPage(false);
    const response = await fetch(
      `/api/redgifs/users?creator=${
        creator ?? searchCreator
      }&page=${page}&count=${count}&order=${order}`
    );
    const data = await response.json();
    if (data.page === data.pages) {
      setLastPage(true);
    }
    setCreator({
      name: data?.users[0].username,
      image: data?.users[0]?.profileImageUrl,
    });

    setPages(data.pages);
    setLoadingVideos(data?.gifs || []);
  }

  async function fetchTags() {
    setIsLoading(true);
    setSearchQuery("");
    setSearchCreator("");
    setTag("");
    setLastPage(false);
    setPage(1);
    const response = await fetch(
      `/api/redgifs/tags?page=${page}&count=${count}&order=${order}`
    );
    const data = await response.json();
    console.log(data);
    setTag(data.tag);
    router.push(
      `${pathname}?tag=${data.tag}&page=${page}&count=${count}&order=${order}&quality=${quality}`
    );
    setPages(data.pages);
    setLoadingVideos(data.gifs || []);
  }

  async function fetchTag() {
    setIsLoading(true);
    setSearchQuery("");
    setSearchCreator("");
    setTag("");
    setLastPage(false);
    const response = await fetch(
      `/api/redgifs/tag?tag=${tag}&page=${page}&count=${count}&order=${order}`
    );
    const data = await response.json();
    setPages(data.pages);
    setLoadingVideos(data.gifs || []);
  }

  async function fetchRecommend() {
    setIsLoading(true);
    setSearchQuery("");
    setSearchCreator("");
    setTag("");
    setLastPage(false);
    const response = await fetch(
      `/api/redgifs/recommend?recommend=${encodeURIComponent(
        recommend
      )}&page=${page}&count=${count}`
    );

    const data = await response.json();
    console.log(data);
    setPages(data.pages);
    setLoadingVideos(data.gifs.slice(0, 3) || []);
  }

  useEffect(() => {
    const queryParam = searchParams.get("query") ?? "";
    const creatorParam = searchParams.get("creator") ?? "";
    const tagParam = searchParams.get("tag") ?? "";
    const pageParam = searchParams.get("page") ?? 1;
    const countParam = searchParams.get("count") ?? 3;
    const orderParam = searchParams.get("order") ?? "latest";
    const qualityParam = searchParams.get("quality") ?? "sd";
    const recommendParam = searchParams.get("recommend") ?? "";

    if (queryParam !== searchQuery) setSearchQuery(queryParam);
    if (creatorParam !== searchCreator) setSearchCreator(creatorParam);
    if (tagParam !== tag) setTag(creatorParam);
    if (pageParam !== page) setPage(Number(pageParam));
    if (countParam !== count) setCount(Number(countParam));
    if (orderParam !== order) setOrder(orderParam);
    if (qualityParam !== quality) setQuality(qualityParam);
    if (recommendParam !== recommend) setRecommend(recommendParam);

    if (creatorParam) {
      fetchAuthor(creatorParam);
    } else if (queryParam) {
      fetchGifs();
    } else if (tagParam) {
      fetchTag();
    } else if (recommendParam) {
      fetchRecommend();
    }

    // Ensure pagination state is correctly set
    setPage(Number(pageParam));
  }, [searchParams]);

  useEffect(() => {
    if (loadingVideos.length > 0) {
      const filteredVideos = loadingVideos.filter(
        (gif) => Object.hasOwn(gif, "cta") && gif.cta === null
      );

      setVideos(filteredVideos);
      setIsLoading(false);
    }
  }, [loadingVideos, quality]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log(e);
      if (e.key === "ArrowRight") {
        if (!lastPage) {
          updatePage(Number(page) + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (page > 1) {
          updatePage(Number(page) - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [page, lastPage]);

  const updatePage = (newPage: number) => {
    setPage(newPage);
    if (searchCreator) {
      router.push(
        `${pathname}?creator=${searchCreator}&page=${newPage}&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`
      );
    } else if (searchQuery) {
      router.push(
        `${pathname}?query=${searchQuery}&page=${newPage}&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`
      );
    } else if (tag) {
      router.push(
        `${pathname}?tag=${tag}&page=${newPage}&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`
      );
    } else if (recommend) {
      router.push(
        `${pathname}?recommend=${recommend}&page=${newPage}&count=${count}`
      );
    }
  };

  const updateOrder = (newOrder: string) => {
    setOrder(newOrder);
    if (searchCreator) {
      router.push(
        `${pathname}?creator=${searchCreator}&page=${page}&count=${count}&order=${newOrder}&quality=${quality}&gif=${searchGif}`
      );
    } else if (searchQuery) {
      router.push(
        `${pathname}?query=${searchQuery}&page=${page}&count=${count}&order=${newOrder}&quality=${quality}&gif=${searchGif}`
      );
    } else if (tag) {
      router.push(
        `${pathname}?tag=${searchQuery}&page=${page}&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`
      );
    }
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setPage(1);
    setLastPage(false);
    router.replace(
      `${pathname}?query=${searchQuery}&page=1&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`
    );
    if (searchCreator) {
      fetchAuthor();
    } else if (searchQuery) {
      fetchGifs();
    }
  };

  function buildQueryParams(params: Record<string, any>) {
    const query = new URLSearchParams();

    for (const key in params) {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        query.append(key, params[key]);
      }
    }

    return `?${query.toString()}`;
  }

  // useEffect(() => {
  //   setTimeout(() => {
  //     setPage(page + 1);
  //   }, 7000);
  // }, [page]);

  return (
    <main className="flex flex-col">
      <div className="grid h-dvh grid-rows-12 place-items-center">
        <div className="grid grid-cols-3 row-span-11">
          {videos.length > 0 ? (
            videos.map((gif) => (
              <div
                key={gif.id}
                className="relative grid grid-rows-[auto_1fr_auto] max-h-[calc(100vh-4rem)]"
              >
                <Link
                  href={`${pathname}?creator=${
                    gif?.userName
                  }&page=1&count=${count}&order=${"latest"}&quality=${quality}&gif=${searchGif}`}
                  className="flex items-center gap-2 p-2 row-start-1 col-start-1 col-end-2 z-10"
                >
                  <Avatar className="size-6 md:size-8 lg:size-10 bg-[#0b0b28]">
                    <Image
                      src={
                        gif?.profileImageUrl ||
                        creator?.image ||
                        "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M26.6666%2028V25.3333C26.6666%2023.9188%2026.1047%2022.5623%2025.1045%2021.5621C24.1043%2020.5619%2022.7477%2020%2021.3333%2020H10.6666C9.2521%2020%207.89554%2020.5619%206.89535%2021.5621C5.89515%2022.5623%205.33325%2023.9188%205.33325%2025.3333V28'%20stroke='%23E5194D'%20stroke-width='3'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M16.0001%2014.6667C18.9456%2014.6667%2021.3334%2012.2789%2021.3334%209.33333C21.3334%206.38781%2018.9456%204%2016.0001%204C13.0546%204%2010.6667%206.38781%2010.6667%209.33333C10.6667%2012.2789%2013.0546%2014.6667%2016.0001%2014.6667Z'%20stroke='%23E5194D'%20stroke-width='3'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e"
                      }
                      height={100}
                      width={100}
                      alt=""
                      className="object-cover"
                    />
                  </Avatar>
                  <span className="text-xs md:text-sm lg:text-base">
                    {gif?.userName || creator.name}
                  </span>
                </Link>
                <video
                  className="object-cover w-full h-full row-start-1 row-end-4 col-start-1 col-end-2 "
                  autoPlay
                  loop
                  preload="auto"
                  // poster={gif.urls.thumbnail}
                  src={gif.urls?.silent || gif.url?.sd}
                />

                <Link
                  href={`${pathname}?recommend=${gif.id}&page=${1}&count=${3}`}
                  className="flex items-center gap-2 p-2 row-start-3 row-end-4 col-start-1 col-end-2 z-10 text-xs md:text-sm lg:text-base"
                  onClick={() => setRecommend(gif.id)}
                >
                  <Clapperboard />
                  More
                </Link>
              </div>
            ))
          ) : (
            <>
              <div className="relative grid grid-rows-[auto_1fr_auto] h-[calc(100vh-4rem)] animate-pulse bg-neutral-900"></div>
              <div className="relative grid grid-rows-[auto_1fr_auto] h-[calc(100vh-4rem)] animate-pulse bg-neutral-900"></div>
              <div className="relative grid grid-rows-[auto_1fr_auto] h-[calc(100vh-4rem)] animate-pulse bg-neutral-900"></div>
            </>
          )}
        </div>
        <Pagination className="row-span-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`${pathname}?query=${searchQuery}&page=${
                  page + -1
                }&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`}
                className={
                  page === 1 || isLoading
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              ></PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: pages }).map((_, i) => {
              const pageNumber = i + 1;
              const isVisible =
                pageNumber === 1 ||
                pageNumber === pages ||
                (pageNumber >= page - 1 && pageNumber <= page + 1);

              if (isVisible) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={`${pathname}?query=${searchQuery}&page=${pageNumber}&count=${count}&order=${order}&quality=${quality}&gif=${searchGif}`}
                      isActive={page === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                (pageNumber === page - 2 && page > 3) ||
                (pageNumber === page + 2 && page < pages - 2)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${pageNumber}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              } else {
                return null;
              }
            })}

            <PaginationItem>
              <PaginationNext
                href={`${pathname}${buildQueryParams({
                  query: searchQuery,
                  creator: searchCreator,
                  recommend: recommend,
                  page: Number(page) + 1,
                  count: count,
                  order: order,
                  quality: quality,
                  gif: searchGif ? "true" : "false",
                })}`}
                className={
                  lastPage || isLoading ? "pointer-events-none opacity-50" : ""
                }
              >
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div>
        <div className="flex flex-col">
          <Link href={`/`} className="text-4xl font-bold">
            Goonificator
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-2"
        >
          <Input
            id="query"
            placeholder="Query"
            defaultValue={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Input
            placeholder="Creator"
            defaultValue={searchCreator}
            onChange={(e) => setSearchCreator(e.target.value)}
          />
          <Input
            placeholder="Tag"
            defaultValue={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <Checkbox
            defaultChecked={searchGif}
            onCheckedChange={(e) => setSearchGif(e)}
          />
          <Select defaultValue={order} onValueChange={updateOrder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="top28">Month</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          {/* <Input
          type="number"
          defaultValue={count}
          onChange={(e) => setCount(e.target.value)}
        /> */}
          <Button>Search</Button>
          <Button type="button" onClick={fetchTags}>
            <Shuffle />
            Random
          </Button>
          <div className="flex items-center space-x-2">
            {/* <Checkbox id="quality" />
          <label
            htmlFor="quality"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            onChange={() => setQuality(quality === "sd" ? "hd" : "sd")}
          ></label> */}
          </div>
        </form>
      </div>
      {/* 
      songs :
      https://www.youtube.com/watch?v=Y9wfhUz8-x8
      https://www.youtube.com/watch?v=mrQmqR7NxDI
      https://www.youtube.com/watch?v=gDuCIDJtpjo
      https://www.youtube.com/watch?v=5hqdMSjDgJo
      https://www.youtube.com/watch?v=KynkMn5Hv3Q

      creators:
      gmxxxx
      fullyaquadic
      */}
    </main>
  );
}
