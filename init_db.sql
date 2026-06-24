

-- ========================================================
-- INFRAESTRUCTURA DE BASE DE DATOS - PULSE SAAS HÍBRIDO
-- ========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    monedas_balance INT DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    plan_tipo VARCHAR(50) DEFAULT 'FREE',
    estado_suscripcion VARCHAR(50) NOT NULL,
    periodo_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regalos_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL,
    costo_monedas INT NOT NULL,
    icono_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS batallas_en_vivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_alfa_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    creador_beta_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    puntos_alfa INT DEFAULT 0,
    puntos_beta INT DEFAULT 0,
    estado_batalla VARCHAR(20) DEFAULT 'PROGRESO',
    ganador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    iniciado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    termina_en TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS historial_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emisor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    receptor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(30) NOT NULL,
    monedas_gastadas INT NOT NULL,
    comision_plataforma_monedas INT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado_suscripcion);
CREATE INDEX IF NOT EXISTS idx_batallas_estado ON batallas_en_vivo(estado_batalla);
