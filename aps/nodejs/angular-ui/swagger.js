const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/vms/vms.controller.ts']

swaggerAutogen(outputFile, endpointsFiles)