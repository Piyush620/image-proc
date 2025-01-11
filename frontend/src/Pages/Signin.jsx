import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import API_URL from '../_helpers';

const Signin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_URL}/signin`, data);
            if (response.data.status === 'success') {
                Cookies.set('email', data.email); // Assuming backend returns a token
                Cookies.set('password', data.password); 
                navigate('/index');
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert('An error occurred: ' + error.response.data.message);
        }
    };

    return (
        <div className="container">
            <h2 className="text-center mt-5">Signin</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        {...register('email', { required: 'Email is required' })} 
                    />
                    {errors.email && <p className="text-danger">{errors.email.message}</p>}
                </div>
                <div className="form-group mt-3">
                    <label>Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        {...register('password', { required: 'Password is required' })} 
                    />
                    {errors.password && <p className="text-danger">{errors.password.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary mt-4">Signin</button>
            </form>
            <p className="mt-3">Don't have an account? <a href="/signup">Signup</a></p>
        </div>
    );
};

export default Signin;
