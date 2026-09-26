# Guía de Contribución y Convenciones del Repositorio
**Proyecto:** Usability Test Dashboard 2.0  
**Grupo 4 IHC:** Vladimir González, Santiago Mora, Pedro Acaro, Boris Vinces

---

## 🌳 Estrategia de Ramas (GitFlow)

- `main`: Rama de producción. Protegida con revisión obligatoria y CI.
- `develop`: Rama de integración para el sprint actual.
- `feature/<HU-codigo>-<descripcion-corta>`: Ramas de funcionalidad por Historia de Usuario (ej. `feature/HU-01-registro-prueba`, `feature/HU-10-navegacion-dashboard`).
- `release/*`: Estabilización previa a entrega de sprint.
- `hotfix/*`: Correcciones críticas directas a producción.

---

## 📝 Convención de Commits (Conventional Commits)

Cada commit debe seguir la estructura:
```
<tipo>(<alcance>): <descripción concisa en imperativo o presente>

[cuerpo opcional detallando el porqué del cambio]
```

### Tipos permitidos:
- `feat`: Nueva funcionalidad o componente interactivo.
- `fix`: Corrección de errores, fallos de renderizado o validaciones.
- `style`: Estilos visuales, tokens de diseño, tipografía o espaciado (sin alterar lógica).
- `refactor`: Reestructuración de código para mejorar calidad o legibilidad.
- `chore`: Tareas de configuración, dependencias o tooling.
- `docs`: Documentación (README, guías de arquitectura, comentarios JSDoc).
- `test`: Pruebas unitarias o de integración.

### Ejemplos válidos:
- `feat(atoms): create StarRating atom with Norman affordance for satisfaction score`
- `style(tokens): define Mid-Fi design tokens for typography and WCAG colors`
- `docs(backend): add NestJS integration guide and endpoint contracts`

---

## 🔍 Checklist de Pull Request (PR)

Antes de solicitar revisión:
1. [ ] El código compila sin errores (`npm run build`).
2. [ ] Sigue las reglas de `.editorconfig` y formato acordado.
3. [ ] Cumple con las pautas de accesibilidad WCAG 2.1 AA (contraste ≥ 4.5:1, etiquetas persistentes).
4. [ ] El commit o PR mapea a una Historia de Usuario del Sprint Backlog.
