require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 782:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 861:
/***/ ((module) => {

module.exports = eval("require")("@aws-sdk/client-ecs");


/***/ }),

/***/ 497:
/***/ ((module) => {

module.exports = eval("require")("lodash");


/***/ }),

/***/ 152:
/***/ ((module) => {

module.exports = eval("require")("tmp");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(782)
const {
  ECSClient,
  DescribeTaskDefinitionCommand,
  DescribeServicesCommand,
} = __nccwpck_require__(861)
const { merge, head, omit } = __nccwpck_require__(497)
const tmp = __nccwpck_require__(152)
const fs = __nccwpck_require__(147)

const IGNORED_TASK_DEFINITION_ATTRIBUTES = [
  'compatibilities',
  'taskDefinitionArn',
  'requiresAttributes',
  'revision',
  'status',
  'registeredAt',
  'deregisteredAt',
  'registeredBy'
]

const getTaskDefinition = async ({
  taskDefinition,
  client,
}) => {
  const command = new DescribeTaskDefinitionCommand({
    taskDefinition,
    client
  })

  try {
    const { taskDefinition } = await client.send(command)
    return taskDefinition
  } catch (error) {
    core.setFailed(error.message)
  }
}

const getECSService = async ({
  cluster,
  service,
  client
}) => {
  const command = new DescribeServicesCommand({
    services: [service],
    cluster
  })

  const { services } = await client.send(command)
  if (services.length < 1) {
    throw new ReferenceError('Service not found')
  }
  return services
}


async function run() {
  const aws_region = core.getInput('region')
  const cluster = core.getInput('cluster-name')
  const service = core.getInput('service-name')
  const task = core.getInput('task-name')

  core.info(`Start client with region ${aws_region}`)
  const client = new ECSClient({ region: aws_region })

  try {
    if (service !== '') {
      const services = await getECSService({
        cluster,
        service,
        client
      })

      const { taskDefinition } = head(services)
      core.info(`Task definition from service ${taskDefinition}`)

      const taskDef = await getTaskDefinition({
        taskDefinition,
        client,
      })

      core.info(`Task definition from task ${taskDef}`)

      const replacements = core.getInput('replacements') || '{}'
      const taskDefMerged = merge(taskDef, JSON.parse(replacements))
      core.info(`Task definition merged ${taskDefMerged}`)

      const newTaskDef = omit(taskDefMerged, IGNORED_TASK_DEFINITION_ATTRIBUTES)
      core.info(`Task definition merged and cleaned ${newTaskDef}`)

      // create a a file for task def
      const taskDefFile = tmp.fileSync({
        tmpdir: process.env.RUNNER_TEMP,
        prefix: 'task-definition-',
        postfix: '.json',
        keep: true,
        discardDescriptor: true
      })

      fs.writeFileSync(taskDefFile.name, JSON.stringify(newTaskDef))
      core.setOutput('taskDef', taskDefFile.name)
    } else {
      const taskDef = await getTaskDefinition({
        taskDefinition: task,
        client,
      })

      core.info(`Task definition from task ${taskDef}`)

      const replacements = core.getInput('replacements') || '{}'
      const taskDefMerged = merge(taskDef, JSON.parse(replacements))

      const newTaskDef = omit(taskDefMerged, IGNORED_TASK_DEFINITION_ATTRIBUTES)
      core.info(`Task definition merged and cleaned ${newTaskDef}`)

      console.dir(newTaskDef)

      const taskDefFile = tmp.fileSync({
        tmpdir: process.env.RUNNER_TEMP,
        prefix: 'task-definition-',
        postfix: '.json',
        keep: true,
        discardDescriptor: true
      })

      fs.writeFileSync(taskDefFile.name, JSON.stringify(newTaskDef))
      core.setOutput('taskDef', taskDefFile.name)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map