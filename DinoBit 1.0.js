// ============================================================
//   DINOSAURIO - micro:bit V2
//   Version dev: 1.1.9 | Version online: 1.0
//   Extension requerida: flashstorage (bsiever)
//   URL: https://github.com/bsiever/microbit-pxt-flashstorage
//   API usada: put / getOrDefault
//   Radio grupo 42: comparte record mundial + version online
// ============================================================

// -------- CONFIGURACION --------
let CFG_VERSION_ONLINE = "1.0"
let CFG_VERSION_DEV = "1.1.9"

// Velocidades
let CFG_VELOCIDAD_INICIAL = 350
let CFG_VELOCIDAD_MINIMA = 35
let CFG_ACELERAR_CADA = 2500
let CFG_ACELERAR_PASO = 6

// Puntaje
let CFG_PUNTAJE_MS = 75
let CFG_HITO_CADA = 100

// Salto
let CFG_SALTO_DURACION = 500

// Logo
let CFG_LOGO_LARGO_MS = 1500
let CFG_RESET_COMBO_MS = 3000

// Volumen
let CFG_VOLUMEN_MAX = 5
let CFG_VOLUMEN_INICIAL = 3

// Vidas
let CFG_VIDAS = 3
if (CFG_VIDAS < 1) CFG_VIDAS = 1
if (CFG_VIDAS > 5) CFG_VIDAS = 5

// Pantalla final
let CFG_SCROLL_PUNTAJE_MS = 60
let CFG_SCROLL_RECORD_MS = 60
let CFG_PAUSA_MENSAJE_MS = 300

// Intro y radio
let CFG_INTRO_SCROLL_MS = 120
let CFG_RADIO_GROUP = 42
let CFG_RECORD_PREFIX = "WR:"
let CFG_BROADCAST_EVERY_MS = 10000

// Prompt de reset
let CFG_RESET_PROMPT_MS = 90
let CFG_RESET_RESULT_MS = 60

// Guardado en flash
let CFG_SAVE_ICON_MS = 150   // tiempo que se muestra el disquete

// Teclas
let CFG_SALTAR_CON_A = true
let CFG_SALTAR_CON_B = false
let CFG_SALTAR_CON_PIN2 = true
let CFG_INICIAR_CON_A = true
let CFG_BAJAR_CON_B = true
let CFG_BAJAR_CON_PIN2 = false

// -------- ESTADO --------
let phase = 0
let prevPhase = 1
let dinoY = 4
let jumping = false
let jumpStart = 0

let obsX: number[] = [-1, -1]
let obsH: number[] = [1, 1]

let moveInterval = CFG_VELOCIDAD_INICIAL
let lastMove = 0
let lastAccel = 0

let score = 0
let highScore = 0
let worldRecord = 0
let worldRecordDisabled = false
let lastScoreTick = 0
let nextMilestone = CFG_HITO_CADA

let volume = CFG_VOLUMEN_INICIAL
let lives = CFG_VIDAS

let lastA = false
let lastB = false
let lastPin2 = false
let lastLogo = false
let logoDownTime = 0
let logoLongFired = false

let introScrollOffset = 0
let introLastStep = 0
let lastBroadcast = 0

let resetComboActive = false
let resetComboStart = 0

// ============================================================
//  UTILIDADES
// ============================================================

function charToDigit(c: string): number {
    if (c === "0") return 0
    if (c === "1") return 1
    if (c === "2") return 2
    if (c === "3") return 3
    if (c === "4") return 4
    if (c === "5") return 5
    if (c === "6") return 6
    if (c === "7") return 7
    if (c === "8") return 8
    if (c === "9") return 9
    return -1
}

function safeParseInt(s: string): number {
    if (s.length === 0) return -1
    let result = 0
    for (let i = 0; i < s.length; i++) {
        let d = charToDigit(s.charAt(i))
        if (d < 0) return -1
        result = result * 10 + d
        if (result > 9999999) return -1
    }
    return result
}

function versionToInt(s: string): number {
    let major = 0
    let minor = 0
    let seenDot = false
    for (let i = 0; i < s.length; i++) {
        let c = s.charAt(i)
        if (c === ".") {
            seenDot = true
        } else {
            let d = charToDigit(c)
            if (d < 0) return -1
            if (seenDot) minor = minor * 10 + d
            else major = major * 10 + d
        }
    }
    return major * 1000 + minor
}

// ============================================================
//  FUENTE 5x5
// ============================================================

