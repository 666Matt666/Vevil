import { extname } from 'path';

export const editFileName = (req, file, callback) => {
  // Obtiene el nombre original del archivo
  const name = file.originalname.split('.')[0];
  // Obtiene la extensión del archivo
  const fileExtName = extname(file.originalname);
  // Genera un número aleatorio para evitar conflictos de nombres
  const randomName = Array(4).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
  // Devuelve el nuevo nombre del archivo
  callback(null, `${name}-${randomName}${fileExtName}`);
};