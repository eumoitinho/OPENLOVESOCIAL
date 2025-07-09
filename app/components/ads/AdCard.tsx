"use client"

import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdCardProps {
  title: string
  description: string
  image: string
  buttonText?: string
  onButtonClick?: () => void
}

export function AdCard({ title, description, image, buttonText = "Explorar Mais", onButtonClick }: AdCardProps) {
  return (
    <Card className="max-w-lg py-0 sm:flex-row sm:gap-0 border-0 shadow-sm bg-card backdrop-blur-sm rounded-3xl overflow-hidden mb-4">
      <CardContent className="grow-1 px-0">
        <img src={image || "/placeholder.svg"} alt="Banner" className="size-full rounded-s-3xl object-cover" />
      </CardContent>
      <div className="sm:min-w-54">
        <CardHeader className="pt-6">
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="gap-3 py-6">
          <Button
            className="bg-transparent bg-gradient-to-br from-purple-500 to-pink-500 text-white focus-visible:ring-pink-600/20 rounded-xl"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}
