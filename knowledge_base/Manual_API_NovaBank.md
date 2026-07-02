# NovaBank API Documentation

## Transferencias

### Endpoint

```http
POST /api/v1/transferencias
```

---

## Descripción

Permite registrar y procesar transferencias entre cuentas internas y externas del ecosistema NovaBank.

---

## Headers Requeridos

| Header | Requerido | Descripción |
|---------|------------|-------------|
| Authorization | Sí | Bearer Token de acceso |
| Content-Type | Sí | application/json |
| Accept | Sí | application/json |
| X-Request-Id | Sí | Identificador único de la solicitud |
| X-Correlation-Id | Opcional | Identificador de trazabilidad distribuida |

### Ejemplo

```http
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
Accept: application/json
X-Request-Id: 7d51b3f8-8fd5-4bdf-b4ce-5b4a8c7b2f11
X-Correlation-Id: 93cb7a40-19a4-4ab6-a5a5-4e2d76d4d99c
```

---

## Payload de Ejemplo

```json
{
  "cuenta_origen": "001234567890",
  "cuenta_destino": "009876543210",
  "monto": 250.75,
  "moneda": "USD",
  "concepto": "Pago de servicios",
  "referencia": "TRX-2026-000145"
}
```

---

## Validaciones de Negocio

- La cuenta origen debe encontrarse activa.
- El saldo disponible debe ser suficiente.
- El monto no debe exceder los límites transaccionales del cliente.
- La operación debe superar las validaciones antifraude y AML.
- La moneda enviada debe estar soportada por la plataforma.

---

## Respuesta Exitosa

### HTTP 200 OK

```json
{
  "codigo": "200",
  "estado": "APROBADA",
  "id_transaccion": "TXN-8F45A921",
  "fecha": "2026-07-01T10:30:00Z"
}
```

---

## Códigos de Error

| Código HTTP | Error | Descripción |
|-------------|--------|-------------|
| 400 | INVALID_REQUEST | Solicitud inválida. |
| 401 | UNAUTHORIZED | Token inválido o expirado. |
| 403 | FORBIDDEN | El usuario no posee permisos suficientes. |
| 404 | ACCOUNT_NOT_FOUND | Cuenta no encontrada. |
| 422 | INSUFFICIENT_FUNDS | Fondos insuficientes. |
| 422 | DAILY_LIMIT_EXCEEDED | Límite diario excedido. |
| 429 | TOO_MANY_REQUESTS | Demasiadas solicitudes. |
| 500 | INTERNAL_SERVER_ERROR | Error interno del servidor. |

---

## Ejemplos de Respuesta de Error

### Fondos insuficientes

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "El saldo disponible es insuficiente para completar la operación."
}
```

### Límite diario excedido

```json
{
  "error": "DAILY_LIMIT_EXCEEDED",
  "message": "La transferencia supera el límite diario permitido."
}
```

---

## Consideraciones de Seguridad

- Todas las comunicaciones utilizan TLS 1.3.
- El endpoint requiere autenticación mediante Bearer Token.
- Las solicitudes son auditadas y almacenadas para fines regulatorios.
- Todas las operaciones están sujetas a monitoreo de fraude y cumplimiento normativo.

---

## Trazabilidad

Cada solicitud genera un identificador único de transacción y un registro de auditoría para garantizar la trazabilidad completa de la operación.
