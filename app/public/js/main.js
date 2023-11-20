const parseTorrent = require('parse-torrent');
const hat = require('hat');
const crypto = require('crypto');

// Función para enviar mensajes al proceso principal
async function sendMessage(ipc, ...message) {
    try {
        const reply = await ipcRenderer.invoke(ipc, ...message);
        return reply;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Ajax
function _ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        kit.send({
            url: url,
            method: method,
            data,
            success: (respuesta) => {
                resolve(respuesta);
            },
            error: (codigo, respuesta) => {
                reject({ codigo, respuesta });
            }
        });
    });
}

// Función para generar un peerId aleatorio
function generarPeerId() {
    return hat(160); // 160 bits
}

// Función para generar un nodeId aleatorio
function generarNodeId() {
    return crypto.randomBytes(20).toString('hex'); // 160 bits
}

// Funciones para generar identificadores personalizados o dejar que se generen automáticamente
const customPeerId = generarPeerId();
const customNodeId = generarNodeId();

function centerDivTopJq(elm) {
    const elms = $(".body");

    const alto = elms.height() / 2;
    const altoElm = $(elm).height() / 2;

    // Asegurarse de que el resultado no sea negativo
    const numb = Math.max(alto - altoElm, 0);

    return numb;
}

function update_center_div() {

    const elm = $(".elm_center_h");
    const num = centerDivTopJq(elm);

    elm.css({ marginTop: `${num}px` });

    if (elm.css("opacity") === "0") {
        elm.css({ opacity: 1 });
    }
}

