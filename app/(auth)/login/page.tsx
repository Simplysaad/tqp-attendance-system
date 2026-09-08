"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { loginUser } from '@/actions/user.action';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // FIXED: Corrected type to React.FormEvent<HTMLFormElement>
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(formData.email, formData.password);
            console.log("login response", response)

            router.push("/dashboard")

            if (response.success) {
                // FIXED: Updated success messages to reflect login
                console.log('Login successful:', response.user);
                alert('Login successful!');

                setFormData({
                    email: '',
                    password: '',
                });
            } else {
                console.error('Error logging in user:', response.error);
                alert(response.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="example@email.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;