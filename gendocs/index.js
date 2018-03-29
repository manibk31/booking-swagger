const Swagger = require('swagger-client')
const fs = require('fs')
const table = require('markdown-table')
const defaults = require('./defaults')

const yaml = require('js-yaml').safeLoad(fs.readFileSync("../booking-swagger.yaml", "utf8"))

function h1 (text) { console.log(`# ${text}\n`) }
function h2 (text) { console.log(`## ${text}\n`) }
function h3 (text) { console.log(`### ${text}\n`) }
function h4 (text) { console.log(`#### ${text}\n`) }
function h5 (text) { console.log(`##### ${text}\n`) }

function maybeDesc(details) {
  if (details.description) { console.log(`${details.description}\n`) }
}

function maybeSummary(details) {
  if (details.summary) { console.log(`${details.summary}\n`) }
}

function generateExample(schema) {
  console.log("```json\n" + JSON.stringify(defaults(schema), null, 2) + "\n```\n")
}

function startMethod(method, details) {
  h3(`${method.toUpperCase()} - ${details.summary}`)

  maybeDesc(details)

  h4("Parameters")

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
    h4("Request body - (applicaiton/json)")
    h5("Example")

    generateExample(details.requestBody.content['application/json'].schema)
  }

  if (details.responses) {
    h4("Successful responses")

    if (details.responses["200"]) {
      h5("200 - OK")

      generateExample(details.responses["200"].content['application/json'].schema)
      delete details.responses["200"]
    }

    if (details.responses["201"]) {
      h5("201 - Created")
      delete details.responses["201"]
    }

    if (details.responses["204"]) {
      h5("204 - No Content")
      delete details.responses["204"]
    }

    if (Object.keys(details.responses).length > 0) {
      h4("Potential error responses")

      for (const status of Object.keys(details.responses)) {
        console.log(`* ${status} - ${details.responses[status].description}`)
      }

      console.log("\n")
    }
  }
}

function startPath(path, details) {
  h2(path)

  maybeDesc(details)

  for (const method of ['get', 'post', 'delete', 'put', 'patch']) {
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
