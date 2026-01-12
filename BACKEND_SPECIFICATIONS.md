# 📋 ESPECIFICACIONES BACKEND - Sistema Híbrido de Ingresos y Cántaros

**Versión:** 2.0  
**Fecha:** 25 Diciembre 2025  
**Propósito:** Implementar sistema híbrido de ingreso esperado vs real + ajustes manuales por cántaro

---

## 🎯 RESUMEN EJECUTIVO

El frontend requiere que el backend implemente:

1. ✅ Campo `monthly_income` en tabla `users` (ingreso esperado/planificado)
2. ✅ Endpoint `GET /api/v1/jars/income-summary` (ingresos reales calculados)
3. ✅ Campo `adjustment` en tabla `jars` (ya existe según análisis)
4. ✅ Soporte para `base_scope` y `base_categories` (filtrado por categorías de ingreso)
5. ✅ Endpoint `POST /api/v1/jars/{id}/adjust` (ajustes manuales)

---

## 📊 CAMBIOS EN BASE DE DATOS

### 1. Tabla `users` - Agregar campo de ingreso esperado

```sql
-- Migration: add_monthly_income_to_users_table
ALTER TABLE users 
ADD COLUMN monthly_income DECIMAL(10, 2) DEFAULT 0 COMMENT 'Ingreso mensual esperado/planificado por el usuario';

-- Index para consultas rápidas (opcional)
CREATE INDEX idx_users_monthly_income ON users(monthly_income);
```

**Descripción:**
- `monthly_income`: Valor fijo que el usuario configura manualmente
- Representa el ingreso **esperado** o **planificado** del mes
- Se usa para calcular sugerencias de asignación a cántaros
- Default: 0 (sin configurar)
- Puede ser actualizado por el usuario en cualquier momento

---

### 2. Tabla `jars` - Verificar campo adjustment

```sql
-- Verificar que existe (según ANALISIS_LOGICA_PORCENTAJE_CANTAROS.md)
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'jars' AND COLUMN_NAME = 'adjustment';

-- Si NO existe, crear:
ALTER TABLE jars 
ADD COLUMN adjustment DECIMAL(10, 2) DEFAULT 0 COMMENT 'Ajuste manual del balance del cántaro';
```

**Descripción:**
- `adjustment`: Monto que se suma/resta al balance calculado
- Permite ajustes manuales por excesos, faltantes o redistribuciones
- Default: 0 (sin ajuste)
- Fórmula final: `balance = (asignado - gastado) + adjustment`

---

### 3. Tabla `jar_base_categories` - Para filtrado de ingresos

```sql
-- Solo si NO existe (verificar primero)
CREATE TABLE IF NOT EXISTS jar_base_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jar_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  
  FOREIGN KEY (jar_id) REFERENCES jars(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_jar_base_category (jar_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Categorías de ingreso base para cálculo de porcentaje en cántaros';

-- Indexes
CREATE INDEX idx_jar_base_categories_jar_id ON jar_base_categories(jar_id);
CREATE INDEX idx_jar_base_categories_category_id ON jar_base_categories(category_id);
```

**Descripción:**
- Relaciona cántaros con categorías de **INGRESO**
- Cuando `base_scope = 'categories'`, solo se suman ingresos de estas categorías
- Diferente de `jar_category` que son categorías de **GASTO**

---

## 🔧 ENDPOINTS REQUERIDOS

### 1. **GET /api/v1/jars/income-summary** ⭐ NUEVO

**Propósito:** Obtener resumen de ingresos del mes actual (esperado vs real)

