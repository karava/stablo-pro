import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import client from "@lib/sanity";
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

const fetcher = (query, params) => client.fetch(query, params);

const POSTS_PER_PAGE = 3;

export default function Post(props) {
  const { postdata, siteconfig: siteConfig, preview } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  // for next pages
  const [lastId, setLastID] = useState(null);
  const [lastPublishedAt, setLastPublishedAt] = useState(null);
  // for previous pages
  const [previousId, setPreviousID] = useState(null);
  const [previousPublishedAt, setPreviousPublishedAt] =
    useState(null);

  const [swrQuery, setSwrQuery] = useState(limitquery);

  const params = {
    limit: POSTS_PER_PAGE - 1,
    lastId: lastId,
    lastPublishedAt: lastPublishedAt
  };

  const {
    data: posts,
    error,
    isValidating
  } = useSWR([swrQuery, params], fetcher, {
    fallbackData: postdata,
    onSuccess: () => {
      setIsLoading(false);
      if (!isFirstPage) {
        setPreviousID(lastId);
        setPreviousPublishedAt(lastPublishedAt);
      }
      setLastID(posts[posts.length - 1]._id);
      setLastPublishedAt(posts[posts.length - 1].publishedAt);
    }
  });

  useEffect(() => {
    console.log(
      "isLoading -> ",
      isLoading,
      "isFirstPage -> ",
      isFirstPage,
      "isLastPage -> ",
      isLastPage,
      "lastId -> ",
      lastId,
      "lastPublishedAt -> ",
      lastPublishedAt,
      "previousId -> ",
      previousId,
      "previousPublishedAt -> ",
      previousPublishedAt
    );
  });

  useEffect(() => {
    if (posts.length < POSTS_PER_PAGE) {
      setIsLastPage(true);
    }
  }, [posts]);

  console.log("from swr", posts);

  const handleNextPage = () => {
    if (!posts.length) {
      return;
    }
    setIsLoading(true);
    setIsFirstPage(false);
    setSwrQuery(paginatedquery);
    setLastID(posts[posts.length - 1]._id);
    setLastPublishedAt(posts[posts.length - 1].publishedAt);
  };

  const handlePrevPage = () => {
    if (!posts.length) {
      return;
    }
    setIsLoading(true);

    if (!previousId || !previousPublishedAt) {
      setSwrQuery(limitquery);
      setIsFirstPage(true);
    } else {
      setLastID(previousId);
      setLastPublishedAt(previousPublishedAt);
      setSwrQuery(paginatedquery);
    }
  };

  //console.log(posts);
  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG.src;
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
            {isLoading && (
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
            )}
            {posts && !isLoading && (
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
                  className="relative inline-flex items-center gap-1 px-3 py-2 pr-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 disabled:pointer-events-none disabled:opacity-40 rounded-l-md hover:bg-gray-50 focus:z-20">
                  <ChevronLeftIcon
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={isLastPage}
                  className="relative inline-flex items-center gap-1 px-3 py-2 pl-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 disabled:pointer-events-none disabled:opacity-40 rounded-r-md hover:bg-gray-50 focus:z-20">
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

export async function getStaticProps() {
  const post = await client.fetch(limitquery, {
    limit: POSTS_PER_PAGE - 1
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
