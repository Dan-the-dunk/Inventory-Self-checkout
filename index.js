import { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:3000/login', { username, password });
            localStorage.setItem('token', res.data.token);
            setMessage(res.data.message);
            window.location.href = '/dashboard';
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex flex-col items-center p-5">
            <h2 className="text-xl font-bold">Login</h2>
            <input className="border p-2 m-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="border p-2 m-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="bg-blue-500 text-white p-2 m-2" onClick={handleLogin}>Login</button>
            {message && <p className="text-red-500">{message}</p>}
        </div>
    );

}