# 🦖 DinoBit — Dinosaurio para micro:bit V2

[![Versión](https://img.shields.io/badge/versión-1.1.9-blue.svg)]()
[![Plataforma](https://img.shields.io/badge/plataforma-micro%3Abit%20V2-green.svg)]()
[![MakeCode](https://img.shields.io/badge/MakeCode-TypeScript-orange.svg)]()
[![Licencia](https://img.shields.io/badge/licencia-MIT-yellow.svg)]()

Un clon del clásico **juego del dinosaurio de Chrome** adaptado al **micro:bit V2**, con soporte para **récord mundial por radio**, **persistencia en flash**, **controles por pines capacitivos** y un montón de opciones configurables.

---

## 📖 Descripción

**DinoBit** es un juego completo para el micro:bit V2 que recrea la experiencia del dinosaurio de Chrome pero con las limitaciones (y ventajas) de la matriz de 5×5 LEDs. Esquiva obstáculos, sube de nivel automáticamente, compite por el récord mundial con otros micro:bits cercanos y guarda tu progreso en la memoria flash.

### ✨ Características principales

- 🦖 **Jugabilidad clásica**: salta obstáculos que aparecen al azar, con velocidad progresiva.
- 🎮 **Controles flexibles**: botones A, B y pin capacitivo 2 (todo configurable).
- 💾 **Persistencia en flash**: el récord local, el volumen y el récord mundial se conservan entre apagones.
- 📡 **Récord mundial por radio**: comparte y recibe el récord mundial con otros micro:bits cercanos (grupo 42).
- 🔒 **Bloqueo por versión**: si detecta una versión online superior por radio, se desactiva el récord mundial temporalmente hasta actualizar.
- ❤️ **Sistema de vidas** (1-5 configurable, representadas en LEDs arriba a la derecha).
- 🔊 **Sonido**: pitidos al saltar y al alcanzar múltiplos de 100 puntos.
- 🎵 **Menú de volumen** integrado (A baja, B sube) con representación visual por barras.
- ⏸️ **Pausa** con el logo táctil.
- 🔄 **Reset del récord local** con combinación de teclas.
- ⚙️ **Configuración extensa** al inicio del código (velocidades, puntaje, teclas, vidas, etc.).

---

## 🕹️ Controles

### Pantalla de intro

| Entrada | Acción |
| :--- | :--- |
| **A** | Iniciar partida |
| **Logo mantenido 1.5 s** | Abrir menú de volumen |

### Durante la partida

| Entrada | Acción |
| :--- | :--- |
| **A** | Saltar |
| **Pin 2** | Saltar |
| **B** | Bajar al suelo al instante (cancela el salto) |
| **Logo (toque corto)** | Pausar / Reanudar |
| **Logo (mantener 1.5 s)** | Abrir menú de volumen |

### Menú de volumen

| Entrada | Acción |
| :--- | :--- |
| **B** | Subir volumen |
| **A** | Bajar volumen |
| **Logo (toque corto)** | Salir del menú |

### Reset del récord local

| Entrada | Acción |
| :--- | :--- |
| **Logo + A + B (mantener 3 s)** | Abrir prompt `RESET? A=SI B=NO` |
| **A** (dentro del prompt) | Confirmar → récord local a 0 |
| **B** (dentro del prompt) | Cancelar |

> ⚠️ **Nota**: el prompt de reset bloquea todas las entradas hasta que el texto completa una vuelta por pantalla, para evitar pulsaciones accidentales.

---

## 📡 Récord mundial por radio

El juego comparte el récord mundial con otros micro:bits que tengan el mismo código cargado y estén dentro del **grupo de radio 42**.

### Cómo funciona

1. **Al arrancar**: tu placa lee su récord mundial de la flash y lo emite.
2. **Cada 10 segundos**: retransmite el récord mundial (para que nuevas placas lo reciban).
3. **Al hacer un nuevo récord**: si supera el mundial actual, se emite inmediatamente.

### Formato del mensaje

```
WR:<version_online>:<score>
```

Ejemplo: `WR:1.0:1234`

### Bloqueo por versión

Si tu placa recibe un mensaje con una **versión online superior** a la tuya:

- ⛔ El récord mundial se **desactiva** temporalmente.
- 🖥️ La intro muestra `UPDATE` en lugar de `w:X`.
- 🔓 Se **reactiva** automáticamente al recibir un mensaje de una versión igual o inferior.

Esto evita que placas con versiones incompatibles corrompan los récords entre sí.

### Ligas separadas

Si quieres tener **grupos aislados** (por ejemplo, dos aulas en el mismo edificio), cambia `CFG_RADIO_GROUP` a otro valor en la configuración:

```typescript
let CFG_RADIO_GROUP = 42   // Cambia a 77, 88, etc.
```

---

## ⚙️ Configuración

Todo el juego es configurable desde el **bloque superior** del código. Aquí las variables más importantes:

### Versiones

```typescript
let CFG_VERSION_ONLINE = "1.0"   // Se compara por radio
let CFG_VERSION_DEV = "1.1.9"    // Solo informativa
```

### Velocidades

```typescript
let CFG_VELOCIDAD_INICIAL = 350   // ms entre pasos de obstáculo al empezar
let CFG_VELOCIDAD_MINIMA = 35     // ms mínimo (más rápido posible)
let CFG_ACELERAR_CADA = 2500      // Cada cuántos ms se acelera
let CFG_ACELERAR_PASO = 6         // Cuántos ms se reduce cada vez
```

### Puntaje

```typescript
let CFG_PUNTAJE_MS = 75           // +1 punto cada X ms
let CFG_HITO_CADA = 100           // Pitido cada X puntos
```

### Salto

```typescript
let CFG_SALTO_DURACION = 500      // Duración del salto en ms
```

### Logo

```typescript
let CFG_LOGO_LARGO_MS = 1500      // Tiempo para abrir el menú de volumen
let CFG_RESET_COMBO_MS = 3000     // Tiempo para abrir el prompt de reset
```

### Volumen y vidas

```typescript
let CFG_VOLUMEN_MAX = 5           // Nivel máximo del volumen
let CFG_VOLUMEN_INICIAL = 3       // Volumen al arrancar
let CFG_VIDAS = 3                 // 1 a 5 (LEDs arriba a la derecha)
```

### Radio

```typescript
let CFG_RADIO_GROUP = 42          // Grupo exclusivo del juego
let CFG_BROADCAST_EVERY_MS = 10000 // Cada cuánto retransmitir el récord mundial
```

### Teclas (activar/desactivar)

```typescript
let CFG_SALTAR_CON_A = true
let CFG_SALTAR_CON_B = false      // B no salta (baja al suelo)
let CFG_SALTAR_CON_PIN2 = true
let CFG_BAJAR_CON_B = true        // B baja al instante
let CFG_INICIAR_CON_A = true
```

---

## 🚀 Instalación

### Requisitos

- **micro:bit V2** (obligatorio — usa pines capacitivos, logo táctil y speaker).
- Navegador **Chrome, Edge, Brave u Opera** (para MakeCode).

### Pasos

1. **Abre MakeCode** para micro:bit: [makecode.microbit.org](https://makecode.microbit.org)

2. **Añade la extensión `flashstorage`**:
   - Ve a **Extensiones** (botón `+` al final de la lista de bloques).
   - **NO busques por nombre**. Pega esta URL en la barra de búsqueda:
     ```
     https://github.com/bsiever/microbit-pxt-flashstorage
     ```
   - Pulsa Enter y haz clic en el resultado para añadirla.

3. **Crea un proyecto nuevo** y cambia la vista a **JavaScript** (arriba en el centro).

4. **Pega el código** de `dinobit.ts` (o `main.ts`).

5. **Verifica que la placa es V2**: en la esquina superior izquierda del editor debe decir **micro:bit V2**.

6. **Descarga** y flashea el `.hex` en tu micro:bit.

> ⚠️ **Importante sobre la persistencia**: cada vez que flasheas un nuevo `.hex`, la memoria flash del micro:bit **se borra**. El récord y el volumen solo persisten entre apagones y encendidos, **no entre reflasheos**. Esto es una limitación del hardware, no del juego.

---

## 🔗 Extensiones y dependencias

Este proyecto usa la extensión de la comunidad **[flashstorage](https://github.com/bsiever/microbit-pxt-flashstorage)** de [@bsiever](https://github.com/bsiever), que permite guardar pares clave-valor en la memoria flash del micro:bit V2.

### API usada

| Método | Descripción |
| :--- | :--- |
| `flashstorage.put(key, value)` | Guarda un par clave-valor |
| `flashstorage.get(key)` | Lee un valor (devuelve `""` si no existe) |
| `flashstorage.getOrDefault(key, def)` | Lee un valor con default seguro |
| `flashstorage.remove(key)` | Borra una clave |
| `flashstorage.size()` | Devuelve cuántos pares hay guardados |

### Limitaciones del hardware

- **Máximo 5 pares clave-valor** (limitación del micro:bit V2, no de la extensión).
- Usamos **4 claves**: `record`, `worldrecord`, `volume`, `wrdisabled`.
- La flash se **borra al reflashear**.

---

## 📊 Change log

| Versión dev |Versión Pública| Cambios |
| :--- | :--- | :--- |
| **1.0.0** |1.0| Versión inicial: salto, pausa, volumen, récord en RAM |
| **1.0.1** |1.0| Más rápido al inicio + A inicia + B sube volumen |
| **1.0.2** |1.0| Vidas configurables (1-5) |
| **1.0.3** |1.0| Velocidad del scroll configurable |
| **1.0.4** |1.0| Menú de volumen en intro |
| **1.0.5** |1.0| B baja al suelo al instante |
| **1.0.6** |1.0| Intento con `datalogger` (fallido) |
| **1.0.7** |1.0| Récord mundial por radio |
| **1.0.8** |1.0| Reset local con logo+A+B |
| **1.0.9** |1.0| Prompt de reset con scroll |
| **1.0.10** |1.0| Solo el mundial se comparte por radio |
| **1.0.11** |1.0| Prueba con `filesystem` (deprecada) |
| **1.0.12** |1.0| `flashstorage` de bsiever |
| **1.0.13** |1.0| Versión online + versión dev separadas |
| **1.0.14** |1.0| Fallback sin persistencia (por error de linker) |
| **1.0.15** |1.0| Recuperación + código sin extensión |
| **1.1.6** |1.0| API correcta: `put` / `getOrDefault` |
| **1.1.7** |1.0| Bloqueo por versión recibida mayor |
| **1.1.8** |1.0| Pausa de 150 ms tras `put()` para la flash |
| **1.1.9** |1.0| Icono de disquete durante el guardado |

---

## 🐛 Problemas conocidos

- **Sonido eléctrico al guardar**: el `beep()` del game over puede solaparse con el guardado en flash, produciendo un pequeño chirrido. Es cosmético.
- **Dibujo superpuesto al disquete**: a veces se ven restos del X del game over mezclados con el disquete durante el guardado. También cosmético.
- **Flash borrada al reflashear**: limitación del hardware, no del código.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Si quieres añadir features:

1. Haz un fork del repositorio.
2. Crea una rama (`git checkout -b feature/mi-nueva-feature`).
3. Asegúrate de incrementar `CFG_VERSION_DEV` con el cambio.
4. Haz commit (`git commit -am 'Añade mi feature'`).
5. Push a la rama (`git push origin feature/mi-nueva-feature`).
6. Abre un Pull Request.

### Reglas para versiones

- **`CFG_VERSION_ONLINE`**: solo cambia al **publicar** una versión que rompe compatibilidad con versiones anteriores.
- **`CFG_VERSION_DEV`**: incrementa en **cada cambio** (aunque sea pequeño).

---

## 💡 Roadmap

- [ ] **Modo multijugador** (carrera entre 2+ micro:bits por radio).
- [ ] **Más tipos de obstáculos** (pterodáctilos voladores, obstáculos dobles).
- [ ] **Modo agacharse** (para esquivar obstáculos altos).
- [ ] **Skins del dinosaurio** (configurable).
- [ ] **Récord por tiempo** además del récord por puntaje.

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente. Ver [LICENSE](LICENSE) para más detalles.

La extensión `flashstorage` tiene su propia licencia, ver el [repositorio oficial](https://github.com/bsiever/microbit-pxt-flashstorage).

---

## 🙏 Agradecimientos

- **[bsiever](https://github.com/bsiever)** por la extensión `microbit-pxt-flashstorage`.
- **Microsoft MakeCode** por el excelente editor.
- **Google Chrome** por el juego original que inspiró este clon.

---

## 🔗 Enlaces

- [MakeCode editor](https://makecode.microbit.org)
- [flashstorage en GitHub](https://github.com/bsiever/microbit-pxt-flashstorage)
- [Documentación del micro:bit V2](https://microbit.org/get-started/user-guide/microbit-v2/)
- [Radio del micro:bit](https://makecode.microbit.org/reference/radio)

---

<div align="center">

**Hecho con ❤️ para la comunidad del micro:bit**

🦖 ¡Que disfrutes del juego! 🦖

</div>
