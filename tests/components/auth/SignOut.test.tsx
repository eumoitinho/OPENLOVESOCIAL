import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import SignOut from "@/components/auth/SignOut"
import { createClientSupabaseClient } from "@/lib/auth-client"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock do Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock do Supabase client
jest.mock("@/lib/auth-client", () => ({
  createClientSupabaseClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockSignOut = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  })
  ;(createClientSupabaseClient as jest.Mock).mockReturnValue({
    auth: {
      signOut: mockSignOut,
    },
  })

  // Reset mocks
  jest.clearAllMocks()
})

describe("SignOut Component", () => {
  it("renders sign out button correctly", () => {
    render(<SignOut />)

    const signOutButton = screen.getByRole("button", { name: "Sair" })
    expect(signOutButton).toBeInTheDocument()
    expect(signOutButton).toHaveTextContent("Sair")
  })

  it("renders custom children when provided", () => {
    render(<SignOut>Fazer Logout</SignOut>)

    const signOutButton = screen.getByRole("button", { name: "Fazer Logout" })
    expect(signOutButton).toBeInTheDocument()
    expect(signOutButton).toHaveTextContent("Fazer Logout")
  })

  it("handles sign out successfully", async () => {
    mockSignOut.mockResolvedValue({ error: null })

    render(<SignOut />)

    const signOutButton = screen.getByRole("button", { name: "Sair" })
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("handles sign out error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignOut.mockResolvedValue({ error: { message: "Sign out failed" } })

    render(<SignOut />)

    const signOutButton = screen.getByRole("button", { name: "Sair" })
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao fazer logout:", { message: "Sign out failed" })
    expect(mockPush).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it("shows loading state during sign out", async () => {
    mockSignOut.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)))

    render(<SignOut />)

    const signOutButton = screen.getByRole("button", { name: "Sair" })
    fireEvent.click(signOutButton)

    expect(screen.getByText("Saindo...")).toBeInTheDocument()
    expect(signOutButton).toBeDisabled()

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it("applies custom className", () => {
    render(<SignOut className="custom-class" />)

    const signOutButton = screen.getByRole("button", { name: "Sair" })
    expect(signOutButton).toHaveClass("custom-class")
  })
})
