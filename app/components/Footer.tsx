"use client";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer footer-center p-10 bg-base-200 text-base-content mt-12">
            <div>
                <div className="grid grid-flow-col gap-4">
                    <p className="font-semibold text-lg">Intelligent Editor</p>
                </div>
                <p className="text-sm opacity-70">AI-assisted image creation and editing on the fly</p>
            </div>
            <div>
                <p className="text-xs opacity-60">
                    © {currentYear} Intelligent Editor. Built with Next.js, Google Gemini AI & ❤️
                </p>
            </div>
        </footer>
    );
}
