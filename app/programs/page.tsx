import type { Metadata } from "next"
import ProgramsPage from "./ProgramsPage"

export const metadata: Metadata = {
  title: "Programas e Cursos - ConnectHub",
  description: "Aprenda com os melhores instrutores da plataforma",
}

export default function Page() {
  return <ProgramsPage />
}
