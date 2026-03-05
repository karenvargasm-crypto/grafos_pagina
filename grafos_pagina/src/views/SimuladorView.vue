<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'

// ─── Estado del grafo ───
const nodes = reactive([]) // { id, x, y, label }
const adjacencyList = reactive({}) // { nodeId: [{ toId, weight }, ...] }
let nextId = 0
let lastCreationTime = 0 // Para evitar doble prompt en móvil/desktop

// ─── Estado del canvas ───
const canvasRef = ref(null)
let ctx = null
const NODE_RADIUS = 22
const LOOP_RADIUS = 20
const fileInput = ref(null)

// ─── Estado de arrastre para crear aristas ───
const dragging = ref(false)
const dragFrom = ref(null)
const mousePos = reactive({ x: 0, y: 0 })
const hasMoved = ref(false)
const isEraseMode = ref(false)
const showMatrix = ref(false)

// ─── Estado de movimiento de nodos ───
const isMovingNode = ref(false)
const movingNode = ref(null)
let longPressTimeout = null
const LONG_PRESS_DURATION = 500 // ms

// ─── Estado del Prompt Personalizado ───
const promptState = reactive({
  show: false,
  title: '',
  message: '',
  inputValue: '',
  resolve: null,
  isNumeric: false,
})

function showCustomPrompt(title, message, defaultValue = '', isNumeric = false) {
  return new Promise((resolve) => {
    promptState.title = title
    promptState.message = message
    promptState.inputValue = defaultValue
    promptState.isNumeric = isNumeric
    promptState.resolve = resolve
    promptState.show = true
  })
}

function handlePromptConfirm() {
  if (promptState.isNumeric) {
    const num = Number(promptState.inputValue)
    if (isNaN(num)) {
      alert('El peso debe ser un valor numérico.')
      return
    }
    promptState.resolve(num)
  } else {
    promptState.resolve(promptState.inputValue)
  }
  promptState.show = false
}

function handlePromptCancel() {
  promptState.resolve(null)
  promptState.show = false
}

// ─── Estadísticas de la Matriz (Computadas) ───
const stats = computed(() => {
  if (!nodes.length) return null

  const results = nodes.map((node) => {
    const outEdges = adjacencyList[node.id] || []
    const outSum = outEdges.reduce((acc, e) => acc + Number(e.weight), 0)
    const outDeg = outEdges.length

    let inSum = 0
    let inDeg = 0
    nodes.forEach((n) => {
      const edge = adjacencyList[n.id]?.find((e) => e.toId === node.id)
      if (edge) {
        inSum += Number(edge.weight)
        inDeg += 1
      }
    })

    return { id: node.id, outSum, outDeg, inSum, inDeg }
  })

  return {
    rows: results,
    maxOutSum: Math.max(...results.map((r) => r.outSum), 0),
    maxOutDeg: Math.max(...results.map((r) => r.outDeg), 0),
    maxInSum: Math.max(...results.map((r) => r.inSum), 0),
    maxInDeg: Math.max(...results.map((r) => r.inDeg), 0),
  }
})

// ─── Helpers ───
function getMousePos(e) {
  const rect = canvasRef.value.getBoundingClientRect()

  // Soporte para eventos de mouse y touch
  const touch = e.touches?.[0] || e.changedTouches?.[0]
  const clientX = touch ? touch.clientX : e.clientX
  const clientY = touch ? touch.clientY : e.clientY

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

function findNodeAt(x, y) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    const dx = n.x - x
    const dy = n.y - y
    if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
      return n
    }
  }
  return null
}

function generateLabel(id) {
  let label = ''
  let num = id
  do {
    label = String.fromCharCode(65 + (num % 26)) + label
    num = Math.floor(num / 26) - 1
  } while (num >= 0)
  return label
}

