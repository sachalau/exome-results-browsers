import path from 'path'

import compression from 'compression'
import elasticsearch from 'elasticsearch'
import express from 'express'
import graphQLHTTP from 'express-graphql'
import { GraphQLSchema } from 'graphql'

import browserConfig from '@browser/config'

import { RootType } from './schema/root'
import renderTemplate from './template'

const requiredSettings = ['ELASTICSEARCH_URL', 'PORT']
const missingSettings = requiredSettings.filter(setting => !process.env[setting])
if (missingSettings.length) {
  throw Error(`Missing required environment variables: ${missingSettings.join(', ')}`)
}

const app = express()
app.use(compression())

// eslint-disable-line
;(async () => {
  const elastic = new elasticsearch.Client({
    apiVersion: '5.5',
    host: process.env.ELASTICSEARCH_URL,
  })

  const html = await renderTemplate({
    gaTrackingId: process.env.GA_TRACKING_ID,
    title: browserConfig.browserTitle,
  })

  app.use(
    '/api',
    graphQLHTTP({
      schema: new GraphQLSchema({ query: RootType }),
      graphiql: true,
      context: {
        database: {
          elastic,
        },
      },
      customFormatErrorFn: error => {
        console.log(error)
        const message =
          error.extensions && error.extensions.isUserVisible
            ? error.message
            : 'An unknown error occurred'
        return { message }
      },
    })
  )

  const publicDir = path.resolve(__dirname, 'public')
  app.use(express.static(publicDir))

  const pagePaths = browserConfig.pages.map(page => page.path)
  app.get(['/', '/gene/:gene', '/results', ...pagePaths], (request, response) => {
    response.send(html)
  })

  app.use((request, response) => {
    response.status(404).send(html)
  })

  app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`)
  })
})()
