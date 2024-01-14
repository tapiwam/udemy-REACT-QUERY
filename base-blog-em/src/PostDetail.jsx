import { useQuery } from "@tanstack/react-query";
import { fetchComments } from "./api";
import "./PostDetail.css";

export function PostDetail({ post, deleteMutation, updateMutation }) {
  // replace with useQuery
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments(post.id),
    staleTime: 2000,
  });

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  if (isError) {
    return (
      <>
        <h3>Oops, something went wrong. Cannot get comments!</h3>
        <p className="text-danger">{error.message}</p>
      </>
    );
  }

  if (!data) {
    return <></>;
  }

  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <div>
        <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
        {deleteMutation.isPending && <p className="loading">Deleting...</p>}
        {deleteMutation.isError && (
          <p className="error">
            Error Deleting Post: {deleteMutation.error.message}
          </p>
        )}
        {deleteMutation.isSuccess && (
          <p className="success">Post (not) Deleted</p>
        )}
      </div>

      <div>
        <button onClick={() => updateMutation.mutate(post.id)}>
          Update title
        </button>
        {updateMutation.isPending && <p className="loading">Updating...</p>}
        {updateMutation.isError && (
          <p className="error">
            Error Updating Post: {updateMutation.error.message}
          </p>
        )}
        {updateMutation.isSuccess && (
          <p className="success">Post (not) Updated</p>
        )}
      </div>

      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
