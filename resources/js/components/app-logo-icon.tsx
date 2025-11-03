import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M17.657 16.243C19.488 14.412 21 12.209 21 9.999a9 9 0 10-18 0c0 2.21 1.512 4.413 3.343 6.244A12.97 12.97 0 0012 22a12.97 12.97 0 005.657-5.757z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
        </svg>
    );
}
