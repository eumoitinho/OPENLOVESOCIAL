import PricingContent from "./PricingContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Planos - Openlove",
  description: "Escolha o plano ideal para você no Openlove" }

export default function PricingPage() {
  return <PricingContent />
}
