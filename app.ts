import express, { Request, Response } from 'express'
import chalk from 'chalk'
import cors from 'cors'
import responseTime from 'response-time'

// Import agora
const { RtcTokenBuilder, RtcRole } = require('agora-access-token')

// Create a new express application instance
const app: express.Application = express()

const PORT = process.env?.APP_PORT || 8000


app.disable('x-powered-by')
app.enable('trust proxy')

// Use global middlewares
app.use(cors())
app.use(responseTime())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Add middleware to console log every request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE')
  console.log(
    `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`,
    chalk.underline.bgMagenta(req.method),
    chalk.bold.white(req.url)
  )
  next()
})
let token = ''
app.get('/', (req: Request, res: Response) => {

  if (token) {
    return res.json({ success: true, data: token })
  }

  try {
    const appID = process.env.AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_CERTIFICATE
    const uid = 0
    const role = RtcRole.PUBLISHER
    const expirationTimeInSeconds = 3600

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    const channelName = 'ideviatest'
    token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return res.json({ success: true, data: token })
  } catch (e) {
    return res.json({ sucess: false, message: 'Sorry! unable to create token at this moment.' })
  }

})


// Listen to port
app.listen(PORT, () => {
  let server_running_at = chalk.white(`http://localhost:${PORT}/`)
  console.log(`Server running at ${chalk.bgBlue(server_running_at)}`)
})