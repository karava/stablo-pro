import Image from "next/image";
import Link from "next/link";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { PortableText } from "@/lib/sanity/plugins/portabletext";
import { urlForImage } from "@/lib/sanity/image";
import { parseISO, format } from "date-fns";
import AuthorCard from "@/components/blog/authorCard";

export default function Post(props) {
  const { loading, post } = props;

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
      <Container className="!p-0">
        <div className="max-w-screen-md px-5 mx-auto mt-10 ">
          <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-5xl dark:text-white">
            {post.title}
          </h1>

          <div className="flex mt-8 space-x-3 text-gray-500 ">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0 w-5 h-5">
                {AuthorimageProps && (
                  <Link href={`/author/${post.author.slug.current}`}>
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
              <div>
                <div className="flex items-center space-x-2 text-sm">
                  <p className="text-gray-800 dark:text-gray-400">
                    <Link
                      href={`/author/${post.author.slug.current}`}>
                      {post.author.name}
                    </Link>
                    ·
                  </p>
                  <time
                    className="text-gray-500 dark:text-gray-400"
                    dateTime={post?.publishedAt || post._createdAt}>
                    {format(
                      parseISO(post?.publishedAt || post._createdAt),
                      "MMMM dd, yyyy"
                    )}
                  </time>
                  <span>· {post.estReadingTime || "5"} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* {post?.mainImage && <MainImage image={post.mainImage} />} */}
      <Container>
        <article className="max-w-screen-md mx-auto ">
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
      </Container>
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
