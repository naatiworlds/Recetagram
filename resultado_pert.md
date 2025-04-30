
# 📊 **Resultados del Análisis PERT**

## 🧩 Tareas

| **Nombre**        | **Duración** | **Predecesoras**      | **ES** | **EF** | **LS** | **LF** | **Holgura** |
| ----------------- | ------------ | --------------------- | ------ | ------ | ------ | ------ | ----------- |
| header            | 1            |                       | 0      | 1      | 6      | 7      | 6           |
| nav               | 1            |                       | 0      | 1      | 0      | 1      | 0           |
| stores            | 1            |                       | 0      | 1      | 0      | 1      | 0           |
| explorar          | 3            | nav                   | 1      | 4      | 6      | 9      | 5           |
| perfiles          | 4            | nav, stores           | 1      | 5      | 1      | 5      | 0           |
| comentarios       | 2            | stores                | 1      | 3      | 7      | 9      | 6           |
| formularios       | 2            | nav, stores           | 1      | 3      | 6      | 8      | 5           |
| notificaciones    | 2            | header, stores        | 1      | 3      | 7      | 9      | 6           |
| mensajes directos | 5            | stores, nav           | 1      | 6      | 4      | 9      | 3           |
| validaciones      | 1            | formularios           | 3      | 4      | 8      | 9      | 5           |
| administracion    | 4            | nav, stores, perfiles | 5      | 9      | 5      | 9      | 0           |

---

## 🛤️ Camino Crítico

**nav → perfiles → administracion**

**Duración total del proyecto:** `9 unidades de tiempo`

---

## 🔥 Tareas en el Camino Crítico (Holgura = 0)

- **nav**: duración = 1  
- **perfiles**: duración = 4  
- **administracion**: duración = 4  
