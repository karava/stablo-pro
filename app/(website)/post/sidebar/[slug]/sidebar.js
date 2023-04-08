import { notFound } from "next/navigation";
import { PortableText } from "@/lib/sanity/plugins/portabletext";
import { urlForImage } from "@/lib/sanity/image";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import AuthorCard from "@/components/blog/authorCard";
import Sidebar from "@/components/sidebar";

export default function Post(props) {
  const { loading, post, categories } = props;

  const slug = post?.slug;

  if (!loading && !slug) {
    notFound();
  }
  const imageProps = post?.mainImage
    ? urlForImage(post?.mainImage)
    : null;

  const AuthorimageProps = post?.author?.image
    ? urlForImage(post.author.image)
    : null;

  return (
    <>
      <div className="relative flex items-center z-0 min-h-[calc(100vh-30vh)]">
        {imageProps && (
          <div className="absolute w-full h-full -z-10 before:bg-black/30 before:w-full before:h-full before:absolute before:z-10">
            <Image
              src={imageProps.src}
              loader={imageProps.loader}
              alt={post.mainImage?.alt || "Thumbnail"}
              loading="eager"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="max-w-screen-lg px-5 py-20 mx-auto text-center">
          <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-white lg:leading-tight text-brand-primary lg:text-5xl">
            {post.title}
          </h1>

          <div className="flex justify-center mt-8 space-x-3 text-gray-500 ">
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <div className="flex gap-3">
                <div className="relative flex-shrink-0 w-5 h-5">
                  {AuthorimageProps && (
                    <Link
                      href={`/author/${post.author.slug.current}`}>
                      <Image
                        src={AuthorimageProps.src}
                        loader={AuthorimageProps.loader}
                        alt={post?.author?.name}
                        className="object-cover rounded-full"
                        fill
                        sizes="100vw"
                      />
                    </Link>
                  )}
                </div>
                <p className="text-gray-100 ">
                  <Link href={`/author/${post.author.slug.current}`}>
                    {post.author.name}
                  </Link>{" "}
                  <span className="hidden pl-2 md:inline"> ·</span>
                </p>
              </div>

              <div>
                <div className="flex space-x-2 text-sm md:flex-row md:items-center">
                  <time
                    className="text-gray-100 "
                    dateTime={post?.publishedAt || post._createdAt}>
                    {format(
                      parseISO(post?.publishedAt || post._createdAt),
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
      <div className="flex flex-col max-w-screen-xl gap-5 px-5 mx-auto md:flex-row mt-14">
        <article className="flex-1">
          <div className="mx-auto my-3 prose prose-lg dark:prose-invert prose-a:text-blue-500">
            {post.body && <PortableText value={post.body} />}
          </div>
          <div className="flex justify-center mt-7 mb-7">
            <Link
              href="/"
              className="px-5 py-2 text-sm text-blue-600 rounded-full dark:text-blue-500 bg-brand-secondary/20 ">
              ← View all posts
            </Link>
          </div>
          {post.author && <AuthorCard author={post.author} />}
        </article>
        <aside className="sticky top-0 self-start w-full md:w-96">
          <Sidebar
            categories={categories}
            pathPrefix="sidebar"
            related={post.related.filter(
              item => item.slug.current !== slug
            )}
          />
        </aside>
      </div>
    </>
  );
}

const MainImage = ({ image }) => {
  return (
    <div className="mt-12 mb-12 ">
      <Image {...urlForImage(image)} alt={image.alt || "Thumbnail"} />
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