function getCharBitmap(ch: string): string {
    if (ch === "w") return "1000110001100011010101010"
    if (ch === ":") return "0000000100000000010000000"
    if (ch === ".") return "0000000000000000000001000"
    if (ch === "0") return "0111010001100011000101110"
    if (ch === "1") return "0010001100001000010001110"
    if (ch === "2") return "0111010001000100010011111"
    if (ch === "3") return "0111100001011100000111110"
    if (ch === "4") return "1001010010111110001000010"
    if (ch === "5") return "1111110000111100000111110"
    if (ch === "6") return "0111010000111101000101110"
    if (ch === "7") return "1111100010001000100001000"
    if (ch === "8") return "0111010001011101000101110"
    if (ch === "9") return "0111010001011110000101110"
    if (ch === "A") return "0111010001111111000110001"
    if (ch === "B") return "1111010001111101000111110"
    if (ch === "C") return "0111110000100001000001111"
    if (ch === "D") return "1111010001100011000111110"
    if (ch === "E") return "1111110000111101000011111"
    if (ch === "I") return "1111100100001000010011111"
    if (ch === "L") return "1000010000100001000011111"
    if (ch === "N") return "1000111001101011001110001"
    if (ch === "O") return "0111010001100011000101110"
    if (ch === "P") return "1111010001111101000010000"
    if (ch === "R") return "1111010001111101001010001"
    if (ch === "S") return "0111110000011100000111110"
    if (ch === "T") return "1111100100001000010000100"
    if (ch === "U") return "1000110001100011000101110"
    if (ch === "=") return "0000011111000001111100000"
    if (ch === "?") return "0111010001000100010000000"
    if (ch === "m") return "0000011010101011010100000"
    if (ch === " ") return "0000000000000000000000000"
    return "0000000000000000000000000"
}

function drawScrollText(text: string, offset: number) {
    basic.clearScreen()
    let totalWidth = text.length * 6
    for (let col = 0; col < 5; col++) {
        let sc = offset + col
        if (sc < 0 || sc >= totalWidth) continue
        let charIdx = Math.floor(sc / 6)
        let charCol = sc % 6
        if (charCol >= 5) continue
        let bmp = getCharBitmap(text.charAt(charIdx))
        for (let row = 0; row < 5; row++) {
            if (bmp.charAt(row * 5 + charCol) === "1") led.plot(col, row)
        }
    }
}

// ============================================================
//  ICONO DE DISQUETE (guardado)
// ============================================================
// Representacion 5x5 de un disquete:
//   #####
//   #..##
//   #...#
//   #...#
//   #####
function showSaveIcon() {
    basic.clearScreen()
    let bmp = "########..###...##...######"
    for (let i = 0; i < 25; i++) {
        if (bmp.charAt(i) === "#") {
            led.plot(i % 5, Math.floor(i / 5))
        }
    }
}

// ============================================================
//  PERSISTENCIA (API real: put / getOrDefault)
// ============================================================

function cargarDatos() {
    let r = safeParseInt(flashstorage.getOrDefault("record", "0"))
    if (r >= 0) highScore = r

    let w = safeParseInt(flashstorage.getOrDefault("worldrecord", "0"))
    if (w >= 0) worldRecord = w

    let v = safeParseInt(flashstorage.getOrDefault("volume", "" + CFG_VOLUMEN_INICIAL))
    if (v >= 0) volume = v
    if (volume < 0) volume = 0
    if (volume > CFG_VOLUMEN_MAX) volume = CFG_VOLUMEN_MAX

    worldRecordDisabled = (flashstorage.getOrDefault("wrdisabled", "0") === "1")
}

function guardarTodo() {
    // Mostrar disquete mientras se escribe en flash
    showSaveIcon()

    flashstorage.put("record", "" + highScore)
    flashstorage.put("worldrecord", "" + worldRecord)
    flashstorage.put("volume", "" + volume)
    if (worldRecordDisabled) {
        flashstorage.put("wrdisabled", "1")
    } else {
        flashstorage.put("wrdisabled", "0")
    }

    // Esperar a que la flash escriba (evita perder datos)
    basic.pause(CFG_SAVE_ICON_MS)
}

// ============================================================
//  RADIO
//  Mensaje: "WR:<version_online>:<score>"  Ej: "WR:1.0:1234"
// ============================================================

function broadcastWorldRecord() {
    if (worldRecordDisabled) return
    radio.sendString(CFG_RECORD_PREFIX + CFG_VERSION_ONLINE + ":" + worldRecord)
}

radio.setGroup(CFG_RADIO_GROUP)

