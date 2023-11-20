// Electron JS
const { app, BrowserWindow, dialog } = require('electron');

// Modules de Node
const path = require("path");
const fs = require("fs");
const { URLSearchParams, URL } = require('url');

// axios
const axios = require('axios');

// Saved
const saved = require('../../modules/saved')

// UtilCode
const utilcode = require("../../modules/utilcodes")

// libraries
const lib = require("../../modules/util-libraries")

// UserData
const userdata = app.getPath("userData")

// package app
const package_app = require("./package.json")


// Crear carpetas
async function setFolders(raiz, ruta) {
  try {
    await utilcode.createFolderRecursive(raiz, ruta);
    return true;
  } catch (error) {
    return false;
  }
}

// Creator Folder App
async function folders_app() {
  await setFolders(userdata, `apps/${package_app.name}/json`);
}

// Read Files Json
async function openFileJson(file, existfile = false, value = "") {
  try {
    if (existfile) {
      if (!fs.existsSync(file)) {
        await utilcode.fsWrite(file, JSON.stringify(value, null, 2));
      }
    }
    const filejsontext = await utilcode.fsRead(file)
    return utilcode.jsonParse(filejsontext);
  } catch (error) {
    return false;
  }
}

// Config Default
async function app_default() {
  // Crear Carpetas
  await folders_app();

  // api games
  if (!saved.hasKey("apigames")) {
    
    let response = {};
    try {
       const get = await axios.get(`https://devlwte.github.io/appshubster/json/hash.json`, { timeout: (1000 * 10) });
       response = get.data;
    } catch (error) {
      response = {};
    }

    // save
    saved.addSaved("apigames", response);
    await utilcode.fsWrite(path.join(__dirname, "app", "public", "hash.json"), JSON.stringify(response, null, 2));
  }

}

// download
const DownloadTorrent = require("./app/modules/download");
const downloadtorrent = new DownloadTorrent();

const routes = [
  {
    method: "get",
    path: "/",
    handler: async (req, res) => {
      // User Default
      await app_default();
      // Renderer
      res.render(path.join(__dirname, "app", "views", "torrenthive"), {
        app_pack: package_app
      });
    },
  },
  {
    method: "post",
    path: "/download",
    handler: async (req, res) => {
      let body = req.body;
      try {
        const ms = await downloadtorrent.download(body);
        res.send(ms)
      } catch (error) {
        res.send(error)
      }
    },
  },
  {
    method: "get",
    path: "/trs/:action/:infoHash",
    handler: async (req, res) => {
      let params = req.params;
      let resp = null;
      if (params.action === "pause") {
        resp = downloadtorrent.pause(params.infoHash);
      } else if (params.action === "continue") {
        resp = downloadtorrent.continue(params.infoHash);
      } else if (params.action === "stop") {
        resp = downloadtorrent.stoptr(params.infoHash);
      }
      res.send(resp);
    },
  },
  {
    method: "get",
    path: "/get/:infoHash",
    handler: async (req, res) => {
      let params = req.params;
      if (saved.hasKey(params.infoHash)) {
        res.send(saved.getSaved(params.infoHash));
      } else {
        res.send(false);
      }
    },
  }
]

module.exports = [...lib, ...routes];
