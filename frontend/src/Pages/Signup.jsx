import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import API_URL from '../_helpers';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, data);
            if (response.data.status === 'success') {
                Cookies.set('email', data.email); // Assuming backend returns a token
                Cookies.set('password', data.password); // Assuming backend returns a token
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
            <h2 className="text-center mt-5">Signup</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        {...register('name_', { required: 'Name is required' })} 
                    />
                    {errors.name_ && <p className="text-danger">{errors.name_.message}</p>}
                </div>
                <div className="form-group mt-3">
                    <label>Phone Number</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        {...register('phoneNo', { required: 'Phone number is required' })} 
                    />
                    {errors.phoneNo && <p className="text-danger">{errors.phoneNo.message}</p>}
                </div>
                <div className="form-group mt-3">
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
                <button type="submit" className="btn btn-primary mt-4">Signup</button>
            </form>
            <p className="mt-3">Already have an account? <a href="/signin">Signin</a></p>
        </div>
    );
};

export default Signup;
