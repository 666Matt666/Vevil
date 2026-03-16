import React from 'react';
import { ComingSoon } from '../ui/ComingSoon';

const AuditPlaceholder: React.FC = () => (
    <ComingSoon
        title="Auditoría"
        description="Aquí podrás consultar el historial de acciones (quién hizo qué y cuándo). Esta función estará disponible en una próxima actualización."
        showBackLink
    />
);

export default AuditPlaceholder;
