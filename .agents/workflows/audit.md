---
description: Auditar reportes pendientes en el pipeline Orchestra
---

// turbo-all

# /audit — Orchestra Audit Pipeline

## Contexto
El sistema Orchestra (`.orchestra/`) es un pipeline de orquestación multi-agente basado en archivos.
Agentes externos (Codex, GPT, Claude, etc.) dejan reportes en `.orchestra/inbox/`.
Esta tab auditora los revisa contra la visión del proyecto.

## Pasos

1. **Leer la visión del proyecto:**
   - Lee `.orchestra/VISION.md` completo
   - Lee `.orchestra/AUDIT_CHECKLIST.md` completo

2. **Listar reportes pendientes:**
   ```powershell
   Get-ChildItem -Path ".orchestra/inbox" -Filter "*.md" | Sort-Object LastWriteTime
   ```
   - Si no hay reportes `.md`, reportar "No hay reportes pendientes en inbox/" y terminar.

3. **Para CADA reporte en inbox/:**
   
   a. Leer el reporte completo
   
   b. Seguir el checklist de `AUDIT_CHECKLIST.md` fase por fase:
      - Phase 1: Report Integrity
      - Phase 2: Vision Alignment
      - Phase 3: Scope Discipline
      - Phase 4: Code Quality
      - Phase 5: Documentation
   
   c. **Si los archivos modificados listados existen en el proyecto**, revisarlos para verificar que los cambios descritos se reflejan en el código real.
   
   d. Emitir veredicto:
      - ✅ APPROVED → mover a `.orchestra/approved/`
      - ⚠️ APPROVED WITH NOTES → mover a `.orchestra/approved/`, documentar notas
      - ❌ REJECTED → mover a `.orchestra/rejected/`, generar prompt correctivo

4. **Si el veredicto es REJECTED:**
   - Crear prompt correctivo en `.orchestra/outbox/` usando la plantilla `CORRECTIVE_PROMPT_TEMPLATE` de `PROMPT_TEMPLATES.md`
   - El prompt debe ser específico sobre qué falló y qué corregir

5. **Actualizar el ledger:**
   - Agregar entrada al final de `.orchestra/ledger.md` usando el template de veredicto
   - NO editar entradas anteriores

6. **Resumen final:**
   - Listar todos los reportes procesados con su veredicto
   - Si hay prompts correctivos generados, listarlos

## Notas
- Ser estricto pero justo: rechazar solo cuando hay violaciones claras, no por estilo
- Documentar TODO en el ledger — es el historial oficial
- Si hay duda sobre un cambio, marcar como ⚠️ APPROVED WITH NOTES, no rechazar
