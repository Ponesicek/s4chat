import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { AppSidebar } from "@/components/ConversationsSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "S4 Chat",
  description: "AI Chat Application",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="default">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased font-inter size-medium`}
        style={{ 
          fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          fontSize: '16px'
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider dynamic>
            <ConvexClientProvider>
              <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset>
                  <main className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
