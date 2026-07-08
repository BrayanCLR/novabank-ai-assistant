#!/bin/bash
# Renovación automática del certificado Let's Encrypt.
# certbot renew es idempotente: solo renueva si el certificado está a
# menos de 30 días de expirar, así que correrlo seguido (2 veces al
# día, la recomendación oficial de Let's Encrypt) es seguro.
set -e

cd /opt/novabank

docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet

# nginx no detecta solo que el archivo del certificado cambió en disco
# -- hay que decirle explícitamente que lo recargue, igual que vivimos
# con el cambio de nginx.conf hace unos días.
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload