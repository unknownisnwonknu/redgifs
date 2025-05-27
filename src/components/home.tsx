"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();

  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [videosPage, setVideosPage] = useState(0);
  const [query, setQuery] = useState(searchParams.get("query") ?? "teen");

  interface MediaUrls {
    html: string;
    hd: string;
    thumbnail: string;
    poster: string;
    sd: string;
    silent: string;
  }

  interface MediaItem {
    avgColor: string;
    createDate: number;
    cta?: null | string;
    description: string;
    duration: number;
    gallery: null;
    hasAudio: boolean;
    height: number;
    hideHome: boolean;
    hideTrending: boolean;
    hls: boolean;
    id: string;
    likes: number;
    niches: string[];
    published: boolean;
    type: number;
    sexuality: string[];
    tags: string[];
    urls: MediaUrls;
    userName: string;
    verified: boolean;
    views: number;
    width: number;
    profileImageUrl: string;
  }

  useEffect(() => {
    setQuery(query);
    setVideosPage(0);
  }, [query]);

  useEffect(() => {
    async function fetchVideos() {
      const response = await fetch(
        `/api/redgifs/search?query=${query}&count=${50}&page=${1}&quality=${"sd"}`
      );
      const data = await response.json();
      setVideos(data.gifs);
      setVideosPage(0);
      console.log(data);
    }

    fetchVideos();
  }, [query]);

  {
    /* 
      songs :
      https://www.youtube.com/watch?v=Y9wfhUz8-x8
      https://www.youtube.com/watch?v=mrQmqR7NxDI
      https://www.youtube.com/watch?v=gDuCIDJtpjo
      https://www.youtube.com/watch?v=5hqdMSjDgJo
      https://www.youtube.com/watch?v=KynkMn5Hv3Q

      creators:
      gmxxxx
      fullyaquadic
      */
  }
  // useEffect(() => {
  //   setTimeout(() => {
  //     setVideosPage(videosPage + 1);
  //   }, 2000);
  // }, [videosPage]);

  return (
    <>
      <div className="grid grid-cols-3 row-span-11">
        {videos?.slice(videosPage, videosPage + 3)?.map((gif) => (
          <div
            key={gif.id}
            className="relative grid grid-rows-[auto_1fr_auto] max-h-[calc(100vh-4rem)]"
          >
            <video
              className="object-cover w-full h-full row-start-1 row-end-4 col-start-1 col-end-2 "
              autoPlay
              loop
              preload="metadata"
              // poster={gif.urls.thumbnail}
              src={`/api/redgifs/video?url=${encodeURIComponent(
                gif.urls.silent || gif.urls.sd
              )}`}
            />
          </div>
        ))}
      </div>
      <Pagination className="row-span-1">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setVideosPage(videosPage - 3)}>
              Previous
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setVideosPage(videosPage + 3)}>
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
