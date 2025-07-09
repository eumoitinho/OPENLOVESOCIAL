import { GET } from "@/app/api/timeline/route"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import jest from "jest" // Declare the jest variable

// Mock Supabase
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: jest.fn(),
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(() => ({
          or: jest.fn(),
        })),
      })),
    })),
  })),
}

describe("Timeline API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("returns unauthorized for unauthenticated user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Not authenticated"),
    })

    const request = new Request("http://localhost/api/timeline")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("returns posts for authenticated user", async () => {
    const mockUser = { id: "123", email: "test@example.com" }
    const mockPosts = [
      {
        id: "post1",
        user_id: "456",
        content: "Hello world!",
        created_at: "2024-01-01T00:00:00Z",
        users: { name: "John Doe", username: "johndoe", profile_type: "single" },
        likes: [{ count: 5 }],
        comments: [],
      },
    ]

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { subscription_plan: "free" },
                }),
            }),
          }),
        }
      }
      if (table === "posts") {
        return {
          select: () => ({
            order: () => ({
              limit: () => ({
                or: () =>
                  Promise.resolve({
                    data: mockPosts,
                    error: null,
                  }),
              }),
            }),
          }),
        }
      }
      if (table === "likes") {
        return {
          select: () => ({
            eq: () => ({
              in: () =>
                Promise.resolve({
                  data: [],
                  error: null,
                }),
            }),
          }),
        }
      }
    })

    const request = new Request("http://localhost/api/timeline")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty("id", "post1")
    expect(data[0]).toHaveProperty("isLiked", false)
    expect(data[0]).toHaveProperty("likesCount", 5)
  })
})
