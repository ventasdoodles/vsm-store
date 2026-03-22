# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD REVIEW LANE — POST-A71/A72/A73 RESIDUAL DRAFTING WEAKNESS SCAN

## 1. qué cambió

Después de A71/A72/A73, el cuello de botella ya no está en exact path, ni en BRANCH E, ni en `NO_MATCH`.

La debilidad residual más valiosa ahora está en **BRANCH D (`OUT_OF_STOCK_ALTERNATIVE`)**.

No porque esté mal encaminada, sino porque quedó **subaprovechando contexto ya disponible** cuando `specs` no alcanzan.

## 2. qué quedó validado

El estado actual por ramas quedó así:

- **B**: cauta, razonablemente útil, aunque su wording sigue algo tosco
- **C**: estabilizada
- **D**: usa `specs` para justificar alternativas, pero sólo `specs`
- **E**: ya tiene jerarquía disciplinada `specs → ai_sales_note → description → generic`
- **F**: ya pasó de genérica a guidance útil

La asimetría material restante es:

- **BRANCH D no sigue la misma disciplina de contexto que BRANCH E**

En BRANCH D hoy:

- si hay `specs`, compone una justificación útil
- si no hay `specs`, cae directo al mensaje genérico

Eso deja **infrautilizados** campos que ya existen downstream en los productos alternativos:

- `ai_sales_note`
- potencialmente `description`

Comparado con BRANCH E, BRANCH D quedó más pobre de lo necesario pese a tener contexto disponible.

La rama más “thin” ya no es F; ahora la más rentable de mejorar es D por:

- intención alta del usuario
- hay productos candidatos concretos
- hay contexto no explotado

## 3. qué sigue abierto

Sigue abierto el orden exacto si se mejora BRANCH D:

- `specs`
- luego `ai_sales_note`
- y posiblemente no usar `description`, o dejarla fuera por disciplina

Sigue abierto si conviene mantener BRANCH D más estricta que E para no sonar demasiado segura al sugerir reemplazos.

Pero el hueco estructural más claro ya no es de datos ni de retrieval; es de **jerarquía de consumo en OOS alternatives**.

## 4. qué se aprueba

Apruebo como siguiente lane único:

- **BRANCH D hierarchy alignment for OOS alternatives**

Alcance aprobado:

- sólo [src/lib/product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
- sólo composición de BRANCH D

Objetivo:

- mantener `specs` como mejor señal
- usar `ai_sales_note` como fallback disciplinado cuando `specs` no ayudan
- no convertir la rama en copy más agresivo ni más larga

No apruebo como siguiente lane:

- otro bridge de datos
- retoques de UI
- reabrir B/C/E/F

## 5. cuál es la siguiente jugada exacta

Abrir un micro-lane en [src/lib/product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts) para **alinear BRANCH D con la jerarquía disciplinada ya usada en BRANCH E**.

Qué sí:

- `specs` primero
- `ai_sales_note` como fallback breve en la alternativa top si `specs` no aportan
- fallback genérico intacto

Qué no:

- no tocar retrieval
- no tocar schemas
- no tocar exact path
- no meter `description` salvo que sea estrictamente necesario, que hoy no parece serlo
