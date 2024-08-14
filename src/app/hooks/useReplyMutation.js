import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useReplyMutation = (slug) => {
  const queryClient = useQueryClient();
  const replyMutation = useMutation({
    mutationFn: (commentData) => {
      return fetch(
        `http://localhost:3000/api/comment/${commentData.comment.postId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentData),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["post", slug]);
    },
  });

  return {
    mutate: ({ comment, text }) => replyMutation.mutate({ comment, text }),
    status: replyMutation.status,
    error: replyMutation.error,
    isError: replyMutation.isError,
    isSuccess: replyMutation.isSuccess,
  };
};
