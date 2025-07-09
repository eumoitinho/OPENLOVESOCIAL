import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import SignIn from "@/components/auth/SignIn"
import { createClientSupabaseClient } from "@/lib/auth-client"
import jest from "jest" // Import jest to declare it

// Mock do Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock do Supabase client
jest.mock("@/lib/auth-client", () => ({
  createClientSupabaseClient: jest.fn(),
}))

// Mock do Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockSignInWithPassword = jest.fn()
const mockSignInWithOAuth = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  })
  ;(createClientSupabaseClient as jest.Mock).mockReturnValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  })

  // Reset mocks
  jest.clearAllMocks()
})

describe("SignIn Component", () => {
  it("renders sign in form correctly", () => {
    render(<SignIn />)

    expect(screen.getByText("Entre na sua conta")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Continuar com Google/i })).toBeInTheDocument()
  })

  it("handles email sign in successfully", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    })

    render(<SignIn />)

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Senha")
    const submitButton = screen.getByRole("button", { name: "Entrar" })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("displays error message on sign in failure", async () => {
    const errorMessage = "Invalid credentials"
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    })

    render(<SignIn />)

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Senha")
    const submitButton = screen.getByRole("button", { name: "Entrar" })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("handles Google sign in", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: null,
      error: null,
    })

    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    })

    render(<SignIn />)

    const googleButton = screen.getByRole("button", { name: /Continuar com Google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      })
    })
  })

  it("toggles password visibility", () => {
    render(<SignIn />)

    const passwordInput = screen.getByLabelText("Senha") as HTMLInputElement
    const toggleButton = screen.getByRole("button", { name: "" }) // Eye icon button

    expect(passwordInput.type).toBe("password")

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe("text")

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe("password")
  })

  it("shows loading state during sign in", async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100)),
    )

    render(<SignIn />)

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Senha")
    const submitButton = screen.getByRole("button", { name: "Entrar" })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(screen.getByText("Entrando...")).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it("has correct links to sign up and forgot password", () => {
    render(<SignIn />)

    const signUpLink = screen.getByText("crie uma nova conta")
    const forgotPasswordLink = screen.getByText("Esqueceu sua senha?")

    expect(signUpLink.closest("a")).toHaveAttribute("href", "/auth/signup")
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "/auth/forgot-password")
  })
})
