import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Mocking Register API call
            const mockUser = { id: 2, ...formData };
            const mockToken = 'mock_jwt_token_register';

            login(mockUser, mockToken);
            navigate(`/${mockUser.role}/dashboard`);
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join CampusOS today</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your institutional email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">I am a...</label>
                        <select id="role" value={formData.role} onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty Member</option>
                            {/* Note: Admin creation usually restricted, but here for demo */}
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit">Register</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
