// Script temporal para habilitar usuario por email
// Uso: node enable-user.js nachodibella@gmail.com

const email = process.argv[2];

if (!email) {
  console.error('Uso: node enable-user.js <email>');
  process.exit(1);
}

const API_URL = process.env.API_URL || 'https://evil-backend.onrender.com/api';

async function enableUser() {
  try {
    console.log(`Habilitando usuario: ${email}`);
    const response = await fetch(`${API_URL}/auth/enable-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error:', data.message || 'Error desconocido');
      process.exit(1);
    }
    
    console.log('✓ Éxito:', data.message);
  } catch (error) {
    console.error('Error al conectar con el backend:', error.message);
    process.exit(1);
  }
}

enableUser();