async function getJson(url) {
    try {
        // Hacer una solicitud con fetch al archivo JSON
        const response = await fetch(url);

        // Verificar si la solicitud fue exitosa (código de respuesta en el rango 200)
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status}`);
        }

        // Parsear la respuesta JSON y retornar los datos obtenidos
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos JSON:', error);
    }
}

// Verificar si es magnet
function isMagnet(url) {
    if (url.startsWith('magnet:?')) {
        const prefix = 'magnet:?xt=urn:btih:';
        const parts = url.split('&');

        for (const part of parts) {
            if (part.startsWith(prefix)) {
                const infoHash = part.slice(prefix.length);
                if (/^[0-9a-fA-F]{40}$/.test(infoHash)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Verificar ruta de archivo
function isFile(cadena) {
    // Utiliza una expresión regular para verificar si la cadena es una ruta de archivo
    const expresionRegular = /^[A-Za-z]:\\[^*|"<>?\n]*$/;
    return expresionRegular.test(cadena);
}

async function loadHash(url) {
    try {
        let datos = await getJson(url);
        saved.addSaved("hash", datos);
    } catch (error) {
        console.log(error);
    }
}

function reTrackers(texto) {
    // Expresión regular para encontrar todos los protocolos en el texto, incluso si están pegados
    var expresionRegular = /(udp|http|https|ftp):\/\/[^\s]+\b/g;

    // Buscar coincidencias en el texto
    var coincidencias = texto.match(expresionRegular);

    // Filtrar y eliminar espacios y campos vacíos
    var protocolos = coincidencias ? coincidencias.map(function (item) {
        return item.trim();
    }).filter(Boolean) : [];

    return protocolos;
}

function removeObj(arrays, key, value) {
    return arrays.filter((elemento) => elemento[key] !== value);
}

function getInfoTorrent(name) {

    let apinames = saved.getSaved("hash");

    let getdaa = saved.getSaved(name);

    let getApi = { ...apinames[getdaa.infoHash.slice(-9)] };

    const id_win = 'get_' + name;


    let getInfotr = null;
    getInfotr = new BrowserWin({
        id: id_win,
        title: getApi.name || getdaa.name,
        width: 913,
        height: 522,
        state: false,
        reload: true
    });

    getInfotr.on("close", () => {
        getInfotr = null;
    });

    getInfotr.on("finish-load", async (ventana) => {
        let body = ventana.find(".browser_tbody");
        body.css({ "background-color": "#eee", overflow: "auto" });
        body.empty();

        // formulario
        const $form = $("<form class='row' spellcheck='false'>");

        // Create en $form Input Name
        const $nameInput = $(`<div class='input-field col s12'>`);
        $nameInput.append(`<input id='name_${id_win}' type='text' class='validate'>`);
        $nameInput.append(`<label for='name_${id_win}'>Name</label>`);
        $nameInput.find(`input`).val(getdaa.name);
        $form.append($nameInput);

        // Create en $form Input infoHash
        const $infoHashInput = $(`<div class='input-field col s12'>`);
        $infoHashInput.append(`<input id='infoHash_${id_win}' type='text' class='validate'>`);
        $infoHashInput.append(`<label for='infoHash_${id_win}'>Info Hash</label>`);
        $infoHashInput.find(`input`).val(getdaa.infoHash);
        $form.append($infoHashInput);

        // Create en $form Input size
        const $sizeInput = $(`<div class='input-field col s6'>`);
        $sizeInput.append(`<input id='size_${id_win}' type='text' class='validate'>`);
        $sizeInput.append(`<label for='size_${id_win}'>Size</label>`);
        $sizeInput.find(`input`).val(kit.getSizeBytes(getdaa.length));
        $form.append($sizeInput);

        // Create en $form Input total files
        const $totalFilesInput = $(`<div class='input-field col s6'>`);
        $totalFilesInput.append(`<input id='totalFiles_${id_win}' type='text' class='validate'>`);
        $totalFilesInput.append(`<label for='totalFiles_${id_win}'>Total Files</label>`);
        $totalFilesInput.find(`input`).val(getdaa.files.length);
        $form.append($totalFilesInput);

        // Create en $form Input Magnet
        const $magnetInput = $(`<div class='input-field col s12'>`);
        $magnetInput.append(`<input id='magnet_${id_win}' type='text' class='validate'>`);
        $magnetInput.append(`<label for='magnet_${id_win}'>Magnet</label>`);
        $magnetInput.find(`input`).val(getdaa.magnet);
        $form.append($magnetInput);

        // Create en $form Input MagnetBase64
        const $magnetInputbase64 = $(`<div class='input-field col s12'>`);
        $magnetInputbase64.append(`<input id='magnet_base64_${id_win}' type='text' class='validate'>`);
        $magnetInputbase64.append(`<label for='magnet_base64_${id_win}'>Magnet to Base64</label>`);
        $magnetInputbase64.find(`input`).val(btoa(getdaa.magnet));
        $form.append($magnetInputbase64);

        // Create en $form textarea Trackers
        const $trackersTextarea = $(`<div class='input-field col s12'>`);
        $trackersTextarea.append(`<textarea id='trackers_${id_win}' class='materialize-textarea'></textarea>`);
        $trackersTextarea.append(`<label for='trackers_${id_win}'>Trackers</label>`);
        $trackersTextarea.find(`textarea`).val(parseTorrent(getdaa.magnet).announce.join("\n"));
        $form.append($trackersTextarea);

        // container
        const $container_fuild = $("<div class='container-hab'>");

        $container_fuild.append($form);

        // añadir formulario en el body
        body.append($container_fuild);

        M.updateTextFields();
        M.textareaAutoResize($trackersTextarea.find("textarea"));
    });
}

async function action_pre(elm, event) {
    const $elm = $(elm);
    let id_item = $elm.attr("data-id").slice(4);
    let getdaa = saved.getSaved(id_item);

    if ($elm.attr("data-action") == "pre") {

        $elm.attr("data-action", "des");
        $elm.text(`Descargar (${kit.getSizeBytes(getdaa.length)})`);

        if (!saved.hasKey($elm.attr("data-id"))) {
            saved.addSaved($elm.attr("data-id"), parseTorrent(getdaa.magnet));
        }

        // show botones
        const $id = $(`#id_${getdaa.infoHash}`);
        $id.find(".showtrackers").fadeIn("fast");
        $id.find(".showfolder").fadeIn("fast");

    } else if ($elm.attr("data-action") == "save_in") {
        let folder = await sendMessage("open-folder");
        if (folder) {
            $elm.attr("data-tooltip", folder);
            if (saved.hasKey("save_in_" + id_item)) {
                saved.removeSaved("save_in_" + id_item);
            }
            saved.addSaved("save_in_" + id_item, folder);

            M.AutoInit();
        }
    } else if ($elm.attr("data-action") == "trs") {
        let trs = null;
        trs = new BrowserWin({
            id: id_item,
            title: getdaa.infoApi ? getdaa.infoApi.name : getdaa.name,
            width: 800,
            height: 500,
            state: false
        });

        trs.on("close", (ventana) => {
            trs = null;
        });

        trs.on("finish-load", (ventana) => {
            let body = ventana.find(".browser_tbody");
            body.css("background-color", "#263238");
            body.empty();

            // get magnet
            let magnet = saved.getSaved($elm.attr("data-id"));

            // textarea
            const $textarea = $("<textarea>");
            $textarea.addClass("trs_edit");
            $textarea.attr("spellcheck", false);

            $textarea.css({ "user-select": "text" });

            $textarea.val(magnet.announce.join("\n"));

            $textarea.on("keyup", () => {
                saved.updateValue($elm.attr("data-id"), { announce: reTrackers($textarea.val()) });
            });

            body.append($textarea);
        });
    } else if ($elm.attr("data-action") == "des") {

        if (event.ctrlKey) {
            getInfoTorrent(id_item);
        } else {
            // get magnet
            let magnet = $elm.attr("data-id");
            // read file
            let filejson = await isNode.rdJson(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "downloads.json"), true, []);
            let editArray = removeObj(filejson, "name", getdaa.name);

            editArray.unshift({
                name: getdaa.name,
                infoHash: getdaa.infoHash,
                savein: saved.getSaved("save_in_" + id_item) ? saved.getSaved("save_in_" + id_item) : saved.getSaved("folders").downloads,
                magnet: parseTorrent.toMagnetURI(saved.getSaved(magnet)),
                length: getdaa.length
            });


            // save
            await isNode.saveJson(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "downloads.json"), JSON.stringify(editArray, null, 2));
            // download
            trs_download(getdaa.infoHash);

            // click
            const trs_downloads = document.querySelector(".trs_downloads");
            trs_downloads.click();
        }


    }


}


function getMagnetLink(torrentFileOrMagnetLink) {
    const parsedTorrent = parseTorrent(torrentFileOrMagnetLink);
    const magnetLink = parseTorrent.toMagnetURI(parsedTorrent);
    return magnetLink;
}

async function trs_action(action, infoHash) {
    const act = await _ajax("/trs/" + action + "/" + infoHash, "GET", {});
    if (act.status && act.status == true) {
        M.toast({ html: `${act.title} download was stopped`, classes: 'rounded orange darken-4' });
    }
}

async function trs_download(infoHash) {
    let filejson = await isNode.rdJson(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "downloads.json"), true, []);
    let search = saved._search(filejson, "infoHash", infoHash);

    if (search.length > 0) {
        // mostrar loading
        kit.show(".loading", 100, "flex")
        // iniciar descarga
        const res = await _ajax("/download", "POST", search[0]);
        if (res.status == false) {
            M.toast({ html: res.title, classes: 'rounded red' });
        } else {
            M.toast({ html: `${res.name} started downloading`, classes: 'rounded blue' });
        }

        // ocultar loading
        $(".loading").fadeOut("fast");
    }
}

kit.onDOMReady(async () => {

    // All folders
    let folders = await sendMessage("all-folders");
    saved.addSaved("folders", folders);

    // saved.addSaved("trs", false);
    // saved.updateSaved("trs", true);

    // console.log(saved.getSaved("trs"));

    // cargar Hash
    let loadHash = await isNode.rdJson(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "hash.json"), true, {});
    saved.addSaved("hash", loadHash);

    update_center_div();

    const btn_trs = document.querySelector(".openlist_torrent");
    btn_trs.addEventListener("click", () => {
        mainWins();
    });

    const btn_trs2 = document.querySelector(".trs_downloads");
    btn_trs2.addEventListener("click", () => {
        const bb = (item, id) => {

            let datagames = saved.getSaved("hash");

            return `<div class="download_file">
            <div class="icono_download" style="background-image: url('${datagames[id] ? datagames[id].cover : "/lib/apps/iconos/torrenthive.svg"}');"></div>
            <div class="info_download_list">
              <div class="name_download">${datagames[id] ? datagames[id].name : item.name}</div>
              <div class="magnet_download">${item.magnet}</div>
              <div class="pr_download">
                <div class="info_download_total_downloaded">
                  <div class="total_downloaded">
                    <span class="download_speed">0 B/s</span>
                    <span class="download_total_and_size">(${kit.getSizeBytes(item.length)})</span>
                  </div>
                </div>
                <div class="liner-download">
                 <div class="liner-progrees"></div>  
                </div>  
              </div>        
            </div>
  
            <div class="stop_pause hide btn_action">
              <div class="pause_down btn_is_pause_or_play icon-pause1" onclick="trs_action('pause', '${item.infoHash}')"></div>
              <div class="stop_down icon-media-stop" onclick="trs_action('stop', '${item.infoHash}')"></div>
            </div>
            <div class="stop_pause hide btn_play">
              <div class="pause_down icon-play1" onclick="trs_download('${item.infoHash}')"></div>
            </div>
          </div>`;
        }
        let mainWindow = null;
        mainWindow = new BrowserWin({
            id: 'downloads_th',
            title: 'Descargas',
            width: 800,
            height: 500,
            reload: true
        });

        mainWindow.on("close", async (ventana) => {
            mainWindow = null;
            // read file
            let filejson = await isNode.rdJson(path.resolve(folders.appPath, "apps", "torrenthive", "app", "public", "downloads.json"), true, []);
            for (let i = 0; i < filejson.length; i++) {
                const item = filejson[i];
                const id_hash = item.infoHash.slice(-9);
                kit.removeInterval(id_hash);
            }
        });

        mainWindow.on("finish-load", async (ventana) => {
            let body = ventana.find(".browser_tbody");
            body.css("background-color", "#eee");
            body.empty();

            // download_list
            const $download_list = $("<div>")
            $download_list.addClass("download_list");


            // read file
            let filejson = await isNode.rdJson(path.resolve(folders.appPath, "apps", "torrenthive", "app", "public", "downloads.json"), true, []);

            for (let i = 0; i < filejson.length; i++) {

                const item = filejson[i];

                const id_hash = item.infoHash.slice(-9);

                kit.removeInterval(id_hash);

                const $bb = $(bb(item, id_hash));

                $download_list.append($bb);

                // interval
                kit.createInterval(id_hash, async () => {
                    const getdata = await _ajax("/get/" + item.infoHash, "GET", {});
                    if (!getdata) {
                        if ($bb.find(".btn_play").is(".hide")) {
                            $bb.find(".btn_play").removeClass("hide");
                        }
                        if (!$bb.find(".btn_action").is(".hide")) {
                            $bb.find(".btn_action").addClass("hide");

                            $bb.find(".download_speed").text(`${kit.getSizeBytes(0)}/s`);
                            $bb.find(".download_total_and_size").text(`(${kit.getSizeBytes(getdata.length || 0)})`);

                            // progress
                            $bb.find(".liner-progrees").css({ width: 0 + "%" });
                        }

                    } else {
                        if (getdata.done) {
                            if (!$bb.find(".btn_play").is(".hide")) {
                                $bb.find(".btn_play").addClass("hide");
                            }
                            if (!$bb.find(".btn_action").is(".hide")) {
                                $bb.find(".btn_action").addClass("hide");
                            }

                            $bb.find(".download_speed").text(`${kit.getSizeBytes(getdata.downloadSpeed || 0)}/s`);
                            $bb.find(".download_total_and_size").text(`(${kit.getSizeBytes(getdata.length || 0)} / ${kit.getSizeBytes(getdata.length || 0)})`);

                            // progress
                            $bb.find(".liner-progrees").css({ width: getdata.progress + "%" });

                            // Mensaje
                            M.toast({ html: `${getdata.name} was completely downloaded`, classes: 'rounded green' });

                            // remove interval
                            kit.removeInterval(item.infoHash.slice(-9));
                            return;
                        }
                        if (getdata.paused === false) {
                            if (!$bb.find(".btn_play").is(".hide")) {
                                $bb.find(".btn_play").addClass("hide");
                            }

                            if ($bb.find(".btn_action").is(".hide")) {
                                $bb.find(".btn_action").removeClass("hide");
                            }

                            if ($bb.find(".btn_is_pause_or_play").is(".icon-play1")) {
                                $bb.find(".btn_is_pause_or_play").removeClass("icon-play1");
                                $bb.find(".btn_is_pause_or_play").addClass("icon-pause1");

                                // add attr
                                $bb.find(".btn_is_pause_or_play").attr("onclick", `trs_action('pause', '${item.infoHash}')`);
                            }

                            $bb.find(".download_speed").text(`${kit.getSizeBytes(getdata.downloadSpeed || 0)}/s`);
                            $bb.find(".download_total_and_size").text(`(${kit.getSizeBytes(getdata.downloaded || 0)} / ${kit.getSizeBytes(getdata.length || 0)})`);

                            // progress
                            $bb.find(".liner-progrees").css({ width: getdata.progress + "%" });

                        } else if (getdata.paused === true) {

                            if (!$bb.find(".btn_play").is(".hide")) {
                                $bb.find(".btn_play").addClass("hide");
                            }

                            if ($bb.find(".btn_action").is(".hide")) {
                                $bb.find(".btn_action").removeClass("hide");
                            }


                            if ($bb.find(".btn_is_pause_or_play").is(".icon-pause1")) {
                                $bb.find(".btn_is_pause_or_play").removeClass("icon-pause1");
                                $bb.find(".btn_is_pause_or_play").addClass("icon-play1");

                                // add attr
                                $bb.find(".btn_is_pause_or_play").attr("onclick", `trs_action('continue', '${item.infoHash}')`);
                            }


                            $bb.find(".download_speed").text(`${kit.getSizeBytes(getdata.downloadSpeed || 0)}/s`);
                            $bb.find(".download_total_and_size").text(`(${kit.getSizeBytes(getdata.downloaded || 0)} / ${kit.getSizeBytes(getdata.length || 0)})`);

                            // progress
                            $bb.find(".liner-progrees").css({ width: getdata.progress + "%" });



                        }

                        // console.log(getdata);


                    }
                }, 3000);

            }

            body.append($download_list);

        });
    });



    // console.log(BrowserWin.getAll());


    // let mainWindowtwo = null;

    // mainWindowtwo = new BrowserWin({
    //     id: 'main2',
    //     title: 'Main Window 2',
    //     width: 1024,
    //     height: 768
    // });

    // mainWindowtwo.on("close", () => {
    //     mainWindowtwo = null;
    // });


    // input
    const inputSearch = document.querySelector("#text-search");
    const input_file = document.querySelector("#open_torrents");

    kit.onClick("run_search", async () => {
        if (inputSearch.value.length < 1 && !/\S/.test(inputSearch.value)) {

            if (input_file) {
                input_file.click();
            }
            return;
        }

        // verificar si es un magnet
        const ismagnet = isMagnet(inputSearch.value);
        if (ismagnet) {


            let folder = await sendMessage("open-folder");
            if (folder) {
                let filejson = await openFileJson(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "downloads.json"), true, []);
                let datamagnet = parseTorrent(inputSearch.value);

                let editArray = removeObj(filejson, "infoHash", datamagnet.infoHash);

                editArray.unshift({
                    name: datamagnet.name,
                    infoHash: datamagnet.infoHash,
                    savein: folder,
                    magnet: parseTorrent.toMagnetURI(datamagnet),
                    length: 0
                });

                // save
                await utilcode.fsWrite(path.resolve(saved.getSaved("folders").appPath, "apps", "torrenthive", "app", "public", "downloads.json"), JSON.stringify(editArray, null, 2));

                // run download
                trs_download(datamagnet.infoHash);
            }

        }
    })

    // Pagination
    const pag = ($elemento, info) => {
        // ul
        const ul = $elemento.find(`#pag_${info.infohash.slice(-9)}`);
        // body
        const bodyTable = $elemento.find(`#navegate_${info.infohash.slice(-9)}`);

        $(ul).pagination({
            dataSource: info.files,
            pageSize: 5,
            prevText: "<span class='btn-back icon-keyboard_arrow_left'></span>",
            nextText: "<span class='btn-next icon-keyboard_arrow_right'></span>",
            afterIsLastPage: () => {
                console.log(true);
            },
            callback: async function (data, pagination) {

                bodyTable.empty();
                for (const tbody of data) {
                    const tbodyTrs = $(`<div class="tbbody">
                                            <div class="tbb">${tbody.name}</div>
                                            <div class="tbb">${tbody.path}</div>
                                            <div class="tbb text_size">${kit.getSizeBytes(tbody.length)}</div>
                                        </div>`);
                    bodyTable.append(tbodyTrs);
                }

            }
        });
    }

    // Separte Extension
    const ext = async (archivos) => {
        try {
            let exeFiles = [];
            let isoFiles = [];
            let otrasExtensiones = [];

            await Promise.all(archivos.map(async (archivo) => {
                const extension = kit.extname(archivo.path);

                if (extension === '.exe') {
                    exeFiles.push(archivo);
                } else if (extension === '.iso') {
                    isoFiles.push(archivo);
                } else {
                    otrasExtensiones.push(archivo);
                }
            }));

            const resultado = { exeFiles, isoFiles, otrasExtensiones };
            return resultado;
        } catch (error) {
            throw error;
        }
    };



    // Template
    let tmp_files = async (item) => {
        const nameItem = BrowserWin.normalizeFileName(item.name);

        let torrentInfo = saved.getSaved(nameItem);
        if (!saved.hasKey(nameItem)) {
            let readfile = fs.readFileSync(item.path);
            torrentInfo = parseTorrent(readfile);
            saved.addSaved(nameItem, { name: torrentInfo.name, infoHash: torrentInfo.infoHash, files: torrentInfo.files, comment: torrentInfo.comment, length: torrentInfo.length, magnet: getMagnetLink(readfile) });
        }


        let allhash = {};
        if (saved.hasKey("hash")) {
            allhash = saved.getSaved("hash");
        }



        const infohash = torrentInfo.infoHash.slice(-9);
        let infoJson = allhash[infohash];

        // nuevos datos
        if (infoJson) {
            saved.updateValue(nameItem, { itemName: nameItem, infoApi: infoJson });
        }


        // ext files
        let filesExt = await ext(torrentInfo.files);

        // var
        const pre = `pre_${nameItem}`;
        // btn descargar
        let des = saved.hasKey(pre) ? `Descargar (${kit.getSizeBytes(torrentInfo.length)})` : "Preparar";
        let dataattr = saved.hasKey(pre) ? "des" : "pre";

        // save
        let datasave = saved.hasKey("save_in_" + pre.slice(4)) ? saved.getSaved("save_in_" + pre.slice(4)) : folders.downloads;

        const tp = `<div class="torrent_file z-depth-2" id="id_${torrentInfo.infoHash}">
                    <div class="icono_file_list" style="background-image: url('${infoJson ? infoJson.cover : "/lib/apps/iconos/torrenthive.svg"}">
                    <div class="icon_file"></div>
                    </div>
                    <div class="text_info_file">
                    <h5>${infoJson ? infoJson.name : torrentInfo.name}</h5>
                    <h6>${torrentInfo.comment ? torrentInfo.comment.replace(/org/g, "app") : "No Fuente"}</h6>
                    <div class="files_download">
                        <div class="exes">
                        <span>Files exe:</span>
                        <span>${filesExt.exeFiles.length}</span>
                        </div>
                        <div class="exes">
                        <span>Files iso:</span>
                        <span>${filesExt.isoFiles.length}</span>
                        </div>

                        <div class="exes">
                        <span>Other files:</span>
                        <span>${filesExt.otrasExtensiones.length}</span>
                        </div>

                        <div class="exes">
                        <span>Total files:</span>
                        <span>${torrentInfo.files.length}</span>
                        </div>

                    </div>

                    <div class="table_info_files">

                        <div class="tabla">
                            <div class="header-table">
                            <div class="tbh">Name</div>
                            <div class="tbh">Path</div>
                            <div class="tbh text_size">Size</div>
                            </div>
                            <div class="tset" id="navegate_${torrentInfo.infoHash.slice(-9)}"></div>   
            
                        </div>




                        <div class="navegate">
                            <ul class="pagination" id="pag_${torrentInfo.infoHash.slice(-9)}"></ul>
                        </div>
                    </div>
                    <div class="line_progress"></div>
                    <div class="btns">
                        <button class="btn waves-effect waves-light blue" data-action="${dataattr}" data-id="pre_${nameItem}" onclick="action_pre(this, event)">${des}</button>
                        <button class="showtrackers btn waves-effect waves-light purple ${dataattr === "des" ? "" : "hides"}" data-action="trs" data-id="pre_${nameItem}" onclick="action_pre(this)">Trackers</button>
                        <button class="showfolder btn waves-effect waves-light yellow darken-4 ${dataattr === "des" ? "" : "hides"} tooltipped" data-position="top" data-tooltip="${datasave}" data-action="save_in" data-id="pre_${nameItem}" onclick="action_pre(this)">Guardar en</button>
                    </div>
                    </div>
                </div>`;

        return {
            template: () => {
                return tp;
            },
            info: () => {
                return {
                    name: torrentInfo.name,
                    infohash: torrentInfo.infoHash,
                    files: torrentInfo.files
                };
            }
        }
    }


    const mainWins = () => {
        let mainWindow = null;
        mainWindow = new BrowserWin({
            id: 'main',
            title: 'Lista de Torrents',
            width: 800,
            height: 500,
            reload: true
        });

        mainWindow.on("close", (ventana) => {
            mainWindow = null;
        });

        mainWindow.on("finish-load", async (ventana) => {
            let body = ventana.find(".browser_tbody");
            body.css("background-color", "#b0bec5");
            body.empty();

            // torrents_list
            let torrents_list = $("<div>").addClass("torrents_list");

            // container
            let container = $("<div>").addClass("container");

            if (saved.hasKey("add_files")) {
                let fileslist = saved.getSaved("add_files");
                let number_save = 0;
                for (const item of fileslist) {
                    const item_file = await tmp_files(item);
                    let elm = $(item_file.template());

                    pag(elm, item_file.info());

                    container.append(elm);

                    number_save++;
                }
            } else {
                container.html("<h4 class='no_text_data'>No hay nada</h4>");
            }

            torrents_list.append(container);

            // body
            body.append(torrents_list);

            // Tooltips
            M.AutoInit();
        });

    }

    // Almacena los infoHash de los archivos arrastrados para evitar duplicados
    const draggedInfoHashesInput = [];

    // Files
    input_file.addEventListener('change', async function (event) {
        const selectedFiles = event.target.files;

        if (!saved.hasKey("add_files")) {
            saved.addSaved("add_files", [])
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            if (kit.extname(file.path) === ".torrent") {
                // Lee el archivo y obtén el infoHash
                const readfile = fs.readFileSync(file.path);
                const torrentInfo = parseTorrent(readfile);
                const infoHash = torrentInfo.infoHash;

                // Verifica si el infoHash ya ha sido arrastrado
                if (!draggedInfoHashesInput.includes(infoHash)) {
                    // Agrega el infoHash a la lista y realiza las acciones necesarias
                    draggedInfoHashesInput.push(infoHash);

                    const search = saved.where("add_files", { name: file.name });
                    if (search.length == 0) {
                        saved.addSaved("add_files", file)
                    }


                }
            }


        }

        if (saved.getSaved("add_files").length > 0) {
            mainWins();
        }

    });



    // Almacena los infoHash de los archivos arrastrados para evitar duplicados
    const draggedInfoHashes = [];

    kit.fileDropZone(".body", (e) => {
        const selectedFiles = e;

        if (!saved.hasKey("add_files")) {
            saved.addSaved("add_files", [])
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            if (kit.extname(file.path) === ".torrent") {
                // Lee el archivo y obtén el infoHash
                const readfile = fs.readFileSync(file.path);
                const torrentInfo = parseTorrent(readfile);
                const infoHash = torrentInfo.infoHash;

                // Verifica si el infoHash ya ha sido arrastrado
                if (!draggedInfoHashes.includes(infoHash)) {
                    // Agrega el infoHash a la lista y realiza las acciones necesarias
                    draggedInfoHashes.push(infoHash);

                    const search = saved.where("add_files", { name: file.name });
                    if (search.length == 0) {
                        saved.addSaved("add_files", file)
                    }
                }
            }


        }

        if (saved.getSaved("add_files").length > 0) {
            mainWins();
        }

    });

    // Ruta del archivo
    const filePath = path.resolve(saved.getSaved("folders").userData, "data", "json", "torrenthive.json");
    async function watchFile() {
        let lastModifiedTime = 0;
        const checkFile = async () => {
            try {
                const currentModifiedTime = await getLastModifiedTime(filePath);

                if (currentModifiedTime > lastModifiedTime) {
                    lastModifiedTime = currentModifiedTime;
                    let tr_save = await openFileJson(path.resolve(saved.getSaved("folders").userData, "data", "json", "torrenthive.json"), true, {});
                    if (tr_save.opentr) {
                        // add download
                        trs_download(tr_save.opentr);
                        // save
                        delete tr_save.opentr;
                        await utilcode.fsWrite(path.resolve(saved.getSaved("folders").userData, "data", "json", "torrenthive.json"), JSON.stringify(tr_save, null, 2));
                    }
                }
            } catch (error) {
                console.error('Error al verificar cambios en el archivo:', error);
            }
        };
        kit.createInterval("checkFile_torrenthive", checkFile, 2000);
        async function getLastModifiedTime(filePath) {
            const stats = await fs.promises.stat(filePath);
            return stats.mtime.getTime();
        }
        function stopWatchingFile() {
            kit.removeInterval("checkFile_torrenthive");
            console.log('Observación de cambios en el archivo detenida.');
        }
        return stopWatchingFile;
    }

    // Iniciar la observación de cambios en el archivo
    const stopWatching = await watchFile();



})

// Windows Resize
$(window).on("resize", () => {
    update_center_div();
});

ipcRenderer.on("data-args", async (event, data) => {
    console.log(data);
})



// Escuchar cambios en el `localStorage`
window.addEventListener('storage', (event) => {
    if (event.key === 'datosCompartidos') {
        // Se produjo un cambio en el `localStorage`, manejar los datos compartidos
        const datos = JSON.parse(event.newValue);
        // Hacer algo con los datos
    }
});