**Request:**
```http
GET /api/v1/jars/income-summary HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters (opcionales):**
```
?month=2025-01      # Mes específico (default: mes actual)
?year=2025          # Año específico
?date=2025-01-15    # Fecha específica (usa mes de esa fecha)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expected_income": 5000.00,          // monthly_income del usuario
    "calculated_income": 4200.00,        // Suma de ItemTransactions del mes
    "difference": -800.00,               // calculated - expected
    "difference_percentage": -16.00,     // (difference / expected) * 100
    "month": "2025-01",
    "breakdown": {
      "by_category": [                   // Opcional pero útil
        {
          "category_id": 1,
          "category_name": "Salario",
          "amount": 4000.00
        },
        {
          "category_id": 2,
          "category_name": "Freelance",
          "amount": 200.00
        }
      ]
    }
  }
}
```

**Lógica Backend (PHP Laravel):**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ItemTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class JarIncomeController extends Controller
{
    public function getIncomeSummary(Request $request)
    {
        $user = $request->user();
        
        // Determinar el mes a calcular
        $date = $this->getDateFromRequest($request);
        $startOfMonth = $date->clone()->startOfMonth();
        $endOfMonth = $date->clone()->endOfMonth();
        
        // Ingreso esperado (configurado manualmente)
        $expectedIncome = (float) ($user->monthly_income ?? 0);
        
        // Ingreso calculado (transacciones reales)
        $calculatedIncome = (float) ItemTransaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        
        // Diferencia
        $difference = $calculatedIncome - $expectedIncome;
        $differencePercentage = $expectedIncome > 0 
            ? round(($difference / $expectedIncome) * 100, 2)
            : 0;
        
        // Breakdown por categoría (opcional)
        $breakdown = ItemTransaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->join('categories', 'item_transactions.category_id', '=', 'categories.id')
            ->selectRaw('
                categories.id as category_id,
                categories.name as category_name,
                SUM(item_transactions.amount) as amount
            ')
            ->groupBy('categories.id', 'categories.name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'expected_income' => $expectedIncome,
                'calculated_income' => $calculatedIncome,
                'difference' => $difference,
                'difference_percentage' => $differencePercentage,
                'month' => $date->format('Y-m'),
                'breakdown' => [
                    'by_category' => $breakdown
                ]
            ]
        ]);
    }
    
    private function getDateFromRequest(Request $request): Carbon
    {
        if ($request->has('date')) {
            return Carbon::parse($request->input('date'));
        }
        
        if ($request->has('month') && $request->has('year')) {
            return Carbon::create(
                $request->input('year'),
                $request->input('month'),
                1
            );
        }
        
        if ($request->has('month')) {
            return Carbon::parse($request->input('month') . '-01');
        }
        
        return Carbon::now();
    }
}
```

**Registrar Ruta:**
```php
// routes/api.php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('/jars/income-summary', [JarIncomeController::class, 'getIncomeSummary']);
});
```

---

### 2. **PUT /api/v1/user/profile** - Actualizar para aceptar monthly_income

**Request:**
```json
{
  "name": "José Luis",
  "email": "jose@example.com",
  "monthly_income": 5000.00,      // ← NUEVO CAMPO
  "currency_id": 1,
  "password": "nuevo_pass"         // Opcional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente",
  "data": {
    "id": 1,
    "name": "José Luis",
    "email": "jose@example.com",
    "monthly_income": 5000.00,     // ← INCLUIR EN RESPUESTA
    "currency_id": 1,
    "currency": {
      "id": 1,
      "name": "Dólar",
      "symbol": "$",
      "code": "USD"
    }
  }
}
```

**Actualizar Validación:**
```php
$validator = Validator::make($request->all(), [
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users,email,' . $user->id,
    'monthly_income' => 'nullable|numeric|min:0|max:999999999.99',  // ← NUEVO
    'currency_id' => 'nullable|integer|exists:currencies,id',
    'password' => 'nullable|string|min:6|confirmed'
]);
```

---

### 3. **POST /api/v1/jars/{id}/adjust** ⭐ NUEVO

**Propósito:** Crear/actualizar ajuste manual en un cántaro

**Request:**
```json
{
  "amount": 160.00,                    // Positivo = agregar, Negativo = restar
  "description": "Compensar diferencia de ingreso"  // Opcional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ajuste aplicado correctamente",
  "data": {
    "jar_id": 5,
    "jar_name": "Ahorro",
    "adjustment": 160.00,
    "previous_adjustment": 0.00,
    "balance": {
      "asignado": 840.00,
      "gastado": 300.00,
      "ajuste": 160.00,
      "balance": 700.00               // (840 - 300) + 160
    }
  }
}
```

