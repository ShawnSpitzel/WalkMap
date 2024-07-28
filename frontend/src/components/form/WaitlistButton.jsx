import React from 'react';

export default function SignupButton({ name, email }) {
    const handleClick = () => {
        handleSignup(name, email);
    };

    return (
        <button
            onClick={handleClick}
            className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-green-700 rounded-e-lg border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
            <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 1v18M1 10h18"
                />
            </svg>
            <span className="sr-only">Sign Up</span>
        </button>
    );
}

async function handleSignup(name, email) {
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
        console.log('Signup successful');
    } else {
        console.error('Signup failed');
    }
}
