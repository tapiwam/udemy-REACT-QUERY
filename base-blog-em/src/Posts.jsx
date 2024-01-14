import { useEffect, useState } from "react";

import { fetchPosts, deletePost, updatePost } from "./api";
import { PostDetail } from "./PostDetail";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();

  // When a page is loaded we want to prefetch the next page
  useEffect(() => {
    const nextPage = currentPage + 1;
    queryClient.prefetchQuery({
      queryKey: ["posts", nextPage, maxPostPage],
      queryFn: () => fetchPosts(nextPage, maxPostPage),
    });
  }, [currentPage, queryClient]);

  // Query to cache and manage posts
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", currentPage, maxPostPage],
    queryFn: () => fetchPosts(currentPage, maxPostPage),
    staleTime: 2000,
  });

  // Delete mutation to delete a post
  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
  });

  // Update mutation to update a post
  const updateMutation = useMutation({
    mutationFn: (postId) => updatePost(postId),
  });

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  if (isError) {
    return (
      <>
        <h3>Oops, something went wrong!</h3>
        <p>{error.message}</p>
      </>
    );
  }

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => {
              setSelectedPost(post);
              deleteMutation.reset();
              updateMutation.reset();
            }}
          >
            {post.title}
          </li>
        ))}
      </ul>

      <div className="pages">
        <button
          disabled={currentPage <= 0}
          onClick={() => {
            currentPage > 0 && setCurrentPage(currentPage - 1);
            setSelectedPost(null);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        <button
          disabled={data.length <= 0 || data.length < maxPostPage}
          onClick={() => {
            setCurrentPage(currentPage + 1);
            setSelectedPost(null);
          }}
        >
          Next page
        </button>
      </div>

      <hr />
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          deleteMutation={deleteMutation}
          updateMutation={updateMutation}
        />
      )}
    </>
  );
}
