import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import { useRouter } from "next/router";
import { getClient, usePreviewSubscription } from "@lib/sanity";
import defaultOG from "../public/img/opengraph.jpg";
import { postquery, configQuery } from "@lib/groq";
import GetImage from "@utils/getImage";
import PostAlt from "@components/postalt";

export default function Post(props) {
  const { postdata, siteconfig, preview } = props;

  const router = useRouter();
  //console.log(router.query.category);

  const { data: posts } = usePreviewSubscription(postquery, {
    initialData: postdata,
    enabled: preview || router.query.preview !== undefined
  });

  const { data: siteConfig } = usePreviewSubscription(configQuery, {
    initialData: siteconfig,
    enabled: preview || router.query.preview !== undefined
  });
  //console.log(posts);
  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG?.src;
  return (
    <>
      {posts && siteConfig && (
        <Layout {...siteConfig} alternate={true}>
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
          <div className="flex flex-col max-w-5xl px-8 pb-16 mx-auto pt-14 sm:px-10 lg:px-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Our Blog
              </h1>
              <h2 className="px-10 mt-6 text-xl font-medium text-gray-500">
                This is where we talk things &amp; speak our mind.
              </h2>
            </div>
          </div>
          <Container alt={true}>
            <div className="hidden lg:px-12 lg:block">
              <h3 className="font-medium text-gray-600">
                Most Recent
              </h3>
            </div>
            <div className="grid gap-10 lg:mt-5 lg:gap-12 lg:px-12">
              {posts.slice(0, 1).map(post => (
                <PostAlt
                  key={post._id}
                  post={post}
                  aspect="landscape"
                  featured={true}
                  preloadImage={true}
                />
              ))}
            </div>
            <div className="hidden mt-10 lg:px-12 lg:block">
              <h3 className="font-medium text-gray-600">
                Earlier Articles
              </h3>
            </div>
            <div className="grid gap-10 mt-10 lg:mt-5 lg:gap-12 lg:gap-y-16 md:grid-cols-2 lg:px-12">
              {posts.slice(1).map(post => (
                <PostAlt
                  key={post._id}
                  post={post}
                  aspect="landscape"
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
  const post = await getClient(preview).fetch(postquery);
  const config = await getClient(preview).fetch(configQuery);

  // const categories = (await client.fetch(catquery)) || null;

  return {
    props: {
      postdata: post,
      // categories: categories,
      siteconfig: { ...config },
      preview
    },
    revalidate: 10
  };
}
