import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Layout from "@components/layout";
import Container from "@components/container";
import { useRouter } from "next/router";
import client, {
  getClient,
  usePreviewSubscription,
  PortableText
} from "@lib/sanity";
import ErrorPage from "next/error";
import GetImage from "@utils/getImage";
import { parseISO, format } from "date-fns";
import { NextSeo } from "next-seo";
import defaultOG from "/public/img/opengraph.jpg";

import { singlequery, configQuery, pathquery } from "@lib/groq";
import CategoryLabel from "@components/blog/category";
import AuthorCard from "@components/blog/authorCard";

export default function Post(props) {
  const { postdata, siteconfig, preview } = props;

  const router = useRouter();
  const { slug } = router.query;

  const { data: post } = usePreviewSubscription(singlequery, {
    params: { slug: slug },
    initialData: postdata,
    enabled: preview || router.query.preview !== undefined
  });

  const { data: siteConfig } = usePreviewSubscription(configQuery, {
    initialData: siteconfig,
    enabled: preview || router.query.preview !== undefined
  });

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  const imageProps = post?.mainImage
    ? GetImage(post?.mainImage)
    : null;

  const AuthorimageProps = post?.author?.image
    ? GetImage(post.author.image)
    : null;

  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG?.src;

  return (
    <>
      {post && siteConfig && (
        <>
          <Layout
            {...siteConfig}
            alternate={true}
            fontStyle="font-serif">
            <NextSeo
              title={`${post.title} - ${siteConfig.title}`}
              description={post.excerpt || ""}
              canonical={`${siteConfig?.url}/post/${post.slug.current}`}
              openGraph={{
                url: `${siteConfig?.url}/post/${post.slug.current}`,
                title: `${post.title} - ${siteConfig.title}`,
                description: post.excerpt || "",
                images: [
                  {
                    url: GetImage(post?.mainImage).src || ogimage,
                    width: 800,
                    height: 600,
                    alt: ""
                  }
                ],
                site_name: siteConfig.title
              }}
              twitter={{
                cardType: "summary_large_image"
              }}
            />

            <div className="relative flex items-center z-0 min-h-[calc(100vh-30vh)]">
              {imageProps && (
                <div className="absolute w-full h-full -z-10 before:bg-black/30 before:w-full before:h-full before:absolute before:z-10">
                  <Image
                    src={imageProps.src}
                    loader={imageProps.loader}
                    blurDataURL={imageProps.blurDataURL}
                    alt={post.mainImage?.alt || "Thumbnail"}
                    placeholder="blur"
                    layout="fill"
                    loading="eager"
                    objectFit="cover"
                  />
                </div>
              )}

              <div className="max-w-screen-md px-5 py-20 mx-auto">
                <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-white lg:leading-tight text-brand-primary lg:text-5xl">
                  {post.title}
                </h1>

                <div className="flex mt-8 space-x-3 text-gray-500 ">
                  <div className="flex flex-col gap-3 md:items-center md:flex-row">
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0 w-5 h-5">
                        {AuthorimageProps && (
                          <Link
                            href={`/author/${post.author.slug.current}`}>
                            <a>
                              <Image
                                src={AuthorimageProps.src}
                                blurDataURL={
                                  AuthorimageProps.blurDataURL
                                }
                                loader={AuthorimageProps.loader}
                                objectFit="cover"
                                alt={post?.author?.name}
                                placeholder="blur"
                                layout="fill"
                                className="rounded-full"
                              />
                            </a>
                          </Link>
                        )}
                      </div>
                      <p className="text-gray-100 ">
                        <Link
                          href={`/author/${post.author.slug.current}`}>
                          <a> {post.author.name}</a>
                        </Link>{" "}
                        <span className="hidden pl-2 md:inline">
                          {" "}
                          ·
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="flex space-x-2 text-sm md:flex-row md:items-center">
                        <time
                          className="text-gray-100 "
                          dateTime={
                            post?.publishedAt || post._createdAt
                          }>
                          {format(
                            parseISO(
                              post?.publishedAt || post._createdAt
                            ),
                            "MMMM dd, yyyy"
                          )}
                        </time>
                        <span className="text-gray-100">
                          · {post.estReadingTime || "5"} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* {post?.mainImage && <MainImage image={post.mainImage} />} */}
            <Container>
              <article className="max-w-screen-md mx-auto ">
                <div className="mx-auto my-3 prose prose-lg dark:prose-invert prose-a:text-blue-500">
                  {post.body && <PortableText value={post.body} />}
                </div>
                <div className="flex justify-center mt-7 mb-7">
                  <Link href="/">
                    <a className="px-5 py-2 text-sm text-blue-600 rounded-full dark:text-blue-500 bg-brand-secondary/20 ">
                      ← View all posts
                    </a>
                  </Link>
                </div>
                {post.author && <AuthorCard author={post.author} />}
              </article>
            </Container>
          </Layout>
        </>
      )}
    </>
  );
}

const MainImage = ({ image }) => {
  return (
    <div className="mt-12 mb-12 ">
      <Image {...GetImage(image)} alt={image.alt || "Thumbnail"} />
      <figcaption className="text-center ">
        {image.caption && (
          <span className="text-sm italic text-gray-600 dark:text-gray-400">
            {image.caption}
          </span>
        )}
      </figcaption>
    </div>
  );
};

export async function getStaticProps({ params, preview = false }) {
  //console.log(params);
  const post = await getClient(preview).fetch(singlequery, {
    slug: params.slug
  });

  const config = await getClient(preview).fetch(configQuery);

  return {
    props: {
      postdata: { ...post },
      siteconfig: { ...config },
      preview
    },
    revalidate: 10
  };
}

export async function getStaticPaths() {
  const allPosts = await client.fetch(pathquery);
  return {
    paths:
      allPosts?.map(page => ({
        params: {
          slug: page.slug
        }
      })) || [],
    fallback: true
  };
}
