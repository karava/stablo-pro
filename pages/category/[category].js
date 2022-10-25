import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import { useRouter } from "next/router";
import client, {
  getClient,
  usePreviewSubscription
} from "@lib/sanity";
import ErrorPage from "next/error";
import defaultOG from "../../public/img/opengraph.jpg";
import {
  postsbycatquery,
  catpathquery,
  configQuery
} from "@lib/groq";
import GetImage from "@utils/getImage";
import PostList from "@components/postlist";

export default function Author(props) {
  const { postdata, siteconfig, preview } = props;
  // console.log(props);
  const router = useRouter();
  const { category } = router.query;

  const { data: posts } = usePreviewSubscription(postsbycatquery, {
    params: { slug: category },
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

  const categoryTitle =
    (
      posts &&
      posts[0]?.categories.filter(e => e.slug.current === category)[0]
    )?.title || category;

  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG?.src;
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
              <h1 className="text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-5xl dark:text-white">
                {categoryTitle}
              </h1>
              <p className="mt-1 text-gray-600">
                {posts.length} Articles
              </p>
            </div>
            <div className="grid gap-10 mt-20 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
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
  const post = await getClient(preview).fetch(postsbycatquery, {
    slug: params.category
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
  const category = await client.fetch(catpathquery);
  return {
    paths:
      category?.map(page => ({
        params: {
          category: page.slug
        }
      })) || [],
    fallback: true
  };
}
