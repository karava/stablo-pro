import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import { useRouter } from "next/router";
import client, {
  getClient,
  usePreviewSubscription,
  PortableText
} from "@lib/sanity";
import ErrorPage from "next/error";
import defaultOG from "../../public/img/opengraph.jpg";
import {
  postsbyauthorquery,
  authorsquery,
  configQuery
} from "@lib/groq";
import GetImage from "@utils/getImage";
import PostList from "@components/postlist";
import Image from "next/image";

export default function Category(props) {
  const { postdata, siteconfig, preview } = props;
  console.log(props);
  const router = useRouter();
  const { author } = router.query;

  const { data: posts } = usePreviewSubscription(postsbyauthorquery, {
    params: { slug: author },
    initialData: postdata,
    enabled: preview || router.query.preview !== undefined
  });

  const { data: siteConfig } = usePreviewSubscription(configQuery, {
    initialData: siteconfig,
    enabled: preview || router.query.preview !== undefined
  });

  if (!router.isFallback && !posts.length) {
    return <ErrorPage statusCode={404} />;
  }

  const authorInfo = posts?.[0]?.author;
  console.log(authorInfo);

  const { width, height, ...imgprops } = GetImage(authorInfo?.image);

  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG.src;
  return (
    <>
      {posts && siteConfig && (
        <Layout {...siteConfig}>
          <NextSeo
            title={`${siteConfig?.title}`}
            description={siteConfig?.description || ""}
            canonical={siteConfig?.url}
            openGraph={{
              url: siteConfig?.url,
              title: `${siteConfig?.title}`,
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
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 overflow-hidden rounded-full">
                <Image
                  {...imgprops}
                  alt={author.name || " "}
                  layout="fill"
                  objectFit="cover"
                  sizes="(max-width: 320px) 100vw, 320px"
                />
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-3xl dark:text-white">
                {authorInfo.name}
              </h1>
              <div className="flex max-w-xl px-5 mx-auto mt-2 text-center text-gray-500">
                {authorInfo.bio && (
                  <PortableText value={authorInfo.bio} />
                )}
              </div>
            </div>
            <div className="grid gap-10 mt-16 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
              {posts.map(post => (
                <PostList
                  key={post._id}
                  post={post}
                  aspect="square"
                />
              ))}
            </div>
          </Container>
        </Layout>
      )}
    </>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const post = await getClient(preview).fetch(postsbyauthorquery, {
    slug: params.author
  });
  const config = await getClient(preview).fetch(configQuery);

  return {
    props: {
      postdata: post,
      siteconfig: { ...config },
      preview
    },
    revalidate: 10
  };
}

export async function getStaticPaths() {
  const authors = await client.fetch(authorsquery);
  return {
    paths:
      authors?.map(page => ({
        params: {
          author: page.slug
        }
      })) || [],
    fallback: true
  };
}
