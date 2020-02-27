const boiler = require("boiler-dev")
const { basename, join } = require("path")

module.exports.prompt = function ({ rootDirPath }) {
  return Promise.all([
    boiler.git.userName(),
    boiler.git.userEmail()
  ]).then(function ([ name, email ]) {
    return [
      {
        type: "input",
        name: "pkgName",
        message: "project name (kebab-case)",
        default: basename(rootDirPath)
      },
      {
        type: "input",
        name: "pkgDesc",
        message: "project description"
      },
      {
        type: "input",
        name: "githubOrg",
        message: "github org",
        default: name.includes(" ") ? undefined : name
      },
      {
        type: "input",
        name: "author",
        message: "author",
        default: name + " <" + email + ">"
      }
    ]
  })
}

module.exports.generate = function ({ answers, rootDirPath }) {
  const actions = []
  const repo = answers.githubOrg + "/" + answers.pkgName

  actions.push({
    action: "write",
    path: join(rootDirPath, "package.json"),
    source: {
      name: answers.pkgName,
      version: "0.0.1",
      description: answers.pkgDesc,
      bin: {},
      scripts: {},
      repository: {
        type: "git",
        url: "git+ssh://git@github.com/" + repo + ".git"
      },
      author: answers.author,
      license: "MIT",
      bugs: {
        url: "https://github.com/" + repo + "/issues"
      },
      homepage: "https://github.com/" + repo + "#readme",
      devDependencies: {},
      dependencies: {}
    }
  })

  actions.push({
    action: "npmInstall",
    dev: true,
    source: ["boiler-dev"],
  })

  return actions
}