// ─── Buscar arista cerca de un punto (para click) ───
function findEdgeAt(x, y) {
  const threshold = 15 // Aumentado para facilitar toque en móviles

  for (const [fromId, edges] of Object.entries(adjacencyList)) {
    const fromNode = nodes.find((n) => n.id === Number(fromId))
    if (!fromNode) continue

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]
      const toNode = nodes.find((n) => n.id === edge.toId)
      if (!toNode) continue

      // Caso self-loop
      if (fromNode.id === toNode.id) {
        const loopCenterX = fromNode.x
        const loopCenterY = fromNode.y - NODE_RADIUS - LOOP_RADIUS + 5
        const dx = x - loopCenterX
        const dy = y - loopCenterY
        const distToCenter = Math.sqrt(dx * dx + dy * dy)
        if (Math.abs(distToCenter - LOOP_RADIUS) < threshold) {
          return { fromId: Number(fromId), edgeIndex: i, edge }
        }
        continue
      }

      // Detectar si es bidireccional para ajustar el hit-test
      const isBi = adjacencyList[toNode.id]?.some((e) => e.toId === fromNode.id)

      if (isBi) {
        // Para aristas curvas, chequeamos el punto medio desplazado
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2
        const dx = toNode.x - fromNode.x
        const dy = toNode.y - fromNode.y
        const angle = Math.atan2(dy, dx)
        const curveOffset = 25
        const cpX = midX - Math.sin(angle) * curveOffset
        const cpY = midY + Math.cos(angle) * curveOffset

        // hit-test simplificado para la curva (chequeando dist al punto de control)
        const distToCP =
          pointToSegmentDist(x, y, fromNode.x, fromNode.y, cpX, cpY) +
          pointToSegmentDist(x, y, cpX, cpY, toNode.x, toNode.y)
        const segmentDist = Math.sqrt(dx * dx + dy * dy)
        if (distToCP < segmentDist + threshold) {
          return { fromId: Number(fromId), edgeIndex: i, edge }
        }
      } else {
        const dist = pointToSegmentDist(x, y, fromNode.x, fromNode.y, toNode.x, toNode.y)
        if (dist < threshold) {
          return { fromId: Number(fromId), edgeIndex: i, edge }
        }
      }
    }
  }
  return null
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  let t = (apx * abx + apy * aby) / (abx * abx + aby * aby)
  t = Math.max(0, Math.min(1, t))
  const closestX = ax + t * abx
  const closestY = ay + t * aby
  const dx = px - closestX
  const dy = py - closestY
  return Math.sqrt(dx * dx + dy * dy)
}

// ─── Pedir peso numérico ───
async function promptWeight(defaultVal = '1') {
  return await showCustomPrompt(
    'Peso de la Arista',
    'Ingrese el peso de la arista (numérico):',
    defaultVal,
    true,
  )
}

// ─── Crear nodo (doble click) ───
async function onDoubleClick(e) {
  if (isEraseMode.value) return // No crear nodos mientras se borra
  const pos = getMousePos(e)
  if (findNodeAt(pos.x, pos.y)) return

  const id = nextId++
  const defaultLabel = generateLabel(id)
  const labelInput = await showCustomPrompt(
    'Nuevo Vértice',
    'Ingrese el nombre del vértice:',
    defaultLabel,
  )
  const label = labelInput || defaultLabel

  nodes.push({ id, x: pos.x, y: pos.y, label })
  lastCreationTime = Date.now() // Marcar el momento de creación para evitar onClick inmediato
  adjacencyList[id] = []
  draw()
}

// ─── Click simple: editar peso de arista ───
async function onClick(e) {
  if (hasMoved.value) return

  // Evitar el doble prompt si acabamos de crear un nodo (común en dblclick/móvil)
  if (Date.now() - lastCreationTime < 400) return

  const pos = getMousePos(e)

  // Modo borrar: eliminar nodos o aristas
  if (isEraseMode.value) {
    const nodeHit = findNodeAt(pos.x, pos.y)
    if (nodeHit) {
      // Eliminar nodo
      const index = nodes.indexOf(nodeHit)
      nodes.splice(index, 1)
      delete adjacencyList[nodeHit.id]
      // Eliminar todas las aristas que apuntan a este nodo
      for (const fromId in adjacencyList) {
        adjacencyList[fromId] = adjacencyList[fromId].filter((edge) => edge.toId !== nodeHit.id)
      }
      draw()
      return
    }

    const edgeHit = findEdgeAt(pos.x, pos.y)
    if (edgeHit) {
      // Eliminar arista
      adjacencyList[edgeHit.fromId].splice(edgeHit.edgeIndex, 1)
      draw()
      return
    }
    return
  }

  // Click en nodo para editar nombre
  const nodeHit = findNodeAt(pos.x, pos.y)
  if (nodeHit) {
    const newLabel = await showCustomPrompt(
      'Editar Vértice',
      'Editar nombre del vértice:',
      nodeHit.label,
    )
    if (newLabel !== null && newLabel.trim() !== '') {
      nodeHit.label = newLabel
      draw()
    }
    return
  }

  // Click en arista para editar peso
  const hit = findEdgeAt(pos.x, pos.y)
  if (!hit) return

  const newWeight = await promptWeight(String(hit.edge.weight))
  if (newWeight !== null) {
    adjacencyList[hit.fromId][hit.edgeIndex].weight = newWeight
    draw()
  }
}

