const Swagger = require('swagger-client')
const fs = require('fs')
const table = require('markdown-table')
const defaults = require('./defaults')

const yaml = require('js-yaml').safeLoad(fs.readFileSync("../booking-swagger.yaml", "utf8"))

function h1 (text) { console.log(`# ${text}\n`) }
function h2 (text) { console.log(`## ${text}\n`) }
function h3 (text) { console.log(`### ${text}\n`) }
function h4 (text) { console.log(`#### ${text}\n`) }

function maybeDesc(details) {
  if (details.description) { console.log(`${details.description}\n`) }
}

function maybeSummary(details) {
  if (details.summary) { console.log(`${details.summary}\n`) }
}

function generateExample(schema) {
  console.log("```json\n" + JSON.stringify(defaults(schema), null, 2) + "\n```")
}

function startMethod(method, details) {
  h2(`${method.toUpperCase()} - ${details.summary}`)

  maybeSummary(details)
  maybeDesc(details)

  h3("Parameters")

  if (details.parameters) {
    let table_data = [['name', 'appears in', 'type', 'example', 'description']]

    for (param of details.parameters) {
      table_data.push([param.name,
                       param.in,
                       param.schema.type,
                       param.schema.example,
                       param.description])
    }

    console.log(table(table_data) + "\n")
  }

  if (details.requestBody) {
    h3("Request body - (applicaiton/json)")
    h4("Example")
    generateExample(details.requestBody.content['application/json'].schema)
  }
}

function startPath(path, details) {
  h1(path)

  maybeDesc(details)

  for (const method of ['get', 'post', 'put', 'patch']) {
    if (details[method]) {
      startMethod(method, details[method])
    }
  }
}

Swagger({spec: yaml})
  .then(client => {
    for (const path in client.spec.paths) {
      startPath(path, client.spec.paths[path])
    }
  })
  .catch(console.error)
