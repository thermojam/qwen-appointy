import type {Metadata} from 'next';
import {Nunito, Nunito_Sans, Fira_Code} from 'next/font/google';
import './globals.css';
import {Providers} from '@/features/providers';
import {ToastListener} from '@/shared/ui/toast-listener';

const nunito = Nunito({
    variable: '--font-heading',
    subsets: ['cyrillic', 'latin'],
});

const nunitoSans = Nunito_Sans({
    variable: '--font-body',
    subsets: ['cyrillic', 'latin'],
});

const firaCode = Fira_Code({
    variable: '--font-mono',
    subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
    title: 'Appointy',
    description: 'Платформа для записи на услуги бьюти-мастеров',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <body
            className={`${nunito.variable} ${nunitoSans.variable} ${firaCode.variable} font-body antialiased`}
        >
        <Providers>{children}</Providers>
        <ToastListener />
        </body>
        </html>
    );
}