**Lógica Backend:**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Jar;
use App\Services\JarBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JarAdjustmentController extends Controller
{
    protected $balanceService;
    
    public function __construct(JarBalanceService $balanceService)
    {
        $this->balanceService = $balanceService;
    }
    
    public function adjust(Request $request, int $jarId)
    {
        $user = $request->user();
        
        // Validar que el cántaro existe y pertenece al usuario
        $jar = Jar::where('id', $jarId)
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        // Validar request
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
            'description' => 'nullable|string|max:500'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $amount = (float) $request->input('amount');
        $description = $request->input('description');
        
        // Validar que no se intente restar más de lo disponible
        $currentBalance = $this->balanceService->getAvailableBalance($jar);
        $newAdjustment = ($jar->adjustment ?? 0) + $amount;
        $newBalance = $currentBalance + $amount;
        
        if ($newBalance < 0) {
            return response()->json([
                'success' => false,
                'message' => 'El ajuste resultaría en un balance negativo',
                'details' => [
                    'current_balance' => $currentBalance,
                    'requested_adjustment' => $amount,
                    'would_result_in' => $newBalance
                ]
            ], 400);
        }
        
        // Guardar ajuste anterior para historial
        $previousAdjustment = $jar->adjustment ?? 0;
        
        // Actualizar ajuste
        $jar->adjustment = $newAdjustment;
        $jar->save();
        
        // Opcional: registrar en tabla de historial de ajustes
        // JarAdjustmentHistory::create([...]);
        
        // Recalcular balance
        $balance = $this->balanceService->getBalanceBreakdown($jar);
        
        return response()->json([
            'success' => true,
            'message' => 'Ajuste aplicado correctamente',
            'data' => [
                'jar_id' => $jar->id,
                'jar_name' => $jar->name,
                'adjustment' => $jar->adjustment,
                'previous_adjustment' => $previousAdjustment,
                'balance' => $balance
            ]
        ]);
    }
    
    public function resetAdjustment(int $jarId)
    {
        $user = auth()->user();
        
        $jar = Jar::where('id', $jarId)
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        $previousAdjustment = $jar->adjustment ?? 0;
        $jar->adjustment = 0;
        $jar->save();
        
        $balance = $this->balanceService->getBalanceBreakdown($jar);
        
        return response()->json([
            'success' => true,
            'message' => 'Ajuste reseteado correctamente',
            'data' => [
                'jar_id' => $jar->id,
                'jar_name' => $jar->name,
                'adjustment' => 0,
                'previous_adjustment' => $previousAdjustment,
                'balance' => $balance
            ]
        ]);
    }
}
```

**Registrar Rutas:**
```php
// routes/api.php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post('/jars/{id}/adjust', [JarAdjustmentController::class, 'adjust']);
    Route::post('/jars/{id}/adjust/reset', [JarAdjustmentController::class, 'resetAdjustment']);
});
```

---

### 4. **Actualizar JarBalanceService** - Soporte para base_scope

**Modificar método `calculateUserIncome()`:**

```php
<?php

namespace App\Services;

use App\Models\ItemTransaction;
use App\Models\Jar;
use Carbon\Carbon;

class JarBalanceService
{
    /**
     * Calcula el ingreso del usuario para el mes
     * Ahora soporta filtrado por categorías según base_scope
     */
    private function calculateUserIncome(int $userId, Jar $jar, Carbon $date): float
    {
        $startOfMonth = $date->clone()->startOfMonth();
        $endOfMonth = $date->clone()->endOfMonth();

        $query = ItemTransaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        // NUEVO: Filtrar por categorías base según base_scope
        if ($jar->base_scope === 'categories' && $jar->baseCategories()->exists()) {
            // Solo sumar ingresos de las categorías base asignadas
            $query->whereIn('category_id', $jar->baseCategories()->pluck('id'));
        }
        // Si base_scope = 'all_income' o no está definido, suma TODOS los ingresos

        return (float) $query->sum('amount');
    }
    
