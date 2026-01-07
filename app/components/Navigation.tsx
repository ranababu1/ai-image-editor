"use client";

import { useState } from "react";

const tools = [
    { name: "Web Asset Audit", href: "https://audit.imrn.dev/?ref=aieditor" },
    { name: "Image Optimizer", href: "https://pixfix.imrn.dev/?ref=aieditor" },
    { name: "Web Crawler", href: "https://crawler.imrn.dev/?ref=aieditor" },
    { name: "Sitemap Builder", href: "https://crawler.imrn.dev/?ref=aieditor" },
    { name: "Free AB Test Tool", href: "https://www.freeabtest.com/?ref=aieditor" },
    { name: "CookieShield", href: "#cookie-shield" },
];

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="navbar bg-base-100 shadow-lg mb-6">
            <div className="navbar-start">
                <div className="dropdown">
                    <label
                        tabIndex={0}
                        className="btn btn-ghost lg:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </label>
                    {isMenuOpen && (
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            {tools.map((tool) => (
                                <li key={tool.name}>
                                    <a href={tool.href} className="hover:bg-primary hover:text-primary-content">
                                        {tool.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <a className="btn btn-ghost normal-case text-xl font-bold">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Intelligent Editor
                    </span>
                </a>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-1">
                    {tools.map((tool) => (
                        <li key={tool.name}>
                            <a
                                href={tool.href}
                                className="hover:bg-primary hover:text-primary-content transition-colors"
                            >
                                {tool.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="navbar-end">
                <div className="badge badge-primary badge-sm">AI Tools Suite</div>
            </div>
        </div>
    );
}
