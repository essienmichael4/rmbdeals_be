import logger from 'pino'

const log = logger({
    transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
        }
      },
      level: 'info',
      base:{
        pid: false
      }
})

export default log
