"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard-temp", label: "Temperature" },
  { href: "/dashboard-light", label: "Light" },
  { href: "/fish", label: "Animation" }, 
  { href: "/login", label: "Login" },
];

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center text-gray-800">
      <h1 className="text-2xl font-bold text-blue-600">Sensors Dashboard</h1>
      <ul className="flex gap-6 list-none m-0 p-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`${
                pathname === link.href
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              } transition-all pb-1`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}