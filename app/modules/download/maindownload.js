const path = require("path");
const fs = require("fs");

const WebTorrent = require('webtorrent');
const parseTorrent = require('parse-torrent');

// Saved
const saved = require('../../../../../modules/saved');


// template download
saved.addSaved("tp_download", (torrent, data) => {
    return {
        infoHash: data.infoHash,
        name: data.name,
        length: torrent.length || 0,
        downloadSpeed: torrent.downloadSpeed || 0,
        uploadSpeed: torrent.uploadSpeed || 0,
        downloaded: torrent.downloaded || 0,
        progress: (torrent.downloaded / torrent.length) * 100 || 0,
        numPeersToWire: torrent.numPeersToWire || 0,
        timeRemaining: torrent.timeRemaining || 0,
        paused: false,
        magnet: data.magnet,
        timeoutMilliseconds: data.timeoutMilliseconds || 20000,
        savein: data.savein,
        done: false
    }
})

class DownloadTorrent {
    constructor() {
        this.clients = {};
    }

    addClients(clientId) {
        const client = this.clients[clientId];
        if (client) {
            return client;
        } else {
            this.clients[clientId] = new WebTorrent();
            return this.clients[clientId];
        }
    }

    destroyClient(clientId) {
        const client = this.clients[clientId];
        if (client) {
            client.destroy(() => {
                delete this.clients[clientId];
            });
        }
    }

    endDownload(hash) {
        this.destroyClient(hash);
    }

    arePeersAvailable(hash, peers) {
        if (peers <= 0) {
            this.endDownload(hash);
            saved.updateValue(hash, {
                downloadSpeed: 0,
                uploadSpeed: 0,
                downloaded: 0,
                progress: 0,
                done: false,
                paused: true,
                error: "No peers available for download"
            });
        }
    }

    cancelDownload(infoHash, stop = false) {
        const client = this.clients[infoHash];

        if (!saved.hasKey("isremove_trs")) {
            saved.addSaved("isremove_trs", false);
        } else {
            saved.updateSaved("isremove_trs", false);
        }

        let result = false;
        if (client) {
            client.remove(infoHash, (err) => {
                if (err) {
                    console.error(`Error removing torrent ${infoHash}: ${err.message}`);
                } else {
                    if (stop) {
                        saved.removeSaved(infoHash);
                        saved.updateSaved("isremove_trs", true);
                    }

                }
                this.endDownload(infoHash);
            });
        } else {
            console.error(`Torrent client not found for ${infoHash}`);
        }

        return saved.getSaved("isremove_trs");
    }

    async download(options) {
        let { magnet, infoHash, savein, length = 0, timeoutMilliseconds = 20000 } = options;

        try {
            if (!this.clients[infoHash]) {
                const client = this.addClients(infoHash);

                return new Promise((resolve, reject) => {
                    let timeoutId = setTimeout(() => {
                        this.destroyClient(infoHash);
                        saved.removeSaved(infoHash);
                        clearTimeout(timeoutId);
                        reject({ title: 'Timeout expired', message: "Can't download the torrent because the waiting time has expired", status: false });
                    }, timeoutMilliseconds);

                    client.add(magnet, {
                        path: path.join(savein),
                        timeout: timeoutMilliseconds
                    }, (torrent) => {
                        clearTimeout(timeoutId);

                        // add article in saved
                        if (!saved.hasKey(infoHash)) {
                            saved.addSaved(infoHash, saved.getSaved("tp_download")(torrent, options));
                        }

                        // run download
                        torrent.on('download', () => {
                            saved.updateValue(infoHash, {
                                downloadSpeed: torrent.downloadSpeed,
                                uploadSpeed: torrent.uploadSpeed,
                                downloaded: torrent.downloaded,
                                length: torrent.length,
                                progress: (torrent.downloaded / torrent.length) * 100,
                            });

                            this.arePeersAvailable(infoHash, torrent.numPeers, options);
                        });

                        torrent.on('done', async () => {
                            this.endDownload(infoHash);
                            saved.updateValue(infoHash, {
                                downloadSpeed: 0,
                                uploadSpeed: 0,
                                downloaded: length,
                                progress: 100,
                                done: true
                            });
                        });

                        // Manejador de evento para el evento 'error'
                        torrent.on('error', (err) => {
                            this.cancelDownload(infoHash);
                            clearTimeout(timeoutId);
                            reject({ title: 'Error during download', message: err.message, status: false });
                        });



                        resolve({ name: options.name, status: true });
                    });
                });
            } else {
                return Promise.reject({ title: "This torrent is already in the download list", name: options.name, message: "This torrent is already in the download list", status: false });
            }
        } catch (error) {
            return Promise.reject({ title: error.message, name: options.name, status: false }); // Rechaza la promesa en caso de error
        }
    }

    pause(hash) {
        if (this.clients[hash]) {
            this.destroyClient(hash);
            saved.updateValue(hash, {
                downloadSpeed: 0,
                uploadSpeed: 0,
                paused: true
            })
        }

        return true;
    }

    async continue(hash) {
        if (saved.hasKey(hash)) {
            saved.updateValue(hash, {
                paused: false
            })

            let datos = saved.getSaved(hash);
            try {
                const ms = await this.download(datos);
                return ms;
            } catch (error) {
                return error;
            }
        }
    }

    stoptr(hash) {
        let sendDt = saved.getSaved(hash);
        if (this.clients[hash]) {
            this.destroyClient(hash);
            saved.removeSaved(hash)
        }

        return { title: sendDt.name, infoHash: hash, status: true, data: sendDt };
    }
}

module.exports = DownloadTorrent;

// const downloadtorrent = new DownloadTorrent();

// async function downloads() {
//     await downloadtorrent.download({
//         "name": "Sintel",
//         "infoHash": "08ada5a7a6183aae1e09d831df6748d566095a10",
//         "savein": "D:\\Downloads",
//         "magnet": "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F",
//         "length": 129302391
//       });
// }
// downloads();