// ─── Iniciar arrastre desde un nodo ───
function onMouseDown(e) {
  const pos = getMousePos(e)
  hasMoved.value = false

  // En modo borrar no iniciamos arrastre de aristas
  if (isEraseMode.value) return

  const node = findNodeAt(pos.x, pos.y)
  if (node) {
    dragging.value = true
    dragFrom.value = node
    mousePos.x = pos.x
    mousePos.y = pos.y

    // Iniciar timer para long press (mover nodo)
    clearTimeout(longPressTimeout)
    longPressTimeout = setTimeout(() => {
      if (!hasMoved.value) {
        isMovingNode.value = true
        movingNode.value = node
      }
    }, LONG_PRESS_DURATION)
  }
}

function onMouseMove(e) {
  if (!dragging.value) return
  const pos = getMousePos(e)

  // Umbral de movimiento
  const dist = Math.sqrt((pos.x - mousePos.x) ** 2 + (pos.y - mousePos.y) ** 2)
  if (dist > 6) {
    hasMoved.value = true
    // Si se mueve antes del long press, cancelar la posibilidad de mover el nodo
    if (!isMovingNode.value) {
      clearTimeout(longPressTimeout)
    }
  }

  if (isMovingNode.value && movingNode.value) {
    // Mover nodo
    movingNode.value.x = pos.x
    movingNode.value.y = pos.y
    draw()
  } else if (hasMoved.value) {
    // Dibujar línea de arista
    mousePos.x = pos.x
    mousePos.y = pos.y
    draw()
  }
}

async function onMouseUp(e) {
  clearTimeout(longPressTimeout)

  if (!dragging.value) return
  const pos = getMousePos(e)

  if (isMovingNode.value) {
    // Terminó de mover el nodo
    isMovingNode.value = false
    movingNode.value = null
  } else {
    // Intentar crear arista
    const targetNode = findNodeAt(pos.x, pos.y)
    // Solo crear arista si hubo movimiento (previene doble prompt con onClick)
    if (targetNode && hasMoved.value) {
      const existing = adjacencyList[dragFrom.value.id].find((edge) => edge.toId === targetNode.id)
      if (!existing) {
        const weight = await promptWeight('1')
        if (weight !== null) {
          adjacencyList[dragFrom.value.id].push({ toId: targetNode.id, weight })
        }
      }
    }
  }

  dragging.value = false
  dragFrom.value = null
  draw()
}

// ─── Dibujar todo ───
function draw() {
  if (!ctx) return
  const canvas = canvasRef.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // dibujar aristas
  for (const [fromId, edges] of Object.entries(adjacencyList)) {
    const fromNode = nodes.find((n) => n.id === Number(fromId))
    if (!fromNode) continue
    for (const edge of edges) {
      const toNode = nodes.find((n) => n.id === edge.toId)
      if (!toNode) continue
      if (fromNode.id === toNode.id) {
        drawSelfLoop(fromNode, edge.weight)
      } else {
        const isBi = adjacencyList[toNode.id]?.some((e) => e.toId === fromNode.id)
        drawArrow(fromNode, toNode, edge.weight, isBi)
      }
    }
  }

  // línea temporal mientras arrastramos
  if (dragging.value && dragFrom.value) {
    ctx.save()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#d4729a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(dragFrom.value.x, dragFrom.value.y)
    ctx.lineTo(mousePos.x, mousePos.y)
    ctx.stroke()
    ctx.restore()
  }

  // dibujar nodos
  for (const node of nodes) {
    drawNode(node)
  }
}

