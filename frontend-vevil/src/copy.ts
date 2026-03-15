/**
 * Textos de la aplicación en español (centralizados para mantener consistencia).
 */

export const copy = {
  app: {
    name: 'Vevil',
    subtitle: 'Sistema de Gestión',
  },

  auth: {
    login: 'Iniciar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    loginError: 'Error al iniciar sesión',
    loginSuccess: 'Redirigiendo...',
    retry: 'Reintentar',
    firstTimeSlow: 'La primera vez puede tardar unos segundos.',
    haveAccount: '¿Ya tenés una cuenta?',
    goLogin: 'Iniciá sesión',
    noAccount: '¿No tenés una cuenta?',
    requestAccess: 'Solicitar registro',
  },

  register: {
    title: 'Solicitar registro',
    intro: 'Ingresá tu correo y datos. Te enviaremos un enlace para confirmar. Después un administrador aprobará tu cuenta y te enviará un correo para crear tu contraseña.',
    name: 'Nombre',
    lastName: 'Apellido',
    gender: 'Género',
    genderPlaceholder: 'No especificar',
    genderFemale: 'Femenino',
    genderMale: 'Masculino',
    submit: 'Enviar solicitud',
    sending: 'Enviando...',
    successMessage: 'Revisá tu correo y hacé clic en el enlace para confirmar. Luego un administrador revisará tu solicitud.',
    haveAccount: '¿Ya tenés una cuenta?',
    goLogin: 'Iniciá sesión',
    requiredName: 'El nombre es obligatorio',
    requiredEmail: 'El correo es obligatorio',
  },

  confirmRegistration: {
    confirming: 'Confirmando...',
    successMessage: 'Tu correo fue confirmado. Un administrador revisará tu solicitud y te enviará un correo para crear tu contraseña.',
    goLogin: 'Ir a iniciar sesión',
    errorMissingLink: 'Falta el enlace de confirmación.',
    errorInvalid: 'El enlace no es válido o expiró.',
    requestAgain: 'Solicitar registro de nuevo',
  },

  dashboard: {
    welcome: '¡Bienvenido!',
    welcomeMale: 'Bienvenido',
    welcomeFemale: 'Bienvenida',
    welcomeNeutral: 'Bienvenido/a',
    loadExampleData: 'Cargar Datos de Ejemplo',
    loadingData: 'Cargando...',
  },

  pendingRegistrations: {
    title: 'Solicitudes de registro',
    intro: 'Revisá los datos, asigná un perfil y aprobá para que el usuario reciba un correo para crear su contraseña.',
    empty: 'No hay solicitudes pendientes de aprobación.',
    profile: 'Perfil',
    profileRoleUser: 'Usuario',
    profileRoleAdmin: 'Admin',
    approve: 'Aprobar',
    reject: 'Rechazar',
    rejectConfirm: '¿Rechazar esta solicitud?',
    loading: 'Cargando solicitudes...',
    genderFemale: 'Femenino',
    genderMale: 'Masculino',
    confirmedAt: 'Confirmado el correo',
  },

  forgotPassword: {
    title: 'Recuperar contraseña',
    emailSent: 'Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu contraseña.',
  },

  resetPassword: {
    invalidToken: 'El enlace no es válido o ha expirado.',
    newPassword: 'Nueva contraseña',
    setPassword: 'Restablecer contraseña',
  },

  errors: {
    generic: 'Ha ocurrido un error.',
    invalidCredentials: 'Credenciales inválidas',
    connection: 'No se pudo conectar al servidor.',
  },
} as const;

export type Copy = typeof copy;