radio.onReceivedString(function (mensaje) {
    if (mensaje.length < 7) return
    if (mensaje.charAt(0) !== "W") return
    if (mensaje.charAt(1) !== "R") return
    if (mensaje.charAt(2) !== ":") return

    let pos = 3
    let versionStr = ""
    while (pos < mensaje.length && mensaje.charAt(pos) !== ":") {
        versionStr += mensaje.charAt(pos)
        pos += 1
    }
    if (pos >= mensaje.length) return
    pos += 1

    let scoreStr = ""
    while (pos < mensaje.length) {
        scoreStr += mensaje.charAt(pos)
        pos += 1
    }

    let verInt = versionToInt(versionStr)
    let val = safeParseInt(scoreStr)
    if (verInt < 0) return
    if (val < 0) return

    let myVerInt = versionToInt(CFG_VERSION_ONLINE)
    if (myVerInt < 0) return

    // Version mayor: me bloqueo
    if (verInt > myVerInt) {
        if (!worldRecordDisabled) {
            worldRecordDisabled = true
            guardarTodo()
        }
        return
    }

    // Version igual o menor: acepto y reactivo
    if (worldRecordDisabled) {
        worldRecordDisabled = false
        guardarTodo()
    }

    if (val > worldRecord) {
        worldRecord = val
        guardarTodo()
    }
})

// ============================================================
//  VOLUMEN
// ============================================================

function applyVolume() {
    music.setVolume(Math.floor(volume * 255 / CFG_VOLUMEN_MAX))
}

function beep(freq: number, ms: number) {
    music.playTone(freq, ms)
}

// ============================================================
//  DIBUJOS
// ============================================================

function drawVolume() {
    basic.clearScreen()
    for (let i = 0; i < CFG_VOLUMEN_MAX; i++) {
        if (i < volume) {
            for (let h = 0; h < i + 1; h++) {
                led.plotBrightness(i, 4 - h, 220)
            }
        }
    }
}

function drawLives() {
    for (let i = 0; i < lives; i++) {
        led.plotBrightness(4 - i, 0, 200)
    }
}

function drawGame() {
    basic.clearScreen()
    drawLives()
    for (let i = 0; i < 2; i++) {
        let xx = obsX[i]
        if (xx >= 0 && xx <= 4) {
            led.plotBrightness(xx, 4, 200)
            if (obsH[i] === 2) led.plotBrightness(xx, 3, 200)
        }
    }
    led.plotBrightness(1, dinoY, 255)
}

function drawPause() {
    basic.clearScreen()
    drawLives()
    led.plotBrightness(1, 1, 255)
    led.plotBrightness(1, 2, 255)
    led.plotBrightness(1, 3, 255)
    led.plotBrightness(3, 1, 255)
    led.plotBrightness(3, 2, 255)
    led.plotBrightness(3, 3, 255)
}

function drawX() {
    basic.clearScreen()
    led.plot(0, 0)
    led.plot(4, 0)
    led.plot(1, 1)
    led.plot(3, 1)
    led.plot(2, 2)
    led.plot(1, 3)
    led.plot(3, 3)
    led.plot(0, 4)
    led.plot(4, 4)
}

// ============================================================
//  PROMPT DE RESET
// ============================================================

function showResetPrompt(): string {
    while (input.buttonIsPressed(Button.A) || input.buttonIsPressed(Button.B) || input.logoIsPressed()) {
        basic.pause(20)
    }
    let texto = "RESET? A=SI B=NO"
    let ancho = texto.length * 6
    let offset = 0
    let lastStep = input.runningTime()
    let completo = false
    let respuesta = ""

    while (respuesta === "") {
        let ahora = input.runningTime()
        if (ahora - lastStep >= CFG_RESET_PROMPT_MS) {
            lastStep = ahora
            offset += 1
            if (offset > ancho) {
                offset = 0
                completo = true
            }
        }
        drawScrollText(texto, offset)
        if (completo) {
            if (input.buttonIsPressed(Button.A)) respuesta = "A"
            if (input.buttonIsPressed(Button.B)) respuesta = "B"
        }
        basic.pause(10)
    }
    basic.clearScreen()
    return respuesta
}

// ============================================================
//  OBSTACULOS
// ============================================================

function resetObstacles() {
    obsX[0] = -1
    obsX[1] = -1
    obsH[0] = 1
    obsH[1] = 1
}

