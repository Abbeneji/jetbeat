import { Heart } from "lucide-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Copyright ©2025
            </span>
            <Link
              href="https://jetbeat.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Jetbeat.
            </Link>
            <span>All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
