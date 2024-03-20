/*
 * @Author: _WXS DEVELOPER
 * @Date: 2024-03-20 09:35:25
 * @Description: This is a grabber to grab the data from bilibili.com
 * @LastEditors: _WXS DEVELOPER
 * @LastEditTime: 2024-03-20 09:35:25
 */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

if (!process.argv[2]) {
  console.error('--> Banner not named, please run the command correctly, for example: npm run grab ???') 
  return
}
console.log('Downloading resources...');

let saveFolder = "";
const today = new Date();
const year = today.getFullYear();
const month = ("0" + (today.getMonth() + 1)).slice(-2);
const day = ("0" + today.getDate()).slice(-2);
const date = year + "-" + month + "-" + day

const folderPath = "./assets/" + date;
if (fs.existsSync(folderPath)) {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    fs.unlinkSync(filePath); 
  });
} else {
  fs.mkdirSync(folderPath, { recursive: true });
}
saveFolder = folderPath;

const data = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1650,
    height: 800
  })

  try {
    await page.goto("https://www.bilibili.com/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".animated-banner");

    await sleep(3000);

    let layerElements = await page.$$(".animated-banner .layer");
    for (let i = 0; i < layerElements.length; i++) {
      const layerFirstChild = await page.evaluate(async (el) => {
        const pattern = /translate\(([-.\d]+px), ([-.\d]+px)\)/;
        const { width, height, src, style, tagName } = el.firstElementChild;
        const matches = style.transform.match(pattern);
        const transform = [1,0,0,1,...matches.slice(1).map(x => +x.replace('px', ''))]
        return { tagName: tagName.toLowerCase(), opacity: [style.opacity,style.opacity], transform, width, height, src, a: 0.01 };
      }, layerElements[i]);
      await download(layerFirstChild)
    }
    let element = await page.$('.animated-banner')
    let { x, y } = await element.boundingBox()
    await page.mouse.move(x + 0, y + 50)
    await page.mouse.move(x + 1000, y, { steps: 1 })
    await sleep(1200);
    layerElements = await page.$$(".animated-banner .layer"); 
    for (let i = 0; i < layerElements.length; i++) {
      const skew = await page.evaluate(async (el) => {
        const pattern = /translate\(([-.\d]+px), ([-.\d]+px)\)/;
        const matches = el.firstElementChild.style.transform.match(pattern);
        return matches.slice(1).map(x => +x.replace('px', ''))[0]
      }, layerElements[i]);
      data[i].a = (skew - data[i].transform[4]) / 1000
    }
  
  } catch (error) {
    console.error("Error:", error);
  }

  async function download(item) {
    const fileArr = item.src.split("/");
    const filePath = `${saveFolder}/${fileArr[fileArr.length - 1]}`;

    const content = await page.evaluate(async (url) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return { buffer: Array.from(new Uint8Array(buffer)) };
    }, item.src);

    const fileData = Buffer.from(content.buffer);
    fs.writeFileSync(filePath, fileData);
    data.push({ ...item, ...{ src: filePath } });
  }

  fs.writeFileSync(path.resolve(__dirname, `${saveFolder}/data.json`), JSON.stringify(data, null, 2));
  
  console.log('Writing to local files...');

  await sleep(300)

  let codes = fs.readFileSync("config.js", "utf8");

  const newConfig = `{
    name: "${process.argv[2]}",
    data: await banner_${date.replaceAll('-','')}.json()
},`;
  const newImport = `const banner_${date.replaceAll('-','')} = await fetch('./assets/${date}/data.json?r='+Math.random())`

  const codeCollector = [];
  for (const iterator of codes.split("\n")) {
    codeCollector.push(iterator);
    if (iterator.indexOf("-- ADD NEW --") !== -1) {
      codeCollector.push(newConfig);
    } else if (iterator.indexOf("-- IMPORT --") !== -1) {
      codeCollector.push(newImport);
    }
  }
  fs.writeFileSync('config.js', codeCollector.join("\n"))

  await sleep(300)
  await browser.close();
  console.log('Run npm run serve to see the result!');
})();

function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
