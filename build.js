const fs = require("fs")
const path = require("path")

function toBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    ".png": "image/png",
    ".css": "text/css",
    ".js": "application/javascript",
    ".otf": "font/otf",
    ".ttf": "font/ttf",
  }

  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`)
    return ""
  }

  const fileContent = fs.readFileSync(filePath)
  const mimeType = mimeTypes[ext] || "application/octet-stream"
  return `data:${mimeType};base64,${fileContent.toString("base64")}`
}

function processCSS(cssFilePath) {
  if (!fs.existsSync(cssFilePath)) {
    console.warn(`CSS file not found: ${cssFilePath}`)
    return ""
  }

  const cssContent = fs.readFileSync(cssFilePath, "utf-8")
  const cssDir = path.dirname(cssFilePath)

  const importRegex = /@import\s+["'](.+?)["'];/g
  let inlinedCSS = cssContent.replace(importRegex, (_, importPath) => {
    const absoluteImportPath = path.resolve(cssDir, importPath)
    return processCSS(absoluteImportPath)
  })

  const urlRegex = /url\(["']?(.+?)["']?\)/g
  inlinedCSS = inlinedCSS.replace(urlRegex, (_, assetPath) => {
    const absoluteAssetPath = path.resolve(cssDir, assetPath)
    const base64Data = toBase64(absoluteAssetPath)
    return base64Data ? `url("${base64Data}")` : `url("${assetPath}")`
  })

  return inlinedCSS
}

function inlineAssets(htmlFilePath, outputFilePath) {
  let htmlContent = fs.readFileSync(htmlFilePath, "utf-8")
  const assetsDir = path.dirname(htmlFilePath)

  const cssRegex = /<link\s+rel=["']stylesheet["']\s+href=["'](\.\/[^"']+\.css)["'].*?>/g
  htmlContent = htmlContent.replace(cssRegex, (_, cssFilePath) => {
    const absoluteCSSPath = path.join(assetsDir, cssFilePath)
    const inlinedCSS = processCSS(absoluteCSSPath)
    const base64CSS = `data:text/css;base64,${Buffer.from(inlinedCSS).toString("base64")}`
    return `<link rel="stylesheet" href="${base64CSS}">`
  })

  const assetRegex = /(?:src|href)\s*=\s*["'](\.\/[^"']+)["']/g
  htmlContent = htmlContent.replace(assetRegex, (_, filePath) => {
    const absolutePath = path.join(assetsDir, filePath)
    const base64Data = toBase64(absolutePath)
    return base64Data ? `src="${base64Data}"` : `src="${filePath}"`
  })

  fs.writeFileSync(outputFilePath, htmlContent, "utf-8")
  console.log(`Standalone HTML file written to: ${outputFilePath}`)
}

const inputHtml = "./index.html"
const outputHtml = "./dist/index.html"
inlineAssets(inputHtml, outputHtml)