#!/usr/bin/env node

require = require("esm")(module);
require("./cli").default(process.argv);
