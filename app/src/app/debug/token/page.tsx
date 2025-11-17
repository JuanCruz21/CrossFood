/**
 * Debug Component - Token Checker
 * Muestra el estado del token de autenticación
 */

'use client';

import { useEffect, useState } from 'react';

export default function TokenDebugPage() {
  const [tokenInfo, setTokenInfo] = useState<{
    localStorage: string | null;
    sessionStorage: string | null;
    cookie: string | null;
  }>({
    localStorage: null,
    sessionStorage: null,
    cookie: null,
  });

  useEffect(() => {
    // Leer de localStorage
    const localToken = localStorage.getItem('authToken');
    
    // Leer de sessionStorage
    const sessionToken = sessionStorage.getItem('authToken');
    
    // Leer de cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const cookieToken = getCookie('access_token');
    
    setTokenInfo({
      localStorage: localToken,
      sessionStorage: sessionToken,
      cookie: cookieToken || null,
    });
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: {
          'Authorization': `Bearer ${tokenInfo.localStorage || tokenInfo.sessionStorage || tokenInfo.cookie}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ API funciona! ${data.count} usuarios encontrados`);
      } else {
        alert(`❌ API falló: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔐 Token Debug</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado del Token</h2>
          
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-700">localStorage (authToken):</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 break-all">
                {tokenInfo.localStorage ? (
                  <span className="text-green-600">{tokenInfo.localStorage.substring(0, 100)}...</span>
                ) : (
                  <span className="text-red-600">❌ No encontrado</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="font-medium text-gray-700">sessionStorage (authToken):</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 break-all">
                {tokenInfo.sessionStorage ? (
                  <span className="text-green-600">{tokenInfo.sessionStorage.substring(0, 100)}...</span>
                ) : (
                  <span className="text-red-600">❌ No encontrado</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="font-medium text-gray-700">Cookie (access_token):</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 break-all">
                {tokenInfo.cookie ? (
                  <span className="text-green-600">{tokenInfo.cookie.substring(0, 100)}...</span>
                ) : (
                  <span className="text-red-600">❌ No encontrado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="space-x-4">
            <button
              onClick={testAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Probar API
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                document.cookie = 'access_token=; path=/; max-age=0';
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Limpiar Todo
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ir a Login
            </button>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Primero haz login en <code className="bg-yellow-100 px-1 rounded">/auth/login</code></li>
            <li>Luego vuelve a esta página</li>
            <li>Verifica que el token aparezca en localStorage</li>
            <li>Haz clic en &quot;Probar API&quot; para verificar que funcione</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
