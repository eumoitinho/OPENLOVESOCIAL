import { POST, DELETE } from "@/app/api/upload/route"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { promises as fs } from "fs"
import { validateMediaFile } from "@/lib/media-utils"
import jest from "jest"

// Mock das dependências
jest.mock("@supabase/auth-helpers-nextjs")
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}))
jest.mock("@/lib/media-utils")
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({})),
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
  rpc: jest.fn(),
}

beforeEach(() => {
  ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
  jest.clearAllMocks()
})

describe("Upload API", () => {
  describe("POST /api/upload", () => {
    it("uploads a file successfully", async () => {
      // Mock user authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user123", email: "test@example.com" } },
        error: null,
      })

      // Mock file validation
      ;(validateMediaFile as jest.Mock).mockReturnValue({
        isValid: true,
        fileType: "image",
      })

      // Mock database insert
      const mockMedia = {
        id: "media123",
        url: "http://localhost:3000/storage/test.jpg",
        filename: "test.jpg",
        file_type: "image",
        file_size: 1024,
      }

      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValue({
          data: mockMedia,
          error: null,
        })

      // Mock file system operations
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)

      // Create test request
      const file = new File(["test content"], "test.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append("file", file)
      formData.append("altText", "Test image")

      const request = new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.media).toEqual({
        id: "media123",
        url: "http://localhost:3000/storage/test.jpg",
        filename: "test.jpg",
        fileType: "image",
        fileSize: 1024,
      })
    })

    it("returns 401 for unauthenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      })

      const formData = new FormData()
      const request = new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toBe("Não autorizado")
    })

    it("returns 400 for missing file", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      })

      const formData = new FormData()
      const request = new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe("Nenhum arquivo enviado")
    })

    it("returns 400 for invalid file", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      })
      ;(validateMediaFile as jest.Mock).mockReturnValue({
        isValid: false,
        error: "Tipo de arquivo não suportado",
      })

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      const formData = new FormData()
      formData.append("file", file)

      const request = new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe("Tipo de arquivo não suportado")
    })
  })

  describe("DELETE /api/upload", () => {
    it("deletes media successfully", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      })

      const mockMedia = {
        id: "media123",
        filename: "test.jpg",
        user_id: "user123",
      }

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockMedia,
        error: null,
      })

      mockSupabase.from().delete().eq.mockResolvedValue({
        error: null,
      })
      ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)

      const request = new Request("http://localhost/api/upload?id=media123", {
        method: "DELETE",
      })

      const response = await DELETE(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
    })

    it("returns 404 for non-existent media", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      })

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        })

      const request = new Request("http://localhost/api/upload?id=nonexistent", {
        method: "DELETE",
      })

      const response = await DELETE(request)
      const result = await response.json()

      expect(response.status).toBe(404)
      expect(result.error).toBe("Mídia não encontrada")
    })
  })
})
