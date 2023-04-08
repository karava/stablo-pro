import Container from "@/components/container";
import { PortableText } from "@/lib/sanity/plugins/portabletext";
import { urlForImage } from "@/lib/sanity/image";
import PostList from "@/components/postlist";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function Author(props) {
  const { loading, posts, author } = props;

  const slug = author?.slug;

  if (!loading && !slug) {
    notFound();
  }

  return (
    <>
      <Container>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 overflow-hidden rounded-full">
            {author?.image && (
              <Image
                src={urlForImage(author.image).src}
                alt={author.name || " "}
                fill
                sizes="(max-width: 320px) 100vw, 320px"
                className="object-cover"
              />
            )}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-3xl dark:text-white">
            {author.name}
          </h1>
          <div className="flex max-w-xl px-5 mx-auto mt-2 text-center text-gray-500">
            {author.bio && <PortableText value={author.bio} />}
          </div>
        </div>
        <div className="grid gap-10 mt-16 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
          {posts.map(post => (
            <PostList key={post._id} post={post} aspect="square" />
          ))}
        </div>
      </Container>
    </>
  );
}