    /**
     * Actualizar para pasar el jar completo
     */
    private function calculateAllocatedAmount(Jar $jar, Carbon $date): float
    {
        if ($jar->type === 'percent') {
            // Pasar el jar completo para filtrado por categorías
            $income = $this->calculateUserIncome($jar->user_id, $jar, $date);
            return $income * ($jar->percent / 100);
        }
        
        if ($jar->type === 'fixed') {
            return (float) $jar->fixed_amount;
        }
        
        return 0;
    }
    
    /**
     * Balance disponible (ACTUALIZADO)
     */
    public function getAvailableBalance(Jar $jar, ?Carbon $date = null): float
    {
        $date = $date ?? Carbon::now();
        
        // 1. Cantidad asignada
        $allocatedAmount = $this->calculateAllocatedAmount($jar, $date);
        
        // 2. Cantidad gastada
        $spentAmount = $this->calculateSpentAmount($jar, $date);
        
        // 3. Ajuste manual
        $adjustment = (float) ($jar->adjustment ?? 0);
        
        // FÓRMULA: (asignado - gastado) + ajuste
        return $allocatedAmount - $spentAmount + $adjustment;
    }
    
    /**
     * Breakdown completo del balance (NUEVO)
     */
    public function getBalanceBreakdown(Jar $jar, ?Carbon $date = null): array
    {
        $date = $date ?? Carbon::now();
        
        $asignado = $this->calculateAllocatedAmount($jar, $date);
        $gastado = $this->calculateSpentAmount($jar, $date);
        $ajuste = (float) ($jar->adjustment ?? 0);
        $balance = $asignado - $gastado + $ajuste;
        
        $porcentajeUtilizado = $asignado > 0 
            ? round(($gastado / $asignado) * 100, 2)
            : 0;
        
        return [
            'asignado' => $asignado,
            'gastado' => $gastado,
            'ajuste' => $ajuste,
            'balance' => $balance,
            'porcentaje_utilizado' => $porcentajeUtilizado
        ];
    }
}
```

---

### 5. **Actualizar JarController** - Aceptar base_categories

**Modificar método `save()`:**

```php
public function save(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:100',
        'type' => 'nullable|in:fixed,percent',
        'percent' => 'nullable|numeric|min:0|max:100',
        'fixed_amount' => 'nullable|numeric|min:0',
        'base_scope' => 'nullable|in:all_income,categories',
        'base_categories' => 'nullable|array',               // ← NUEVO
        'base_categories.*' => 'integer|exists:categories,id', // ← NUEVO
        'categories' => 'nullable|array',
        'categories.*' => 'integer|exists:categories,id',
        // ... otros campos
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $payload = $request->all();
    
    // Validación adicional: si base_scope = 'categories' debe haber categorías
    if (($payload['base_scope'] ?? null) === 'categories' && 
        empty($payload['base_categories'])) {
        return response()->json([
            'success' => false,
            'message' => 'Debes seleccionar al menos una categoría de ingreso cuando base_scope es "categories"'
        ], 422);
    }
    
    $jar = $this->jarRepo->store($payload);
    
    // Asignar categorías de gasto (existente)
    if ($request->filled('categories')) {
        $jar->categories()->sync($request->input('categories'));
    }
    
    // Asignar categorías base de ingreso (NUEVO)
    if ($request->filled('base_categories')) {
        $jar->baseCategories()->sync($request->input('base_categories'));
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Cántaro guardado correctamente',
        'data' => $jar->load(['categories', 'baseCategories'])
    ]);
}
```

---

### 6. **Actualizar Modelo Jar**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jar extends Model
{
    protected $fillable = [
        'name',
        'user_id',
        'type',
        'fixed_amount',
        'percent',
        'base_scope',
        'refresh_mode',
        'adjustment',      // ← Asegurar que esté
        'active',
        'sort_order',
        'color',
        'date'
    ];

    protected $casts = [
        'fixed_amount' => 'decimal:2',
        'percent' => 'decimal:2',
        'adjustment' => 'decimal:2',   // ← IMPORTANTE
        'active' => 'boolean',
        'date' => 'date'
    ];

    /**
     * Categorías de GASTO (dónde se gastó)
     */
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'jar_category',
            'jar_id',
            'category_id'
        )->withTimestamps();
    }

    /**
     * Categorías base de INGRESO (de dónde viene el dinero)
     * ← NUEVO
     */
    public function baseCategories()
    {
        return $this->belongsToMany(
            Category::class,
            'jar_base_categories',
            'jar_id',
            'category_id'
        )->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

### 7. **Actualizar Modelo User**

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'monthly_income',   // ← AGREGAR
        'currency_id',
        'phone',
        'balance',
        'client_id',
        'active',
        'role_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'monthly_income' => 'decimal:2',  // ← AGREGAR
        'balance' => 'decimal:2',
        'active' => 'boolean'
    ];

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function jars()
    {
        return $this->hasMany(Jar::class);
    }

    // ... otros métodos
}
```

