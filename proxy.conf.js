// https://angular.io/guide/build#proxy-multiple-entries
const PROXY_CONFIG = [
  {
    context: [
    ],
    target: "http://localhost:5005",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
