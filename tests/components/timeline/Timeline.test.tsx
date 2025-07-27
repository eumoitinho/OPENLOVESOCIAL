import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Timeline from "@/app/components/timeline/Timeline"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock fetch
global.fetch = jest.fn()

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: () => "há 2 horas" }))

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn() } }))

const mockPosts = [
  {
    id: "1",
    user_id: "user1",
    content: "Test post content",
    visibility: "public",
    created_at: "2024-01-01T00:00:00Z",
    users: {
      name: "John Doe",
      username: "johndoe",
      profile_type: "single",
      avatar_url: null },
    comments: [],
    isLiked: false,
    likesCount: 0 },
]

describe("Timeline Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading state initially", () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<Timeline />)

    expect(screen.getByText("Nenhuma postagem encontrada.")).toBeInTheDocument()
  })

  it("renders posts after loading", async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts) })

    render(<Timeline />)

    await waitFor(() => {
      expect(screen.getByText("Test post content")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("@johndoe")).toBeInTheDocument()
    })
  })

  it("handles like interaction", async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ action: "liked" }) })

    const user = userEvent.setup()
    render(<Timeline />)

    await waitFor(() => {
      expect(screen.getByText("Test post content")).toBeInTheDocument()
    })

    const likeButton = screen.getByRole("button", { name: /0/ })
    await user.click(likeButton)

    expect(fetch).toHaveBeenCalledWith("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: "1", action: "like" }) })
  })

  it("handles comment submission", async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "comment1",
            content: "Test comment",
            created_at: "2024-01-01T00:00:00Z",
            users: { name: "Jane Doe", username: "janedoe" } }) })

    const user = userEvent.setup()
    render(<Timeline />)

    await waitFor(() => {
      expect(screen.getByText("Test post content")).toBeInTheDocument()
    })

    const commentInput = screen.getByPlaceholderText("Escreva um comentário...")
    const submitButton = screen.getByText("Enviar")

    await user.type(commentInput, "Test comment")
    await user.click(submitButton)

    expect(fetch).toHaveBeenCalledWith("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: "1", action: "comment", content: "Test comment" }) })
  })
})