---

## 🔍 TABLA DE COMPORTAMIENTO: base_scope

| base_scope | base_categories | Comportamiento |
|------------|----------------|----------------|
| `null` o sin definir | (no importa) | Suma **TODOS** los ingresos (type='income') |
| `'all_income'` | (cualquiera) | Suma **TODOS** los ingresos, ignora categorías |
| `'categories'` | ✅ SÍ (tiene categorías) | Suma **SOLO** ingresos de esas categorías |
| `'categories'` | ❌ NO (vacío) | Retornar error 422 en validación |

**Ejemplo de uso:**

```json
// Cántaro que usa TODOS los ingresos
{
  "name": "Ahorro General",
  "type": "percent",
  "percent": 20,
  "base_scope": "all_income"
}

// Cántaro que usa solo ingresos de Freelance
{
  "name": "Ahorro Freelance",
  "type": "percent",
  "percent": 30,
  "base_scope": "categories",
  "base_categories": [5, 7]  // IDs de categorías Freelance
}
```

---

## 📝 TABLA RESUMEN DE CAMBIOS

| Item | Tipo | Estado | Prioridad |
|------|------|--------|-----------|
| Campo `monthly_income` en `users` | Migration | ⭐ Requerido | Alta |
| Campo `adjustment` en `jars` | Verificar | ✅ Ya existe | Media |
| Tabla `jar_base_categories` | Migration | ⭐ Requerido | Alta |
| Endpoint `GET /jars/income-summary` | Nuevo | ⭐ Requerido | Alta |
| Actualizar `PUT /user/profile` | Modificar | ⭐ Requerido | Alta |
| Endpoint `POST /jars/{id}/adjust` | Nuevo | ⭐ Requerido | Alta |
| Actualizar `JarBalanceService` | Modificar | ⭐ Requerido | Media |
| Actualizar `JarController` | Modificar | 📘 Opcional | Baja |
| Actualizar Modelo `Jar` | Modificar | ⭐ Requerido | Media |
| Actualizar Modelo `User` | Modificar | ⭐ Requerido | Alta |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (Crítico)
- [ ] Crear migration para `monthly_income` en `users`
- [ ] Verificar/crear campo `adjustment` en `jars`
- [ ] Crear migration para tabla `jar_base_categories`
- [ ] Ejecutar migrations: `php artisan migrate`

### Fase 2: Modelos (Crítico)
- [ ] Actualizar modelo `User` (agregar `monthly_income` en fillable y casts)
- [ ] Actualizar modelo `Jar` (agregar `adjustment` y relación `baseCategories()`)
- [ ] Verificar que relaciones funcionen correctamente

### Fase 3: Servicios (Crítico)
- [ ] Actualizar `JarBalanceService::calculateUserIncome()` con filtrado por categorías
- [ ] Actualizar `JarBalanceService::calculateAllocatedAmount()` para pasar Jar completo
- [ ] Crear método `JarBalanceService::getBalanceBreakdown()`
- [ ] Actualizar `JarBalanceService::getAvailableBalance()` para incluir adjustment

