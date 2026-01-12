# 💰 Guía: Sistema Híbrido de Ingresos y Cántaros

## 📋 ¿Qué se implementó?

Se agregó un **sistema híbrido completo** que combina:
- **Ingreso Esperado** (planificación manual)
- **Ingreso Real** (calculado desde transacciones)
- **Ajustes Manuales** por cántaro (ya existente)

---

## 🎯 Funcionalidades Implementadas

### 1. **Sistema Híbrido de Ingresos** ⭐ NUEVO
📍 Ubicación: Panel superior en `/user/jars`

**Muestra 2 valores simultáneamente:**
- **💰 Ingreso Esperado**: Lo que planeas ganar (configurado manualmente)
- **📊 Ingreso Real**: Lo que realmente ganaste (desde transacciones del mes)

**Toggle entre modos:**
- Puedes cambiar entre usar ingreso esperado o real para calcular disponibles
- Útil para comparar planificación vs realidad

---

### 2. **Configuración de Ingreso Esperado** 
📍 Ubicación: `/user/config` (pestaña Perfil)

- Campo nuevo: **"Ingreso mensual"**
- Acepta valores decimales
- Se guarda en el perfil del usuario
- Disponible en toda la aplicación

**Cómo usarlo:**
1. Ve a Configuración (menú superior)
2. Pestaña "Perfil"
3. Ingresa tu ingreso mensual (ej: 5000.00)
4. Click en "Guardar cambios"

---

### 3. **Sugerencias Duales por Cántaro** ⭐ MEJORADO
📍 Ubicación: `/user/jars` (en cada tarjeta de cántaro)

Cada cántaro **muestra DOS sugerencias**:

**Ejemplo:**
```
Cántaro: Ahorro (50%)
┌─────────────────────────────────┐
│ 💡 Sugerido (Esperado): $2,500  │← Basado en ingreso esperado
│ 📊 Sugerido (Real):     $2,100  │← Basado en transacciones reales
│ ⚠️ Diferencia:          -$400   │← Gap entre ambos
├─────────────────────────────────┤
│    Asignado: $0.00              │
│    Gastado:  $0.00              │
│ ⭐ Ajuste:   $0.00               │← AJUSTE MANUAL
│    Disponible: $0.00            │
└─────────────────────────────────┘
```

**¿Cómo se calcula?**
- **Sugerido Esperado**: `monthly_income × porcentaje`
  - Si ganas esperado $5,000 y el cántaro es 50% → $2,500
- **Sugerido Real**: `transacciones_mes × porcentaje`
  - Si ganaste real $4,200 y el cántaro es 50% → $2,100
- **Diferencia**: `Real - Esperado`

---

### 4. **Panel Dual de Dinero Disponible** ⭐ NUEVO
📍 Ubicación: `/user/jars` (parte superior)

**Columnas del panel:**

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **💰 Ingreso Esperado** | Configurado manualmente | $5,000.00 |
| **📊 Ingreso Real** | Calculado desde transacciones | $4,200.00 (84%) |
| **Total Asignado** | Suma de todo asignado en cántaros | $3,000.00 |
| **Disponible** | Cuánto queda por asignar | $2,000.00 / $1,200.00 |
| **Toggle** | Cambiar entre esperado/real | ☑️ Usar ingreso real |

**Colores y alertas:**
- 🟢 **Verde (Excellent)**: Alcanzaste o superaste tu meta (≥100%)
- 🟡 **Amarillo (Warning)**: Estás cerca pero no llegaste (70-89%)
- 🔴 **Rojo (Critical)**: Lejos de tu meta (<70%)
- ⚫ **Negro**: Asignaste más de tu ingreso

---

### 5. **Ajustes Manuales por Cántaro** ✅ Ya existente
📍 Ubicación: Botón "Ajustar" en cada cántaro

Permite hacer **correcciones manuales** del balance:

**Modal de Ajuste:**
```
┌─────────────────────────────────────┐
│ Ajustar balance de Ahorro           │
├─────────────────────────────────────┤
│ Balance actual:        $540.00      │
│ Ajuste anterior:        $0.00       │
├─────────────────────────────────────┤
│ Monto a ajustar: [+160.00]         │
│ ✓ Positivo para agregar             │
│ ✓ Negativo para restar              │
├─────────────────────────────────────┤
│ Descripción:                        │
│ "Compensar diferencia de ingreso"   │
├─────────────────────────────────────┤
│ Nuevo balance:         $700.00      │
│ Cambio: +$160.00                    │
├─────────────────────────────────────┤
│         [Cancelar] [Guardar]        │
└─────────────────────────────────────┘
```

**Fórmula final:**
```
Balance = (Asignado - Gastado) + Ajuste
```

---

## 🔄 Flujo de Uso Completo (Sistema Híbrido)

