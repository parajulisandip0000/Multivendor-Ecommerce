const testLogin = async () => {
    try {
        console.log('1. Attempting Login...');
        const loginPayload = {
            email: 'seller@example.com',
            password: 'password123'
        };

        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
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
        const dashboardRes = await fetch('http://localhost:5000/api/store-admin/dashboard', {
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
