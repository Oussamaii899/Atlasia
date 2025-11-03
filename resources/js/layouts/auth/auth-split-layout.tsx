import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;
    const images = [
                    "https://images.pexels.com/photos/31992427/pexels-photo-31992427/free-photo-of-moorish-architectural-entrance-in-marrakesh.jpeg?auto=compress&cs=tinysrgb&w=600",
                    "https://images.pexels.com/photos/31366288/pexels-photo-31366288/free-photo-of-scenic-canyon-reflection-in-amtoudi-morocco.jpeg?auto=compress&cs=tinysrgb&w=600",
                    "https://images.pexels.com/photos/30755837/pexels-photo-30755837/free-photo-of-traditional-moroccan-tea-by-a-luxurious-pool.jpeg?auto=compress&cs=tinysrgb&w=600",
                    "https://images.pexels.com/photos/28427934/pexels-photo-28427934/free-photo-of-amazing-nature.jpeg?auto=compress&cs=tinysrgb&w=600",
                    "https://images.pexels.com/photos/15069237/pexels-photo-15069237/free-photo-of-landscape-photography-of-the-hasan-ii-mosque.jpeg?auto=compress&cs=tinysrgb&w=600",
                    "https://images.pexels.com/photos/30251304/pexels-photo-30251304/free-photo-of-snowy-mountains-of-oukaimeden-morocco.jpeg?auto=compress&cs=tinysrgb&w=600"
                ];

                const [current, setCurrent] = useState(0);
                const [fade, setFade] = useState(true);

                useEffect(() => {
                    const interval = setInterval(() => {
                        setFade(false);
                        setTimeout(() => {
                            setCurrent((prev) => (prev + 1) % images.length);
                            setFade(true);
                        }, 200); 
                    }, 7000);
                    return () => clearInterval(interval);
                }, [images.length]);

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">


                <div className="absolute inset-0 bg-zinc-900">
                    {images.map((img, idx) => (
                        <img
                            key={img}
                            src={img}
                            alt="Morocco Place"
                            className={`h-full w-full object-cover absolute inset-0 transition-opacity duration-700 ${idx === current && fade ? 'opacity-60 z-10' : 'opacity-0 z-0'}`}
                            style={{ pointerEvents: 'none' }}
                        />
                    ))}
                </div>
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    Atlasia
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
