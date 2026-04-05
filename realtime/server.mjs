import 'dotenv/config'
import express from 'express'
import http from 'node:http'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

const port = Number(process.env.PORT || 6001)
const internalSecret = process.env.SOCKET_SERVER_SECRET || 'recetagram_socket_secret_2026'
const allowedOrigins = (process.env.SOCKET_CORS_ORIGINS || 'http://localhost:5173,http://51.178.85.46:5173,https://recetagram.netlify.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/internal/notify', (req, res) => {
  const secret = req.header('X-Internal-Secret')
  if (secret !== internalSecret) {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }

  const { room, event = 'notification:new', notification } = req.body || {}

  if (!room || !notification) {
    return res.status(422).json({ status: 'error', message: 'room y notification son requeridos' })
  }

  io.to(room).emit(event, { notification })
  return res.json({ status: 'success', room, event })
})

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId

  if (userId) {
    socket.join(`user:${userId}`)
  }

  socket.on('join:user', ({ userId: joinUserId }) => {
    if (joinUserId) {
      socket.join(`user:${joinUserId}`)
    }
  })

  socket.on('disconnect', () => {
    // noop
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`[realtime] listening on http://0.0.0.0:${port}`)
})