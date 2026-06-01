const MESSAGE_RULES = [
  {
    pattern: /insufficient merit points/i,
    message: 'Saldo insuficiente para completar la operacion.'
  },
  {
    pattern: /reward is not available/i,
    message: 'La recompensa ya no esta disponible o no tiene stock.'
  },
  {
    pattern: /employee not found/i,
    message: 'No se encontro el empleado seleccionado.'
  },
  {
    pattern: /duplicated unique field|already exists/i,
    message: 'El registro ya existe. Verifica los datos e intenta nuevamente.'
  },
  {
    pattern: /invalid .*id/i,
    message: 'La solicitud contiene un identificador invalido.'
  },
  {
    pattern: /internal server error/i,
    message: 'Ocurrio un error interno del servidor. Intenta de nuevo en unos segundos.'
  }
];

export function toFriendlyApiErrorMessage(rawMessage, fallbackMessage) {
  const source = String(rawMessage || '').trim();

  if (!source) {
    return fallbackMessage;
  }

  const rule = MESSAGE_RULES.find((entry) => entry.pattern.test(source));
  return rule?.message ?? source;
}
