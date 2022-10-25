import { NextSeo } from "next-seo";
import Layout from "@components/layout";
import Container from "@components/container";
import { useRouter } from "next/router";
import { getClient, usePreviewSubscription } from "@lib/sanity";
import defaultOG from "../public/img/opengraph.jpg";
import { postquery, configQuery } from "@lib/groq";
import GetImage from "@utils/getImage";
import PostList from "@components/postlist";
import Featured from "@components/featured";

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

  const featuredPost = posts.filter(item => item.featured) || null;

  //console.log(posts);
  const ogimage = siteConfig?.openGraphImage
    ? GetImage(siteConfig?.openGraphImage).src
    : defaultOG?.src;
  return (
    <>
      {posts && siteConfig && (
        <Layout {...siteConfig} fontStyle="font-serif">
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

          {featuredPost && featuredPost.length && (
            <Featured post={featuredPost[0]} pathPrefix="lifestyle" />
          )}

          <Container large>
            {featuredPost.length > 4 && (
              <>
                <div className="flex items-center justify-center mt-10">
                  <h3 className="text-2xl">
                    <strong>Featured</strong> Posts
                  </h3>
                </div>
                <div className="grid gap-10 mt-10 mb-20 lg:gap-10 md:grid-cols-3 lg:grid-cols-4 ">
                  {featuredPost.slice(1, 2).map(post => (
                    <div
                      className="md:col-span-2 md:row-span-2"
                      key={post._id}>
                      <PostList
                        post={post}
                        preloadImage={true}
                        pathPrefix="lifestyle"
                        fontSize="large"
                        aspect="custom"
                        fontWeight="normal"
                      />
                    </div>
                  ))}
                  {featuredPost.slice(2, 6).map(post => (
                    <PostList
                      key={post._id}
                      post={post}
                      aspect="landscape"
                      pathPrefix="lifestyle"
                      fontWeight="normal"
                      preloadImage={true}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-center mt-4">
              <h3 className="text-2xl">
                <strong>Our</strong> Latest
              </h3>
            </div>
            <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-4 ">
              {posts.map(post => (
                <PostList
                  key={post._id}
                  post={post}
                  fontWeight="normal"
                  pathPrefix="lifestyle"
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
