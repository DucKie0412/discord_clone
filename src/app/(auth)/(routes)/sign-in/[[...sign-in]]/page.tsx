"use client"
import React from 'react'
import { SignIn } from '@clerk/nextjs';
function Page() {
    return (
        <div>
            <SignIn />
        </div>
    )
}

export default Page;