import Container from "@/components/container";
import PostList from "@/components/postlist";

export default function Post({ posts }) {
  return (
    <>
      {posts && (
        <Container>
          <div className="grid gap-10 lg:gap-10 md:grid-cols-2 ">
            {posts.slice(0, 2).map(post => (
              <PostList
                key={post._id}
                post={post}
                aspect="landscape"
                preloadImage={true}
              />
            ))}
          </div>
          <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
            {posts.slice(2).map(post => (
              <PostList key={post._id} post={post} aspect="square" />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
