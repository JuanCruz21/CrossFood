/**
 * Login Test Page
 * Para debugging del proceso de login
 */

'use client';

import { useState } from 'react';

export default function LoginTestPage() {
  const [email, setEmail] = useState('juancruz.02.2001@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new URLSearchParams({
        username: email,
        password: password,
        grant_type: 'password'
      });

      console.log('Sending login request...');
      console.log('Email:', email);
      console.log('FormData:', formData.toString());

      const response = await fetch('http://localhost:8000/api/v1/login/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok && data.access_token) {
        console.log('✅ Login successful!');
        console.log('Token:', data.access_token.substring(0, 50) + '...');
        
        // Guardar en localStorage
        localStorage.setItem('authToken', data.access_token);
        alert('✅ Login exitoso! Token guardado en localStorage');
      }
    } catch (error) {
      setResult({
        error: true,
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testProtectedEndpoint = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('❌ No hay token guardado. Haz login primero.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Endpoint protegido funciona! ${data.count} usuarios encontrados`);
      } else {
        alert(`❌ Error ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Login Test</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Credenciales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={testLogin}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : '🔐 Test Login'}
              </button>

              <button
                onClick={testProtectedEndpoint}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                🛡️ Test Endpoint Protegido
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  alert('Token eliminado');
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                🗑️ Limpiar Token
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>
            <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Usuarios disponibles:</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
            <li><code>juancruz.02.2001@gmail.com</code> / <code>admin123</code></li>
            <li><code>yersoncardozo11116@gmail.com</code> (contraseña desconocida)</li>
            <li><code>admin16@gmail.com</code> (contraseña desconocida)</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            💡 Si necesitas resetear la contraseña, usa el script <code>reset_password.py</code> en el backend
          </p>
        </div>
      </div>
    </div>
  );
}
