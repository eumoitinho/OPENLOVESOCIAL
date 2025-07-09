import type { Metadata } from "next"
import ContentPage from "./ContentPage"

export const metadata: Metadata = {
  title: "Conteúdos Pagos - ConnectHub",
  description: "Descubra conteúdos exclusivos de criadores incríveis",
}

export default function Page() {
  return <ContentPage />
}