### Paso 1: Configura tu ingreso esperado
```
1. Ve a /user/config
2. Ingresa tu ingreso esperado: $5,000
3. Guarda
```

### Paso 2: Registra tus ingresos reales
```
1. Ve a /user/transactions
2. Registra transacciones de ingreso:
   - Salario: $4,000
   - Freelance: $200
3. Total real: $4,200
```

### Paso 3: Ve el panel híbrido
```
Panel muestra:
├─ 💰 Ingreso Esperado: $5,000
├─ 📊 Ingreso Real: $4,200 (84%)
├─ ⚠️ Diferencia: -$800 (16% bajo)
└─ Estado: ⚠️ Warning
```

### Paso 4: Crea/configura tus cántaros
```
1. Ve a /user/jars
2. Cántaro "Ahorro" → 50% (tipo porcentaje)
3. Cántaro "Gastos" → 30% (tipo porcentaje)
4. Cántaro "Entretenimiento" → 20% (tipo porcentaje)
```

### Paso 5: Ve las sugerencias duales
```
Cántaro Ahorro (50%):
├─ 💡 Sugerido Esperado: $2,500 (50% de $5,000)
├─ 📊 Sugerido Real: $2,100 (50% de $4,200)
└─ ⚠️ Diferencia: -$400
```

### Paso 6: Ajusta según prefieras
```
OPCIÓN A: Usar sugerencia real ($2,100)
└─ Click "Ajustar" → Monto: $2,100 → Guardar

OPCIÓN B: Usar sugerencia esperada ($2,500)
└─ Click "Ajustar" → Monto: $2,500 → Guardar
   (Luego compensas con ajuste manual si necesario)

OPCIÓN C: Ajuste personalizado
└─ Click "Ajustar" → Monto: $2,300 → Guardar
```

### Paso 7: Usa ajustes especiales
```
Si necesitas compensar la diferencia:
├─ Ganaste $400 menos de lo esperado
├─ Quieres mantener meta de $2,500 en Ahorro
└─ Ajuste: +$400 (para compensar)
   Balance final: ($2,100 - $0) + $400 = $2,500
```

---

## 📊 Capturas de Pantalla (Actualizado)

### Panel Superior Híbrido (`MonthlyIncomePanel`)
```
┌──────────────────────────────────────────────────────────────────┐
│  💰 Ingreso Esperado  │  📊 Ingreso Real                         │
│     $5,000.00         │     $4,200.00 (84%)                      │
│                       │     ⚠️ -$800.00                           │
├───────────────────────┼──────────────────────────────────────────┤
│  Total Asignado       │  Disponible                              │
│     $3,000.00 (60%)   │     $2,000.00 / $1,200.00 (40%)         │
├───────────────────────┴──────────────────────────────────────────┤
│  ☑️ Usar ingreso real  (toggle)                                  │
└──────────────────────────────────────────────────────────────────┘
 [█████████████░░░░░░░░░░] 60% asignado
```

### Tarjeta de Cántaro Dual (`JarCard`)
```
┌─────────────────────────────────────┐
│ Ahorro (50%)               [50%]    │
├─────────────────────────────────────┤
│ 💡 Sugerido (Esperado): $2,500.00  │← De monthly_income
│ 📊 Sugerido (Real):     $2,100.00  │← De transacciones
│ ⚠️ Diferencia:          -$400.00   │← Gap
├─────────────────────────────────────┤
│ Asignado:               $2,100.00   │
│ Gastado:                  $300.00   │
│ ⭐ Ajuste:                $400.00   │← AJUSTE MANUAL
├─────────────────────────────────────┤
│ 💵 Disponible:          $2,200.00   │← (2100-300)+400
├─────────────────────────────────────┤
│ [████░░░] $300 / $2,500             │
├─────────────────────────────────────┤
│ [Ajustar ⭐] [Resetear]              │
└─────────────────────────────────────┘
```

---

## 🎯 Casos de Uso de Ajustes Especiales

### **1. Compensar ingreso faltante**
```
Esperabas: $5,000
Ganaste:   $4,200
Diferencia: -$800

Acción:
└─ Distribuir -$800 entre cántaros según prioridad
   ├─ Entretenimiento: -$200 (menos prioritario)
   ├─ Gastos: -$300
   └─ Ahorro: -$300
```

### **2. Bono extraordinario**
```
Recibiste bono: +$500
No está registrado como transacción

Acción:
└─ Ajuste: +$500 en "Ahorro"
```

### **3. Gasto inesperado cubierto**
```
Emergencia médica: $300
Cubierto con ahorros personales

Acción:
└─ Ajuste: -$300 en "Emergencia"
```

### **4. Redistribución entre cántaros**
```
Sobró en Entretenimiento: $150
Necesitas en Transporte: $150

Acción:
├─ Ajuste: -$150 en "Entretenimiento"
└─ Ajuste: +$150 en "Transporte"
```

---

