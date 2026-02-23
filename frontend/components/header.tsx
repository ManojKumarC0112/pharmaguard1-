import Link from "next/link"
import { Dna } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <Dna className="h-6 w-6 text-emerald-600" />
                        <span className="inline-block font-bold">PharmaGuard</span>
                    </Link>
                    <nav className="flex gap-6">
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Home
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            VCF Upload
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Results
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            API Docs
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        <Link
                            href="#"
                            className="hidden lg:block text-sm font-medium text-emerald-600 border border-emerald-600 px-4 py-2 rounded-md hover:bg-emerald-50 transition-colors"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
