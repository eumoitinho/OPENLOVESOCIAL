import PricingContent from "./PricingContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Planos - ConnectHub",
  description: "Escolha o plano ideal para você no ConnectHub",
}

export default function PricingPage() {
  return <PricingContent />
}
