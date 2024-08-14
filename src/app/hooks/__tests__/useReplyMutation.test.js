import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useReplyMutation } from "../useReplyMutation";

describe("useReplyMutation", () => {
  let queryClient;
  let wrapper;
  const commentData = { comment: { postId: 1 }, text: "Reply Test" };
  const { result } = renderHook(() => useReplyMutation("test-slug"), {
    wrapper,
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  wrapper = ({ children }) => {
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  global.fetch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("Deve chamar mutate e tratar o success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Reply Added" }),
    });

    result.current.mutate(commentData);

    await waitFor(() => result.current.isSuccess);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/comment/1/replies",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      }
    );
    expect(queryClient.getQueryData[("post", "test-slug")]).toBeUndefined();
  });

  it("deve tratar o erro", async () => {
    global.fetch.mockRejectValueOnde(new Error("Network Error"));

    result.current.mutate(commentData);

    await waitFor(() => result.current.isError);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current.error.message).toEqual("Network Error");
  });
});