function moveObstacles() {
    for (let i = 0; i < 2; i++) {
        if (obsX[i] >= 0) {
            obsX[i] -= 1
            if (obsX[i] < 0) obsX[i] = -1
        }
    }
    let bloqueado = (obsX[0] >= 3) || (obsX[1] >= 3)
    if (bloqueado) return

    let slot = -1
    if (obsX[0] < 0 && obsX[1] < 0) slot = randint(0, 1)
    else if (obsX[0] < 0) slot = 0
    else if (obsX[1] < 0) slot = 1
    if (slot < 0) return

    if (randint(0, 1) === 0) {
        obsX[slot] = 4
        obsH[slot] = randint(1, 2)
    }
}

function checkCollision(): number {
    for (let i = 0; i < 2; i++) {
        if (obsX[i] === 1 && !jumping) return i
    }
    return -1
}

// ============================================================
//  FLUJO
// ============================================================

function resetTimers() {
    let t = input.runningTime()
    lastMove = t
    lastScoreTick = t
    lastAccel = t
}

function startGame() {
    score = 0
    dinoY = 4
    jumping = false
    moveInterval = CFG_VELOCIDAD_INICIAL
    nextMilestone = CFG_HITO_CADA
    lives = CFG_VIDAS
    resetObstacles()
    phase = 1
    resetTimers()
    basic.clearScreen()
    beep(880, 60)
    beep(1200, 80)
}

function gameOver() {
    beep(400, 150)
    beep(250, 200)
    beep(150, 350)
    drawX()
    basic.pause(1000)

    if (score > highScore) {
        highScore = score
        guardarTodo()
    }
    if (score > worldRecord) {
        worldRecord = score
        guardarTodo()
        broadcastWorldRecord()
    }

    basic.clearScreen()
    basic.showString("p:" + score, CFG_SCROLL_PUNTAJE_MS)
    basic.clearScreen()
    basic.pause(CFG_PAUSA_MENSAJE_MS)
    basic.showString("m:" + highScore, CFG_SCROLL_RECORD_MS)
    basic.clearScreen()
    basic.pause(CFG_PAUSA_MENSAJE_MS)

    introScrollOffset = 0
    introLastStep = input.runningTime()
    phase = 0
}

function jump() {
    if (jumping) return
    jumping = true
    jumpStart = input.runningTime()
    dinoY = 2
    beep(880, 30)
}

function dropNow() {
    if (!jumping) return
    jumping = false
    dinoY = 4
    beep(600, 20)
}

if (CFG_SALTAR_CON_PIN2 || CFG_BAJAR_CON_PIN2) {
    pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive)
}

// ============================================================
//  ARRANQUE
// ============================================================

cargarDatos()
applyVolume()
broadcastWorldRecord()

basic.showIcon(IconNames.Heart)
basic.pause(300)
basic.clearScreen()
introLastStep = input.runningTime()
lastBroadcast = input.runningTime()

// ============================================================
//  BUCLE PRINCIPAL
// ============================================================