## 📝 Archivos Creados/Modificados

### ✅ Frontend Implementado

1. **src/composables/useCalculatedIncome.ts** (NUEVO)
   - Maneja ingresos calculados desde backend
   - Calcula diferencias y porcentajes
   - Estados: excellent, good, warning, critical

2. **src/components/MonthlyIncomePanel.vue** (ACTUALIZADO)
   - Vista dual: esperado vs real
   - Toggle entre modos
   - Alertas contextuales mejoradas

3. **src/components/JarCard.vue** (ACTUALIZADO)
   - Sugerencias duales
   - Indicador de diferencias
   - Tooltips explicativos

4. **src/pages/user/jars/index.vue** (ACTUALIZADO)
   - Integración de panel híbrido
   - Toggle de modo de cálculo
   - Refresh de ingresos calculados

5. **src/stores/auth.ts** (ACTUALIZADO)
   - Campo `monthly_income` en User interface

6. **src/pages/user/config/index.vue** (ACTUALIZADO)
   - Input para `monthly_income`
   - Guardado en perfil

---

## 📋 Archivos de Documentación

1. **GUIA_INGRESO_MENSUAL.md** (ESTE ARCHIVO)
   - Guía completa del sistema híbrido
   
2. **BACKEND_SPECIFICATIONS.md** ⭐ NUEVO
   - Especificaciones técnicas para backend
   - Migraciones SQL completas
   - Código PHP funcional
   - Endpoints detallados
   - Checklist de implementación

---

## 🚀 Próximos Pasos

### ✅ Frontend: COMPLETO
- [x] Campo monthly_income en configuración
- [x] Panel híbrido con valores duales
- [x] Sugerencias duales por cántaro
- [x] Toggle entre modos
- [x] Ajustes manuales integrados
- [x] Composable para ingresos calculados

### 📋 Backend: PENDIENTE (Ver BACKEND_SPECIFICATIONS.md)

**CRÍTICO - Orden sugerido:**
1. Migration: Agregar `monthly_income` a tabla `users`
2. Migration: Verificar `adjustment` en tabla `jars`
3. Migration: Crear tabla `jar_base_categories`
4. Actualizar modelos User y Jar
5. Crear endpoint `GET /api/v1/jars/income-summary`
6. Crear endpoint `POST /api/v1/jars/{id}/adjust`
7. Actualizar `PUT /api/v1/user/profile`
8. Actualizar `JarBalanceService`

**Documento completo:** [BACKEND_SPECIFICATIONS.md](./BACKEND_SPECIFICATIONS.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si no configuro mi ingreso esperado?**
R: Verás una alerta y solo se usarán ingresos reales (si hay transacciones).

**P: ¿Qué pasa si no tengo transacciones registradas?**
R: El ingreso real será $0, pero puedes usar el ingreso esperado para planificar.

**P: ¿Puedo cambiar entre ingreso esperado y real?**
R: Sí, usa el toggle "Usar ingreso real" en el panel superior.

**P: ¿Los ajustes son permanentes?**
R: Sí, hasta que los resetees o hagas un nuevo ajuste.

**P: ¿Puedo ajustar en negativo?**
R: Sí, pero no puedes dejar el balance negativo.

**P: ¿Las sugerencias son obligatorias?**
R: No, son solo recomendaciones. Puedes ajustar manualmente cualquier monto.

**P: ¿El sistema recalcula automáticamente?**
R: Sí, cada vez que registras una transacción nueva, el ingreso real se actualiza.

---

## 🎉 Ventajas del Sistema Híbrido

### ✅ Para Usuarios con Salario Fijo
- Configura ingreso esperado = salario
- Registra transacciones reales
- Compara si recibiste todo

### ✅ Para Freelancers e Ingresos Variables
- Configura ingreso esperado = meta
- Registra cada pago recibido
- Ve cuánto falta para cumplir meta

### ✅ Para Planificación vs Realidad
- Planifica con ingreso esperado
- Ajusta con ingreso real
- Compensa diferencias con ajustes

### ✅ Flexibilidad Total
- Usa lo que prefieras (esperado o real)
- Cambia en cualquier momento (toggle)
- Ajusta manualmente cuando sea necesario

---

## 🎉 ¡Listo!

Ahora tienes **control total** sobre:
- ✅ Tu ingreso esperado vs real
- ✅ Comparación automática de cumplimiento
- ✅ Sugerencias duales por cántaro
- ✅ Ajustes manuales especiales
- ✅ Toggle entre modos de cálculo
- ✅ Sistema híbrido completo

**📖 Para el backend:** Lee [BACKEND_SPECIFICATIONS.md](./BACKEND_SPECIFICATIONS.md)

**Navega a:** http://localhost:3000/user/jars y disfruta! 🎯

---

**Última actualización:** 25 Diciembre 2025  
**Versión:** 2.0 - Sistema Híbrido Completo
