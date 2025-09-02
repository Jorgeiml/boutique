import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Validación básica de RUC Ecuador:
 * - 13 dígitos
 * - Los 3 últimos dígitos no pueden ser "000" (establecimiento)
 * (Suficiente para tu flujo actual; se puede endurecer luego)
 */
export function IsEcuadorRuc(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEcuadorRuc',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const ruc = value.trim();
          if (!/^\d{13}$/.test(ruc)) return false;
          const estab = ruc.slice(-3);
          if (estab === '000') return false;
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un RUC ecuatoriano válido de 13 dígitos (los últimos 3 ≠ "000")`;
        },
      },
    });
  };
}
