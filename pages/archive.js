import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import client from "@lib/sanity";
import { useRouter } from "next/router";
import defaultOG from "../public/img/opengraph.jpg";
import { limitquery, paginatedquery, configQuery } from "@lib/groq";
import GetImage from "@utils/getImage";
import PostList from "@components/postlist";
import useSWR, { SWRConfig } from "swr";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import Image from "next/image";
// import SkeletonImg from "../public/img/skeleton.svg";

const fetcher = (query, params) => client.fetch(query, params);

const POSTS_PER_PAGE = 6;

export default function Post(props) {
  const { postdata, siteconfig: siteConfig, preview } = props;

  const router = useRouter();
  const { page } = router.query;
  const pageIndex = parseInt(page) || 1;

  const [isLoading, setIsLoading] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  // [(($pageIndex - 1) * 10)...$pageIndex * 10]{
  const params = {
    pageIndex: (pageIndex - 1) * POSTS_PER_PAGE,
    limit: pageIndex * POSTS_PER_PAGE
  };

  const {
    data: posts,
    error,
    isValidating
  } = useSWR([paginatedquery, params], fetcher, {
    fallbackData: postdata,
    onSuccess: () => {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    setIsFirstPage(pageIndex < 2);
  }, [pageIndex]);

  useEffect(() => {
    setIsLastPage(posts.length < POSTS_PER_PAGE);
  }, [posts]);

  const handleNextPage = () => {
    router.push(
      {
        pathname: "/archive",
        query: { page: pageIndex + 1 }
      },
      undefined,
      { shallow: true }
    );
  };

  const handlePrevPage = () => {
    router.push(
      {
        pathname: "/archive",
        query: { page: pageIndex - 1 }
      },
      undefined,
      { shallow: true }
    );
  };

  const myLoader = ({ src }) => {
    return src;
  };

  //console.log(posts);
  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG?.src;
  return (
    <>
      {siteConfig && (
        <Layout {...siteConfig}>
          <NextSeo
            title={`Blog — ${siteConfig?.title}`}
            description={siteConfig?.description || ""}
            canonical={siteConfig?.url}
            openGraph={{
              url: siteConfig?.url,
              title: `Blog — ${siteConfig?.title}`,
              description: siteConfig?.description || "",
              images: [
                {
                  url: ogimage,
                  width: 800,
                  height: 600,
                  alt: ""
                }
              ],
              site_name: "Stablo"
            }}
            twitter={{
              cardType: "summary_large_image"
            }}
          />
          <Container>
            <h1 className="text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-white">
              Archive
            </h1>
            <div className="text-center">
              <p className="mt-2 text-lg">
                See all posts we have ever written.
              </p>
            </div>
            {posts && posts?.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <span className="text-lg text-gray-500">
                  End of the result!
                </span>
              </div>
            )}
            {/* {isValidating && (
              <div className="flex items-center justify-center h-40">
                <svg
                  className="w-6 h-6 text-gray-500 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>{" "}
              </div>
            )} */}
            {isValidating && (
              <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3">
                {new Array(6).fill().map((item, index) => (
                  <div key={index}>
                    <SkeletonImg />
                  </div>
                ))}
              </div>
            )}
            {posts && !isLoading && !isValidating && (
              <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
                {posts.map(post => (
                  <PostList
                    key={post._id}
                    post={post}
                    aspect="square"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-center mt-10">
              <nav
                className="inline-flex -space-x-px rounded-md shadow-sm isolate"
                aria-label="Pagination">
                <button
                  disabled={isFirstPage}
                  onClick={handlePrevPage}
                  className="relative inline-flex items-center gap-1 px-3 py-2 pr-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 disabled:pointer-events-none disabled:opacity-40 rounded-l-md hover:bg-gray-50 focus:z-20 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500">
                  <ChevronLeftIcon
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={isLastPage}
                  className="relative inline-flex items-center gap-1 px-3 py-2 pl-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 disabled:pointer-events-none disabled:opacity-40 rounded-r-md hover:bg-gray-50 focus:z-20 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500">
                  <span>Next</span>
                  <ChevronRightIcon
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                </button>
              </nav>
            </div>
          </Container>
        </Layout>
      )}
    </>
  );
}

const SkeletonImg = () => {
  const style = `
   .dark svg#skeleton #colorbase {
      stop-color: #2d2d2d;
    }
    .dark svg#skeleton #colorhighlight {
      stop-color: #3d3d3d;
    }
`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      id="skeleton"
      aria-labelledby="loading-aria"
      viewBox="0 0 500 800"
      preserveAspectRatio="none">
      <title id="loading-aria">Loading...</title>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        clipPath="url(#clip-path)"
        style={{ fill: 'url("#fill")' }}
      />
      <defs>
        <clipPath id="clip-path">
          <rect x="0" y="0" rx="2" ry="2" width="505" height="505" />
          <rect x="0" y="623" rx="0" ry="0" width="480" height="18" />
          <rect x="0" y="568" rx="0" ry="0" width="154" height="21" />
          <rect
            x="-10"
            y="433"
            rx="2"
            ry="2"
            width="365"
            height="1"
          />
          <rect
            x="60"
            y="756"
            rx="0"
            ry="0"
            width="164"
            height="27"
          />
          <rect
            x="277"
            y="763"
            rx="0"
            ry="0"
            width="179"
            height="14"
          />
          <circle cx="20" cy="769" r="18" />
          <circle cx="250" cy="770" r="4" />
          <rect x="0" y="664" rx="0" ry="0" width="365" height="18" />
          <rect x="0" y="705" rx="0" ry="0" width="193" height="18" />
        </clipPath>
        <linearGradient id="fill">
          <stop
            offset="0.599964"
            stopColor="#f0f0f0"
            stopOpacity="1"
            id="colorbase">
            <animate
              attributeName="offset"
              values="-2; -2; 1"
              keyTimes="0; 0.25; 1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="1.59996"
            stopColor="#f7f7f7"
            stopOpacity="1"
            id="colorhighlight">
            <animate
              attributeName="offset"
              values="-1; -1; 2"
              keyTimes="0; 0.25; 1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="2.59996"
            stopColor="#f0f0f0"
            stopOpacity="1"
            id="colorbase">
            <animate
              attributeName="offset"
              values="0; 0; 3"
              keyTimes="0; 0.25; 1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export async function getStaticProps() {
  const post = await client.fetch(paginatedquery, {
    pageIndex: 0,
    limit: POSTS_PER_PAGE
  });
  const config = await client.fetch(configQuery);

  // const categories = (await client.fetch(catquery)) || null;

  return {
    props: {
      postdata: post,
      // categories: categories,
      siteconfig: { ...config }
    },
    revalidate: 10
  };
}
