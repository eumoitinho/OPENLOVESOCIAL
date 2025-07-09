import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import MediaUpload from "@/components/media/MediaUpload"
import { validateMediaFile } from "@/lib/media-utils"
import jest from "jest"

// Mock das dependências
jest.mock("@/lib/media-utils")

// Mock do fetch global
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(validateMediaFile as jest.Mock).mockReturnValue({
    isValid: true,
    fileType: "image",
  })
})

describe("MediaUpload Component", () => {
  it("renders upload area correctly", () => {
    render(<MediaUpload />)

    expect(screen.getByText(/Clique ou arraste arquivos aqui/)).toBeInTheDocument()
    expect(screen.getByText(/Suporte para imagens/)).toBeInTheDocument()
  })

  it("handles file selection", async () => {
    const mockOnUploadSuccess = jest.fn()
    render(<MediaUpload onUploadSuccess={mockOnUploadSuccess} />)

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("1 arquivo(s) selecionado(s)")).toBeInTheDocument()
    })
  })

  it("validates files on selection", async () => {
    const mockOnUploadError = jest.fn()
    ;(validateMediaFile as jest.Mock).mockReturnValue({
      isValid: false,
      error: "Arquivo muito grande",
    })

    render(<MediaUpload onUploadError={mockOnUploadError} />)

    const file = new File(["test"], "large.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith("Arquivo muito grande")
    })
  })

  it("uploads files successfully", async () => {
    const mockOnUploadSuccess = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          media: { id: "123", url: "test.jpg" },
        }),
    })

    render(<MediaUpload onUploadSuccess={mockOnUploadSuccess} />)

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Enviar")).toBeInTheDocument()
    })

    const uploadButton = screen.getByText("Enviar")
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith({
        id: "123",
        url: "test.jpg",
      })
    })
  })

  it("handles upload errors", async () => {
    const mockOnUploadError = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: "Upload failed",
        }),
    })

    render(<MediaUpload onUploadError={mockOnUploadError} />)

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Enviar")).toBeInTheDocument()
    })

    const uploadButton = screen.getByText("Enviar")
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith("Upload failed")
    })
  })

  it("shows loading state during upload", async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, media: {} }),
              }),
            100,
          ),
        ),
    )

    render(<MediaUpload />)

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Enviar")).toBeInTheDocument()
    })

    const uploadButton = screen.getByText("Enviar")
    fireEvent.click(uploadButton)

    expect(screen.getByText("Enviando...")).toBeInTheDocument()
    expect(uploadButton).toBeDisabled()
  })

  it("allows setting profile picture option", async () => {
    render(<MediaUpload allowProfilePicture={true} />)

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
    const input = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText("Definir como foto de perfil")).toBeInTheDocument()
    })

    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })
})
