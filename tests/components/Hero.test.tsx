import type React from "react"
import { render, screen } from "@testing-library/react"
import Hero from "@/components/Hero"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock do Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe("Hero Component", () => {
  it("renders the main heading", () => {
    render(<Hero />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Conecte-se com pessoas que compartilham seus interesses/)
  })

  it("renders the description text", () => {
    render(<Hero />)

    const description = screen.getByText(/Descubra comunidades, participe de eventos/)
    expect(description).toBeInTheDocument()
  })

  it("renders call-to-action buttons", () => {
    render(<Hero />)

    const startButton = screen.getByText("Começar Agora")
    const exploreButton = screen.getByText("Explorar Comunidades")

    expect(startButton).toBeInTheDocument()
    expect(exploreButton).toBeInTheDocument()

    // Verificar links
    expect(startButton.closest("a")).toHaveAttribute("href", "/register")
    expect(exploreButton.closest("a")).toHaveAttribute("href", "/explore")
  })

  it("renders statistics section", () => {
    render(<Hero />)

    expect(screen.getByText("10K+")).toBeInTheDocument()
    expect(screen.getByText("Membros Ativos")).toBeInTheDocument()

    expect(screen.getByText("500+")).toBeInTheDocument()
    expect(screen.getByText("Comunidades")).toBeInTheDocument()

    expect(screen.getByText("1K+")).toBeInTheDocument()
    expect(screen.getByText("Eventos Mensais")).toBeInTheDocument()
  })

  it("has correct styling classes", () => {
    render(<Hero />)

    const section = screen.getByRole("region")
    expect(section).toHaveClass("bg-gradient-to-br", "from-blue-50", "to-indigo-100")
  })
})
