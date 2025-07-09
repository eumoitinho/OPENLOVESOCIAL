import type React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import Header from "@/components/Header"
import jest from "jest"

// Mock do Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe("Header Component", () => {
  it("renders the ConnectHub logo", () => {
    render(<Header />)

    const logo = screen.getByText("ConnectHub")
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass("text-2xl", "font-bold")
  })

  it("renders navigation links on desktop", () => {
    render(<Header />)

    expect(screen.getByText("Explorar")).toBeInTheDocument()
    expect(screen.getByText("Comunidades")).toBeInTheDocument()
    expect(screen.getByText("Eventos")).toBeInTheDocument()
  })

  it("renders auth buttons", () => {
    render(<Header />)

    expect(screen.getByText("Entrar")).toBeInTheDocument()
    expect(screen.getByText("Cadastrar")).toBeInTheDocument()
  })

  it("toggles mobile menu when menu button is clicked", () => {
    render(<Header />)

    // Menu mobile inicialmente não visível
    const mobileNav = screen.queryByText("Explorar")
    expect(mobileNav).toBeInTheDocument() // Existe mas pode estar oculto

    // Encontrar e clicar no botão do menu mobile
    const menuButton = screen.getByLabelText("Toggle menu")
    fireEvent.click(menuButton)

    // Verificar se o menu mobile está visível
    expect(screen.getAllByText("Explorar")).toHaveLength(2) // Desktop + Mobile
  })

  it("has correct link hrefs", () => {
    render(<Header />)

    const exploreLink = screen.getAllByText("Explorar")[0].closest("a")
    const communitiesLink = screen.getAllByText("Comunidades")[0].closest("a")
    const eventsLink = screen.getAllByText("Eventos")[0].closest("a")

    expect(exploreLink).toHaveAttribute("href", "/explore")
    expect(communitiesLink).toHaveAttribute("href", "/communities")
    expect(eventsLink).toHaveAttribute("href", "/events")
  })

  it("applies correct CSS classes for styling", () => {
    render(<Header />)

    const header = screen.getByRole("banner")
    expect(header).toHaveClass("bg-blue-600", "text-white", "shadow-lg")
  })
})