### Fase 4: Controladores (Crítico)
- [ ] Crear `JarIncomeController` con método `getIncomeSummary()`
- [ ] Crear `JarAdjustmentController` con métodos `adjust()` y `resetAdjustment()`
- [ ] Actualizar validación en `UserController::updateProfile()` para aceptar `monthly_income`
- [ ] Actualizar `JarController::save()` para aceptar y sincronizar `base_categories`

### Fase 5: Rutas (Crítico)
- [ ] Registrar `GET /api/v1/jars/income-summary`
- [ ] Registrar `POST /api/v1/jars/{id}/adjust`
- [ ] Registrar `POST /api/v1/jars/{id}/adjust/reset`
- [ ] Verificar que todas usen middleware `auth:sanctum`

### Fase 6: Testing (Recomendado)
- [ ] Test: Crear usuario con `monthly_income`
- [ ] Test: Obtener `/jars/income-summary` retorna datos correctos
- [ ] Test: Ajustar cántaro con `POST /jars/{id}/adjust`
- [ ] Test: Balance se calcula correctamente con adjustment
- [ ] Test: `base_scope = 'categories'` filtra ingresos correctamente

### Fase 7: Documentación (Opcional)
- [ ] Actualizar Postman collection
- [ ] Documentar nuevos endpoints en README o Swagger
- [ ] Agregar ejemplos de uso

---

## 🚨 VALIDACIONES IMPORTANTES

### 1. No permitir balance negativo en ajustes

```php
if ($newBalance < 0) {
    return response()->json([
        'success' => false,
        'message' => 'El ajuste resultaría en un balance negativo'
    ], 400);
}
```

### 2. Validar categorías base cuando base_scope = 'categories'

```php
if ($payload['base_scope'] === 'categories' && empty($payload['base_categories'])) {
    return response()->json([
        'success' => false,
        'message' => 'Debes seleccionar categorías de ingreso'
    ], 422);
}
```

### 3. Validar que monthly_income no sea negativo

```php
'monthly_income' => 'nullable|numeric|min:0|max:999999999.99'
```

---

## 📊 EJEMPLOS DE RESPUESTAS

### Ejemplo 1: Usuario sin ingresos reales aún

```json
{
  "success": true,
  "data": {
    "expected_income": 5000.00,
    "calculated_income": 0.00,
    "difference": -5000.00,
    "difference_percentage": -100.00,
    "month": "2025-01",
    "breakdown": {
      "by_category": []
    }
  }
}
```

### Ejemplo 2: Usuario superó su meta

```json
{
  "success": true,
  "data": {
    "expected_income": 5000.00,
    "calculated_income": 5500.00,
    "difference": 500.00,
    "difference_percentage": 10.00,
    "month": "2025-01"
  }
}
```

### Ejemplo 3: Ajuste exitoso

```json
{
  "success": true,
  "message": "Ajuste aplicado correctamente",
  "data": {
    "jar_id": 5,
    "jar_name": "Ahorro",
    "adjustment": 160.00,
    "previous_adjustment": 0.00,
    "balance": {
      "asignado": 840.00,
      "gastado": 300.00,
      "ajuste": 160.00,
      "balance": 700.00
    }
  }
}
```

---

## 🎯 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **Migrations** → Base de datos primero
2. **Modelos** → Actualizar User y Jar
3. **JarBalanceService** → Lógica de cálculo
4. **JarIncomeController** → Endpoint de income-summary
5. **JarAdjustmentController** → Endpoints de ajustes
6. **UserController** → Actualizar perfil
7. **JarController** → Soporte para base_categories
8. **Testing** → Validar todo funciona

**Tiempo estimado:** 4-6 horas de desarrollo

---

## 📞 CONTACTO Y SOPORTE

Si tienes dudas sobre alguna implementación o necesitas clarificaciones:

- Revisa el documento `ANALISIS_LOGICA_PORCENTAJE_CANTAROS.md`
- Verifica las tablas de comportamiento
- Los ejemplos de código son funcionales, solo adapta namespaces

---

**Documento generado:** 25 Diciembre 2025  
**Versión Frontend:** Compatible con GUIA_INGRESO_MENSUAL.md  
**Estado:** ✅ Listo para implementación backend