function drawNode(node) {
  ctx.save()
  ctx.shadowColor = 'rgba(212, 114, 154, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3

  ctx.beginPath()
  ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
  const grad = ctx.createRadialGradient(node.x - 5, node.y - 5, 3, node.x, node.y, NODE_RADIUS)
  grad.addColorStop(0, '#fce4ec')
  grad.addColorStop(1, '#f8bbd0')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  ctx.beginPath()
  ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
  ctx.strokeStyle = '#d4729a'
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = '#7d3c5a'
  ctx.font = "bold 14px 'Quicksand', sans-serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(node.label, node.x, node.y)
}

function drawArrow(from, to, weight, isBi = false) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const angle = Math.atan2(dy, dx)
  const dist = Math.sqrt(dx * dx + dy * dy)

  ctx.save()
  ctx.strokeStyle = '#c25a82'
  ctx.lineWidth = 2.5
  ctx.fillStyle = '#c25a82'

  let endAngle = angle
  let arrowX, arrowY

  if (isBi) {
    // Dibujar curva si es bidireccional
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const curveOffset = 25
    const cpX = midX - Math.sin(angle) * curveOffset
    const cpY = midY + Math.cos(angle) * curveOffset

    // Ajustar puntos para que salgan del borde del nodo
    // (Aproximación para curvas: usamos el ángulo hacia el punto de control)
    const startAngle = Math.atan2(cpY - from.y, cpX - from.x)
    const startX = from.x + Math.cos(startAngle) * NODE_RADIUS
    const startY = from.y + Math.sin(startAngle) * NODE_RADIUS

    endAngle = Math.atan2(to.y - cpY, to.x - cpX)
    arrowX = to.x - Math.cos(endAngle) * (NODE_RADIUS + 6)
    arrowY = to.y - Math.sin(endAngle) * (NODE_RADIUS + 6)

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.quadraticCurveTo(cpX, cpY, arrowX, arrowY)
    ctx.stroke()

    // Etiqueta peso en el punto de la curva
    const tx = 0.5 * 0.5 * from.x + 2 * 0.5 * 0.5 * cpX + 0.5 * 0.5 * to.x
    const ty = 0.5 * 0.5 * from.y + 2 * 0.5 * 0.5 * cpY + 0.5 * 0.5 * to.y
    const perpX = -Math.sin(angle) * 12
    const perpY = Math.cos(angle) * 12
    drawWeight(weight, tx + perpX, ty + perpY)
  } else {
    const startX = from.x + Math.cos(angle) * NODE_RADIUS
    const startY = from.y + Math.sin(angle) * NODE_RADIUS
    arrowX = to.x - Math.cos(angle) * (NODE_RADIUS + 6)
    arrowY = to.y - Math.sin(angle) * (NODE_RADIUS + 6)

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(arrowX, arrowY)
    ctx.stroke()

    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const perpX = -Math.sin(angle) * 14
    const perpY = Math.cos(angle) * 14
    drawWeight(weight, midX + perpX, midY + perpY)
  }

  // Punta de flecha
  const arrowSize = 10
  ctx.beginPath()
  ctx.moveTo(arrowX, arrowY)
  ctx.lineTo(
    arrowX - arrowSize * Math.cos(endAngle - Math.PI / 6),
    arrowY - arrowSize * Math.sin(endAngle - Math.PI / 6),
  )
  ctx.lineTo(
    arrowX - arrowSize * Math.cos(endAngle + Math.PI / 6),
    arrowY - arrowSize * Math.sin(endAngle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawWeight(weight, x, y) {
  ctx.save()
  ctx.font = "bold 12px 'Quicksand', sans-serif"
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = 'rgba(194, 90, 130, 0.6)'
  ctx.lineWidth = 3
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeText(String(weight), x, y)
  ctx.fillStyle = '#7d3c5a'
  ctx.fillText(String(weight), x, y)
  ctx.restore()
}

function drawSelfLoop(node, weight) {
  const loopCenterX = node.x
  const loopCenterY = node.y - NODE_RADIUS - LOOP_RADIUS + 5

  // Arco del loop (dejando un hueco abajo para que parezca salir del borde del nodo)
  ctx.beginPath()
  ctx.arc(loopCenterX, loopCenterY, LOOP_RADIUS, 0.6 * Math.PI, 0.4 * Math.PI)
  ctx.strokeStyle = '#c25a82'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Punta de flecha (al final del arco)
  const arrowAngle = 0.4 * Math.PI
  const arrowX = loopCenterX + Math.cos(arrowAngle) * LOOP_RADIUS
  const arrowY = loopCenterY + Math.sin(arrowAngle) * LOOP_RADIUS
  const tangentAngle = arrowAngle + Math.PI / 2
  const arrowSize = 10

  ctx.beginPath()
  ctx.moveTo(arrowX, arrowY)
  ctx.lineTo(
    arrowX - arrowSize * Math.cos(tangentAngle - Math.PI / 6),
    arrowY - arrowSize * Math.sin(tangentAngle - Math.PI / 6),
  )
  ctx.lineTo(
    arrowX - arrowSize * Math.cos(tangentAngle + Math.PI / 6),
    arrowY - arrowSize * Math.sin(tangentAngle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fillStyle = '#c25a82'
  ctx.fill()

  // Peso del loop
  ctx.save()
  ctx.font = "bold 12px 'Quicksand', sans-serif"
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = 'rgba(194, 90, 130, 0.6)'
  ctx.lineWidth = 3
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeText(String(weight), loopCenterX, loopCenterY - LOOP_RADIUS - 6)
  ctx.fillStyle = '#7d3c5a'
  ctx.fillText(String(weight), loopCenterX, loopCenterY - LOOP_RADIUS - 6)
  ctx.restore()
}

// ─── Control Buttons Logic ───
function clearGraph() {
  if (confirm('¿Estás seguro de que quieres borrar todo el grafo?')) {
    nodes.length = 0
    for (const key in adjacencyList) delete adjacencyList[key]
    nextId = 0
    draw()
  }
}

async function saveGraph() {
  const defaultName = 'mi_grafo'
  const fileName = await showCustomPrompt(
    'Guardar Grafo',
    'Ingrese un nombre para el archivo:',
    defaultName,
  )
  if (!fileName) return

  const data = JSON.stringify({ nodes, adjacencyList, nextId }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.json`
  link.click()

  URL.revokeObjectURL(url)
}

function loadGraph() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)
      if (!parsed.nodes || !parsed.adjacencyList) throw new Error('Formato inválido')

      nodes.length = 0
      Object.assign(nodes, parsed.nodes)
      for (const key in adjacencyList) delete adjacencyList[key]
      Object.assign(adjacencyList, parsed.adjacencyList)
      nextId = parsed.nextId || nodes.length
      draw()
      alert('Grafo cargado exitosamente.')
    } catch (err) {
      alert('Error al cargar el archivo: ' + err.message)
    }
    // reset input para permitir cargar el mismo archivo
    event.target.value = ''
  }
  reader.readAsText(file)
}

// ─── Ajustar resolución del canvas ───
function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const wrapper = canvas.parentElement
  const dpr = window.devicePixelRatio || 1
  canvas.width = wrapper.clientWidth * dpr
  canvas.height = wrapper.clientHeight * dpr
  canvas.style.width = wrapper.clientWidth + 'px'
  canvas.style.height = wrapper.clientHeight + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

// ─── Lifecycle ───
onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <main class="simulador-page">
    <h1 class="page-title"><span class="sparkle">🧪</span> Simulador de Grafos</h1>
    <p class="instructions">
      <strong>Doble clic:</strong> Crear nodo (con nombre) &nbsp;·&nbsp;
      <strong>Arrastrar:</strong> Crear arista o loop &nbsp;·&nbsp;
      <strong>Clic en nodo/arista:</strong> Editar &nbsp;·&nbsp;
      <strong>Modo Borrar:</strong> Eliminar &nbsp;·&nbsp; <strong>Guardar/Cargar:</strong> Archivos
      JSON
    </p>

    <div class="canvas-wrapper" :class="{ 'erase-cursor': isEraseMode }">
      <canvas
        ref="canvasRef"
        @dblclick="onDoubleClick"
        @click="onClick"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart="onMouseDown"
        @touchmove.prevent="onMouseMove"
        @touchend="onMouseUp"
      ></canvas>
    </div>

    <!-- Controles -->
    <div class="controls-row">
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileUpload"
        accept=".json"
      />
      <button class="btn btn-clear" @click="clearGraph">Borrar Todo</button>
      <button
        class="btn btn-erase"
        :class="{ active: isEraseMode }"
        @click="isEraseMode = !isEraseMode"
      >
        {{ isEraseMode ? 'Borrando...' : 'Modo Borrar' }}
      </button>
      <button class="btn btn-matrix" @click="showMatrix = !showMatrix">Matriz</button>
      <button class="btn btn-save" @click="saveGraph">Guardar</button>
      <button class="btn btn-load" @click="loadGraph">Cargar</button>
    </div>

    <!-- Matriz de Adyacencia -->
    <transition name="fade">
      <div v-if="showMatrix" class="matrix-overlay" @click.self="showMatrix = false">
        <div class="matrix-modal">
          <div class="matrix-header">
            <h3>Matriz de Adyacencia</h3>
            <button class="close-btn" @click="showMatrix = false">×</button>
          </div>
          <div class="matrix-container" v-if="nodes.length">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="node in nodes" :key="node.id">{{ node.label }}</th>
                  <th class="extra-head">Suma (Salida)</th>
                  <th class="extra-head">Grado (Salida)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rowNode in nodes" :key="rowNode.id">
                  <th>{{ rowNode.label }}</th>
                  <td v-for="colNode in nodes" :key="colNode.id">
                    {{ adjacencyList[rowNode.id]?.find((e) => e.toId === colNode.id)?.weight || 0 }}
                  </td>
                  <!-- Suma y Grado de Salida (por fila) -->
                  <td
                    class="extra-cell"
                    :class="{
                      'max-val':
                        stats.maxOutSum > 0 &&
                        stats.rows.find((r) => r.id === rowNode.id).outSum === stats.maxOutSum,
                    }"
                  >
                    {{ stats.rows.find((r) => r.id === rowNode.id).outSum }}
                  </td>
                  <td
                    class="extra-cell"
                    :class="{
                      'max-val':
                        stats.maxOutDeg > 0 &&
                        stats.rows.find((r) => r.id === rowNode.id).outDeg === stats.maxOutDeg,
                    }"
                  >
                    {{ stats.rows.find((r) => r.id === rowNode.id).outDeg }}
                  </td>
                </tr>
                <!-- Filas de Suma y Grado de Entrada (por columna) -->
                <tr class="extra-row">
                  <th>Suma (Entrada)</th>
                  <td
                    v-for="colNode in nodes"
                    :key="'sum-' + colNode.id"
                    :class="{
                      'max-val-row':
                        stats.maxInSum > 0 &&
                        stats.rows.find((r) => r.id === colNode.id).inSum === stats.maxInSum,
                    }"
                  >
                    {{ stats.rows.find((r) => r.id === colNode.id).inSum }}
                  </td>
                  <td colspan="2" class="empty-corner"></td>
                </tr>
                <tr class="extra-row">
                  <th>Grado (Entrada)</th>
                  <td
                    v-for="colNode in nodes"
                    :key="'deg-' + colNode.id"
                    :class="{
                      'max-val-row':
                        stats.maxInDeg > 0 &&
                        stats.rows.find((r) => r.id === colNode.id).inDeg === stats.maxInDeg,
                    }"
                  >
                    {{ stats.rows.find((r) => r.id === colNode.id).inDeg }}
                  </td>
                  <td colspan="2" class="empty-corner"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-msg">No hay nodos en el grafo.</p>
        </div>
      </div>
    </transition>

    <!-- Prompt Personalizado -->
    <transition name="fade">
      <div v-if="promptState.show" class="prompt-overlay" @click.self="handlePromptCancel">
        <div class="prompt-modal">
          <div class="prompt-header">
            <h3>{{ promptState.title }}</h3>
          </div>
          <div class="prompt-body">
            <p>{{ promptState.message }}</p>
            <input
              v-model="promptState.inputValue"
              class="prompt-input"
              @keyup.enter="handlePromptConfirm"
              @keyup.esc="handlePromptCancel"
              ref="promptInputRef"
              autofocus
            />
          </div>
          <div class="prompt-footer">
            <button class="btn btn-cancel" @click="handlePromptCancel">Cancelar</button>
            <button class="btn btn-confirm" @click="handlePromptConfirm">Aceptar</button>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
/* ─── Página ─── */
.simulador-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.page-title {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  color: #d4729a;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(212, 114, 154, 0.15);
}

.sparkle {
  display: inline-block;
  animation: sparkle 2s ease-in-out infinite;
}

.instructions {
  font-family: 'Quicksand', sans-serif;
  font-size: 0.95rem;
  color: #9e6b82;
  margin-bottom: 1.2rem;
}

/* ─── Canvas ─── */
.canvas-wrapper {
  width: 100%;
  height: 480px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(212, 114, 154, 0.18);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(212, 114, 154, 0.1);
  cursor: crosshair;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none; /* Crucial para evitar scroll al arrastrar en móviles */
}

/* ─── Controles ─── */
.controls-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(212, 114, 154, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(212, 114, 154, 0.2);
}

.btn:active {
  transform: translateY(0);
}

.btn-clear {
  background: #fce4ec;
  color: #d4729a;
  border: 1px solid #f8bbd0;
}
.btn-erase {
  background: #fff;
  color: #9e6b82;
  border: 1px solid #fce4ec;
}
.btn-erase.active {
  background: #d4729a;
  color: white;
}
.btn-matrix {
  background: #fdf2f7;
  color: #c25a82;
  border: 1px solid #f8dce8;
}
.btn-save {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
.btn-load {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.erase-cursor {
  cursor:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d4729a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/></svg>")
      12 12,
    auto !important;
}

/* ─── Matriz Overlay ─── */
.matrix-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(109, 76, 94, 0.4);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.matrix-modal {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.3s ease-out;
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.matrix-header h3 {
  font-family: 'Pacifico', cursive;
  color: #d4729a;
  font-size: 1.4rem;
}

.close-btn {
  background: #fce4ec;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #d4729a;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #d4729a;
  color: white;
}

.matrix-container {
  overflow-x: auto;
  max-height: 400px;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Quicksand', sans-serif;
}

.matrix-table th,
.matrix-table td {
  padding: 0.8rem;
  text-align: center;
  border: 1px solid #f8bbd033;
}

.matrix-table th {
  background: #fce4ec44;
  color: #d4729a;
  font-weight: 700;
}

.matrix-table td {
  color: #6d4c5e;
  font-weight: 500;
}

/* ─── Extra Matrix Styles ─── */
.extra-head {
  background: #fff0f5 !important;
  color: #c25a82 !important;
  font-size: 0.75rem;
}

.extra-cell {
  background: #fff8fb;
  font-weight: 700 !important;
  color: #d4729a !important;
}

.extra-row th {
  background: #fff0f5 !important;
  color: #c25a82 !important;
  font-size: 0.8rem;
}

.extra-row td {
  background: #fffefb;
  font-weight: 700;
  color: #d4729a;
}

.max-val {
  background: #ffecf2 !important;
  color: #d81b60 !important;
  box-shadow: inset 0 0 0 2px #f0629244;
}

.max-val-row {
  background: #fff0f5 !important;
  color: #d81b60 !important;
  box-shadow: inset 0 0 0 2px #f0629244;
}

.empty-msg {
  text-align: center;
  color: #cba8b8;
  padding: 2rem;
  font-style: italic;
}

/* ─── Animations ─── */
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(8deg);
  }
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .canvas-wrapper {
    height: 340px;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
/* ─── Prompt Personalizado ─── */
.prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(212, 114, 154, 0.15);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.prompt-modal {
  background: white;
  padding: 1.8rem;
  border-radius: 24px;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 15px 40px rgba(212, 114, 154, 0.2);
  border: 2px solid #f8bbd0;
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.prompt-header h3 {
  margin: 0;
  font-family: 'Pacifico', cursive;
  color: #d4729a;
  font-size: 1.4rem;
  text-align: center;
  margin-bottom: 1rem;
}

.prompt-body p {
  font-family: 'Quicksand', sans-serif;
  color: #7d3c5a;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
}

.prompt-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid #fce4ec;
  font-family: 'Quicksand', sans-serif;
  font-size: 1rem;
  color: #7d3c5a;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  text-align: center;
}

.prompt-input:focus {
  border-color: #f8bbd0;
}

.prompt-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-confirm {
  background: #d4729a;
  color: white;
}

.btn-confirm:hover {
  background: #c25a82;
  transform: translateY(-2px);
}

.btn-cancel {
  background: #fce4ec;
  color: #d4729a;
}

.btn-cancel:hover {
  background: #f8bbd0;
  transform: translateY(-2px);
}
</style>
