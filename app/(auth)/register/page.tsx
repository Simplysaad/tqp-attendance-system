"use client"
import React, { useState, ChangeEvent, SubmitEvent } from 'react';
import { registerUser } from '@/actions/user.action';
import { IUser } from '@/models/user.model';
import { useRouter } from 'next/navigation';



const RegisterPage = () => {
    const router = useRouter()
    const [formData, setFormData] = useState<IUser>({
        name: '',
        email: '',
        whatsappNumber: '',
        password: '',
        role: 'student',
        isActive: true
    });

    const [loading, setLoading] = useState<boolean>(false);

    // Generic change handler for inputs and selects
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Form submission handler using axios
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registerUser(formData);

            console.log("response", response)
            if (response.success) {
                console.log('Registration successful:', response.user);
                alert('Registration successful!');

                // Reset form after successful submission
                setFormData({
                    ...formData,
                    name: '',
                    email: '',
                    whatsappNumber: '',
                    password: '',
                });

                router.push("/onboarding")
            } else {
                console.error('Error registering user:', response.error);
                alert(response.error || 'Registration failed. Please try again.');
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
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                    />
                </div>

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
                    <label htmlFor="whatsappNumber">WhatsApp Number</label>
                    <input
                        type="tel"
                        id="whatsappNumber"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        required
                        placeholder="+1234567890"
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

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select your role
                        </option>
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;