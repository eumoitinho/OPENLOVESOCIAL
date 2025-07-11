"use client"

import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/app/components/auth/AuthProvider"
import { createClientSupabaseClient } from "@/lib/auth-helpers"
import jest from "jest" // Import jest to declare it

// Mock do Supabase client
jest.mock("@/lib/auth-helpers", () => ({
  createClientSupabaseClient: jest.fn(),
}))

const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

beforeEach(() => {
  const mockSubscription = { unsubscribe: jest.fn() }
  ;(createClientSupabaseClient as jest.Mock).mockReturnValue({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      }),
    },
    from: mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  })

  jest.clearAllMocks()
})

// Componente de teste para usar o hook useAuth
const TestComponent = () => {
  const { user, profile, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="user">{user ? user.email : "No user"}</div>
      <div data-testid="profile">{profile ? profile.full_name : "No profile"}</div>
    </div>
  )
}

describe("AuthProvider", () => {
  it("provides initial loading state", () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("provides user and profile data when authenticated", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
    }

    const mockProfile = {
      id: "123",
      username: "testuser",
      full_name: "Test User",
      bio: null,
      avatar_url: null,
      interests: [],
      location: null,
      website: null,
      is_verified: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }

    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    })

    mockSingle.mockResolvedValue({
      data: mockProfile,
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
      expect(screen.getByTestId("profile")).toHaveTextContent("Test User")
    })
  })

  it("handles no user state correctly", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("No user")
      expect(screen.getByTestId("profile")).toHaveTextContent("No profile")
    })
  })

  it("throws error when useAuth is used outside AuthProvider", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useAuth deve ser usado dentro de um AuthProvider")

    consoleErrorSpy.mockRestore()
  })
})