basic.forever(function () {
    let ahora = input.runningTime()
    let aDown = input.buttonIsPressed(Button.A)
    let bDown = input.buttonIsPressed(Button.B)
    let pin2Down = false
    if (CFG_SALTAR_CON_PIN2 || CFG_BAJAR_CON_PIN2) {
        pin2Down = input.pinIsPressed(TouchPin.P2)
    }
    let logoDown = input.logoIsPressed()

    let aEdge = aDown && !lastA
    let bEdge = bDown && !lastB
    let pin2Edge = pin2Down && !lastPin2
    let logoEdgeDown = logoDown && !lastLogo
    let logoEdgeUp = !logoDown && lastLogo

    // Combo reset: logo + A + B durante 3 segundos
    let resetCombo = (phase === 0 || phase === 1 || phase === 2) && logoDown && aDown && bDown
    if (resetCombo) {
        if (!resetComboActive) {
            resetComboActive = true
            resetComboStart = ahora
        } else if (ahora - resetComboStart >= CFG_RESET_COMBO_MS) {
            resetComboActive = false
            let respuesta = showResetPrompt()
            if (respuesta === "A") {
                highScore = 0
                guardarTodo()
                beep(1200, 80)
                beep(1500, 120)
                basic.showString("m=0", CFG_RESET_RESULT_MS)
            } else {
                beep(500, 200)
                basic.showString("OPERACION CANCELADA", CFG_RESET_RESULT_MS)
            }
            basic.clearScreen()
            introScrollOffset = 0
            introLastStep = input.runningTime()
            phase = 0
            lastA = input.buttonIsPressed(Button.A)
            lastB = input.buttonIsPressed(Button.B)
            lastPin2 = false
            lastLogo = input.logoIsPressed()
            basic.pause(20)
            return
        }
        aEdge = false
        bEdge = false
        pin2Edge = false
        logoEdgeDown = false
        logoEdgeUp = false
    } else {
        resetComboActive = false
    }

    // Broadcast periodico del record mundial
    if (ahora - lastBroadcast >= CFG_BROADCAST_EVERY_MS) {
        lastBroadcast = ahora
        broadcastWorldRecord()
    }

    // Logo: pausa (corto) y volumen (mantener)
    if (phase === 3) {
        if (logoEdgeDown) {
            guardarTodo()
            phase = prevPhase
            if (phase === 0) {
                introScrollOffset = 0
                introLastStep = ahora
            }
            resetTimers()
            logoLongFired = true
        }
    } else {
        if (logoEdgeDown) {
            logoDownTime = ahora
            logoLongFired = false
        }
        if (logoDown && !logoLongFired && !resetComboActive && ahora - logoDownTime >= CFG_LOGO_LARGO_MS) {
            logoLongFired = true
            if (phase === 0 || phase === 1 || phase === 2) {
                prevPhase = phase
                phase = 3
            }
        }
        if (logoEdgeUp && !logoLongFired) {
            if (phase === 1) {
                phase = 2
            } else if (phase === 2) {
                phase = 1
                resetTimers()
            }
        }
    }

    // FASE 0: INTRO con scroll
    if (phase === 0) {
        let introText = ""
        if (worldRecordDisabled) {
            introText = "UPDATE"
        } else {
            introText = "w:" + worldRecord
        }
        if (ahora - introLastStep >= CFG_INTRO_SCROLL_MS) {
            introLastStep = ahora
            introScrollOffset += 1
            let textW = introText.length * 6
            if (introScrollOffset > textW) introScrollOffset = 0
        }
        drawScrollText(introText, introScrollOffset)
        if (CFG_INICIAR_CON_A && aEdge && !bDown) startGame()
    }

    // FASE 1: JUGANDO
    else if (phase === 1) {
        // Salto
        let salto = false
        if (CFG_SALTAR_CON_A && aEdge) salto = true
        if (CFG_SALTAR_CON_B && bEdge) salto = true
        if (CFG_SALTAR_CON_PIN2 && pin2Edge) salto = true
        if (salto) jump()

        // Bajar instantaneo
        if (CFG_BAJAR_CON_B && bEdge) dropNow()
        if (CFG_BAJAR_CON_PIN2 && pin2Edge && !CFG_SALTAR_CON_PIN2) dropNow()

        // Fin del salto por tiempo
        if (jumping && ahora - jumpStart >= CFG_SALTO_DURACION) {
            jumping = false
            dinoY = 4
        }

        // Puntaje
        while (ahora - lastScoreTick >= CFG_PUNTAJE_MS) {
            score += 1
            lastScoreTick += CFG_PUNTAJE_MS
        }
        if (score >= nextMilestone) {
            beep(1500, 100)
            nextMilestone += CFG_HITO_CADA
        }

        // Aceleracion progresiva
        if (ahora - lastAccel >= CFG_ACELERAR_CADA) {
            lastAccel += CFG_ACELERAR_CADA
            if (moveInterval > CFG_VELOCIDAD_MINIMA) {
                moveInterval -= CFG_ACELERAR_PASO
                if (moveInterval < CFG_VELOCIDAD_MINIMA) moveInterval = CFG_VELOCIDAD_MINIMA
            }
        }

        // Mover obstaculos
        if (ahora - lastMove >= moveInterval) {
            lastMove = ahora
            moveObstacles()
        }

        // Colision y dibujo
        let hitIdx = checkCollision()
        if (hitIdx >= 0) {
            obsX[hitIdx] = -1
            lives -= 1
            if (lives <= 0) {
                drawGame()
                basic.pause(80)
                gameOver()
            } else {
                beep(250, 250)
                basic.clearScreen()
                drawLives()
                basic.pause(350)
                drawGame()
                resetTimers()
            }
        } else {
            drawGame()
        }
    }

    // FASE 2: PAUSA
    else if (phase === 2) {
        drawPause()
    }

    // FASE 3: VOLUMEN
    else if (phase === 3) {
        if (bEdge) {
            if (volume < CFG_VOLUMEN_MAX) volume += 1
            applyVolume()
            beep(1000, 30)
        }
        if (aEdge) {
            if (volume > 0) volume -= 1
            applyVolume()
            beep(700, 30)
        }
        drawVolume()
    }

    lastA = aDown
    lastB = bDown
    lastPin2 = pin2Down
    lastLogo = logoDown

    basic.pause(10)
})
