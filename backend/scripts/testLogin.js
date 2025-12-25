require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const stripTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '');

const getApiBaseUrl = () => {
    if (process.env.API_URL) return stripTrailingSlashes(process.env.API_URL);

    const origin = process.env.PUBLIC_BASE_URL
        ? stripTrailingSlashes(process.env.PUBLIC_BASE_URL)
        : `http://localhost:${process.env.PORT || 5000}`;

    return `${origin}/api`;
};

const testLogin = async () => {
    try {
        const API_URL = getApiBaseUrl();
        console.log('1. Attempting Login...');
        const loginPayload = {
            email: 'seller@example.com',
            password: 'password123'
        };

        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) {
            throw new Error(`Login Failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('Login Successful. Token:', token ? token.substring(0, 20) + '...' : 'null');

        console.log('2. Accessing Dashboard...');
        const dashboardRes = await fetch(`${API_URL}/store-admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!dashboardRes.ok) {
            const errorText = await dashboardRes.text();
            throw new Error(`Dashboard Failed: ${dashboardRes.status} ${dashboardRes.statusText} - ${errorText}`);
        }

        const dashboardData = await dashboardRes.json();
        console.log('Dashboard Access Successful!');
        console.log('Data:', dashboardData);

    } catch (error) {
        console.error('Test Failed!', error);
    }
};

testLogin();
