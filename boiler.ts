import {
  fs,
  git,
  PromptBoiler,
  GenerateBoiler,
  InstallBoiler,
} from "boiler-dev"

import { basename, join } from "path"

export const prompt: PromptBoiler = async ({
  answers,
  cwdPath,
}) => {
  let { name, email } = answers

  if (!name || !email) {
    ;[name, email] = await Promise.all([
      git.userName(),
      git.userEmail(),
    ])
  }

  return [
    {
      type: "input",
      name: "pkgName",
      message: "project name (kebab-case)",
      default: basename(cwdPath),
    },
    {
      type: "input",
      name: "pkgDesc",
      message: "project description",
    },
    {
      type: "input",
      name: "githubOrg",
      message: "github org",
      default: name.includes(" ") ? undefined : name,
    },
    {
      type: "input",
      name: "author",
      message: "author",
      default: name + " <" + email + ">",
    },
  ]
}

export const install: InstallBoiler = async () => {
  const actions = []

  actions.push({
    action: "npmInstall",
    dev: true,
    source: ["boiler-dev"],
  })

  return actions
}

export const generate: GenerateBoiler = async ({
  answers,
  cwdPath,
}) => {
  const actions = []
  const repo = answers.githubOrg + "/" + answers.pkgName
  const pkgJsonPath = join(cwdPath, "package.json")

  let pkgJson = { dependencies: {}, devDependencies: {} }

  if (await fs.pathExists(pkgJsonPath)) {
    pkgJson = await fs.readJson(pkgJsonPath)
  }

  const { dependencies, devDependencies } = pkgJson

  actions.push({
    action: "write",
    path: pkgJsonPath,
    source: {
      name: answers.pkgName,
      version: "0.0.1",
      description: answers.pkgDesc,
      bin: {},
      scripts: {},
      repository: {
        type: "git",
        url: "git+ssh://git@github.com/" + repo + ".git",
      },
      author: answers.author,
      license: "MIT",
      bugs: {
        url: "https://github.com/" + repo + "/issues",
      },
      homepage: "https://github.com/" + repo + "#readme",
      devDependencies,
      dependencies,
    },
  })

  return actions
}
