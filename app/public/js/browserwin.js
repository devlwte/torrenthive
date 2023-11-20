class Saves {
    constructor() {
        this.savesBrowsers = [];
    }

    saveData(browserWinId, data) {
        const existingIndex = this.savesBrowsers.findIndex(item => item.id === browserWinId);

        if (existingIndex !== -1) {
            // Si ya existe, actualiza el elemento
            this.savesBrowsers[existingIndex] = data;
        } else {
            // Si no existe, agrega uno nuevo
            this.savesBrowsers.push(data);
        }
    }

    getData(browserWinId) {
        return this.savesBrowsers.find(item => item.id === browserWinId) || null;
    }

    getAllData() {
        return this.savesBrowsers;
    }

    deleteBrowserWin(browserWinId) {
        const indexToDelete = this.savesBrowsers.findIndex(item => item.id === browserWinId);
        if (indexToDelete !== -1) {
            this.savesBrowsers.splice(indexToDelete, 1);
            return true;
        }
        return false;
    }

    updateBrowserWin(options) {
        const { id } = options;
        const existingWindow = this.savesBrowsers.find(item => item.id === id);

        if (existingWindow) {
            Object.assign(existingWindow, options);
            return true;
        }

        return false; // La ventana no se encontró, no se pudo actualizar
    }
}

class Resizable {
    constructor(elmOrElement, callback = false) {
        const element =
            elmOrElement instanceof Element
                ? elmOrElement
                : document.querySelector(elmOrElement);
        this.div = element;
        this.resizing = false;
        this.initialX = 0;
        this.initialY = 0;
        this.resizeDirection = null;

        // Bind events to the instance

        this.resizable(this.div);
        this.initResize = this.initResize.bind(this);
        this.resize = this.resize.bind(this);
        this.stopResize = this.stopResize.bind(this);

        // Attach event listeners
        this.div.addEventListener('mousedown', this.initResize);

        this.eventResize = callback;
    }

    resizable(ventana) {
        const handles = ["top", "right", "bottom", "left", "top-left", "top-right", "bottom-left", "bottom-right"];

        handles.forEach((handle) => {
            const resizeHandle = document.createElement("div");
            resizeHandle.classList.add("resize-handle", `resize-handle-${handle}`);
            resizeHandle.setAttribute("data-direction", handle);
            ventana.appendChild(resizeHandle);
        });
    }

    initResize(e) {
        this.resizing = true;
        this.initialX = e.clientX;
        this.initialY = e.clientY;
        this.resizeDirection = e.target.dataset.direction;

        document.addEventListener('mousemove', this.resize);
        document.addEventListener('mouseup', this.stopResize);
    }

    resize(e) {
        if (this.resizing) {

            if (this.eventResize) {
                this.eventResize();
            }

            const deltaX = e.clientX - this.initialX;
            const deltaY = e.clientY - this.initialY;
            const rect = this.div.getBoundingClientRect();

            switch (this.resizeDirection) {
                case 'top':
                    this.div.style.height = rect.height - deltaY + 'px';
                    this.div.style.top = rect.top + deltaY + 'px';
                    this.veryWebView();
                    break;
                case 'bottom':
                    this.div.style.height = rect.height + deltaY + 'px';
                    this.veryWebView();
                    break;
                case 'left':
                    this.div.style.width = rect.width - deltaX + 'px';
                    this.div.style.left = rect.left + deltaX + 'px';
                    this.veryWebView();
                    break;
                case 'right':
                    this.div.style.width = rect.width + deltaX + 'px';
                    this.veryWebView();
                    break;
                case 'top-left':
                    this.div.style.width = rect.width - deltaX + 'px';
                    this.div.style.left = rect.left + deltaX + 'px';
                    this.div.style.height = rect.height - deltaY + 'px';
                    this.div.style.top = rect.top + deltaY + 'px';
                    this.veryWebView();
                    break;
                case 'top-right':
                    this.div.style.width = rect.width + deltaX + 'px';
                    this.div.style.height = rect.height - deltaY + 'px';
                    this.div.style.top = rect.top + deltaY + 'px';
                    this.veryWebView();
                    break;
                case 'bottom-left':
                    this.div.style.width = rect.width - deltaX + 'px';
                    this.div.style.left = rect.left + deltaX + 'px';
                    this.div.style.height = rect.height + deltaY + 'px';
                    this.veryWebView();
                    break;
                case 'bottom-right':
                    this.div.style.width = rect.width + deltaX + 'px';
                    this.div.style.height = rect.height + deltaY + 'px';
                    this.veryWebView();
                    break;
            }

            this.initialX = e.clientX;
            this.initialY = e.clientY;
        }
    }

    stopResize() {
        this.resizing = false;
        this.resizeDirection = null;
        this.veryWebView(false);
        document.removeEventListener('mousemove', this.resize);
        document.removeEventListener('mouseup', this.stopResize);

    }

    veryWebView(type = true) {
        // verificar webview
        if (this.div.querySelector(".webview")) {
            const elm = this.whatStr(this.div.querySelector(".webview"));
            var estilo = window.getComputedStyle(elm);
            var pointerEventsValue = estilo.getPropertyValue('pointer-events');
            if (type) {
                if (pointerEventsValue !== 'none') {
                    elm.style.pointerEvents = 'none';
                }
            } else {
                if (pointerEventsValue == 'none') {
                    elm.style.pointerEvents = '';
                }
            }

        }

        // verificar thtml
        if (this.div.querySelector(".browser_thtml")) {
            const elm = this.whatStr(this.div.querySelector(".browser_thtml"));
            var estilo = window.getComputedStyle(elm);
            var pointerEventsValue = estilo.getPropertyValue('pointer-events');
            if (type) {
                if (pointerEventsValue !== 'none') {
                    elm.style.pointerEvents = 'none';
                }
            } else {
                if (pointerEventsValue == 'none') {
                    elm.style.pointerEvents = '';
                }
            }

        }
    }

    whatStr(selector) {
        return typeof selector === 'string' ? document.querySelector(selector) : selector instanceof Element ? selector : false;
    }
}

class EventManager {
    // Definir constantes para nombres de eventos
    static EVENT_FINISH_LOAD = 'finish-load';
    static EVENT_CLOSE = 'close';

    constructor() {
        this.events = {};
    }

    on(id, eventName, handler) {
        if (!this.events[id]) {
            this.events[id] = {};
        }
        this.events[id][eventName] = handler;

    }

    trigger(id, eventName, ...args) {
        if (this.events[id]) {
            if (this.events[id][eventName]) {
                this.events[id][eventName](...args);
            }
        }
    }

    remove(id) {
        if (this.events[id]) {
            delete this.events[id];
        }
    }
}

class NewBrowserWin {
    static saves = new Saves();
    static eventManager = new EventManager();
    constructor(options) {
        const defaultOptions = {
            id: 'default',
            title: 'Browser Window',
            width: 800,
            height: 600,
            isVisible: false,
            state: true,
            navegate: false,
            icon: "/lib/apps/iconos/torrenthive.svg",
            reload: false
        };

        const { id, title, width, height, isVisible, state, navegate, icon, reload } = { ...defaultOptions, ...options };



        this.id = id;
        this.title = title;
        this.width = width;
        this.height = height;
        this.isVisible = isVisible;
        this.state = state;
        this.navegate = navegate;
        this.webview = false;
        this.icon = icon;

        if (!NewBrowserWin.saves.getData(id)) {
            this.html = this.createHTML();
            NewBrowserWin.saves.saveData(options.id, { id, title, width, height, isVisible, state, navegate, icon, webviews: this.webview, html: this.html });
            // todas las ventanas por igual
            this.resetzindex();
        } else {
            if (reload) {
                this.setupUpdate(id);
            }
        }




    }

    setupNew() {
        this.html = this.createHTML();
        NewBrowserWin.saves.saveData(options.id, { id, title, width, height, isVisible, state, navegate, icon, webviews: this.webview, html: this.html });
        // todas las ventanas por igual
        this.resetzindex();
    }

    setupUpdate(id) {
        const ventana = NewBrowserWin.saves.getData(id);
        this.resetzindex(id);
        this.triggerEvent(id, "finish-load", ventana.html);
    }

    on(eventName, callback) {
        NewBrowserWin.eventManager.on(this.id, eventName, callback);
    }

    triggerEvent(id, eventName, ...args) {
        NewBrowserWin.eventManager.trigger(id, eventName, ...args);
    }

    removeEvent(eventName) {
        if (eventName === "all") {
            let events = Object.keys(NewBrowserWin.eventManager.events);
            for (const ev of events) {
                NewBrowserWin.eventManager.remove(ev);
            }
            return;
        }
        NewBrowserWin.eventManager.remove(eventName);
    }

    resetzindex(id) {
        // todas las ventanas por igual
        let allwin = NewBrowserWin.saves.getAllData();
        for (const win of allwin) {
            win.html.css({ "z-index": 9999 });
        }

        if (id) {
            const getwin = NewBrowserWin.saves.getData(id);
            getwin.html.css({ "z-index": 99999 });
        }
    }

    closeBrowser() {
        // remove browser
        const closewin = NewBrowserWin.saves.deleteBrowserWin(this.id);
        if (closewin) {
            // close ventana
            const dataventana = this.saveState(this.id, this.html);
            this.html.animate({ opacity: 0 }, 200, () => {
                this.html.remove();
            })

            // event close
            this.triggerEvent(this.id, "close", dataventana);

            // remove event
            // this.removeEvent("all");
        }
    }

    createHTML() {

        // crear ventana
        const $vent = $("<div>");

        // id
        $vent.attr("id", this.id);
        // class
        $vent.addClass("browser_win");
        $vent.attr("tabindex", 0);

        // thtml
        const $thtml = $("<div>");
        $thtml.addClass("browser_thtml");




        // barra
        const $barra = $("<div>");
        $barra.addClass("browser_barra");

        // icono y titulo
        const $icTi = $("<div>");
        $icTi.addClass("browser_icono_title");

        // icono
        const $icono = $("<div>");
        $icono.addClass("browser_icono");

        // icono url
        const icons = $("<img>");
        icons.attr("src", this.icon);
        $icono.append(icons);

        $icTi.append($icono);

        // icono
        const $title = $("<div>");
        $title.addClass("browser_title");

        $title.text(this.title);

        $icTi.append($title);

        // agregar a barra icono y titulo
        $barra.append($icTi);

        // others actions
        const $others = $("<div>");
        $others.addClass("browser_others");

        // minimize

        // close y otros
        const $close_and_others = $("<div>");
        $close_and_others.addClass("browser_close_and_others");

        // close
        const $close = $("<div>")
        $close.addClass("browser_close icon-close");
        $close_and_others.append($close);

        $close.on("click", () => {
            this.closeBrowser();
        });

        $others.append($close_and_others);

        // add other to barra
        $barra.append($others);

        // agregar barra a ventana
        $thtml.append($barra);

        // body
        const $tbody = $("<div>");
        $tbody.addClass("browser_tbody");

        if (this.navegate) {
            const webviews = $("<webview></webview>");
            webviews.addClass("browser_webview");

            webviews.attr("partition", "persist:github");
            webviews.attr("nodeintegration", "yes")
            webviews.attr("src", this.navegate);

            webviews.on('focus', function (event) {
                this.resetzindex(this.id);
            }.bind(this));

            webviews.on('dom-ready', async function () {

            })


            webviews.on("did-finish-load", () => {

            });


            setTimeout(() => {
                $tbody.append(webviews);
            }, 1000);
        }

        $thtml.append($tbody);

        // add thtml
        $vent.append($thtml);
        
        // focus
        $vent.on('focus', function (event) {
            this.resetzindex(this.id);
        }.bind(this));



        new Resizable($vent[0])


        // Configurar un observador de mutaciones
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.triggerEvent(this.id, "finish-load", $vent);
                    observer.disconnect();
                }
            });
        });
        observer.observe(document.body, { childList: true });

        // add dom
        $("body").append($vent);

        this.draggable($vent);

        // load state
        this.loadState(this.id, $vent, this.width, this.height);

        return $vent;
    }

    saveState(id, $elm) {
        const offset = $elm.offset();
        const width = $elm.width();
        const height = $elm.height();
        let cordenadas = { x: offset.left, y: offset.top, width, height };

        // save
        if (this.state) {
            const storage = localStorage;
            storage.setItem(id, JSON.stringify(cordenadas));
        }

        return { id, ...cordenadas }
    }
    loadState(id, $elm, w, h) {
        const storage = localStorage;
        const windowWidth = $(window).width()
        const windowHeight = $(window).height();

        if (!storage.getItem(id)) {

            $elm.css({
                width: w,
                height: h
            });

            // alto y ancho de body
            const wbody = $(window).width() / 2;
            const hbody = $(window).height() / 2;


            // alto y ancho del elemento
            const welm = $elm.width() / 2;
            const helm = $elm.height() / 2;


            const alto = Math.max(hbody - helm, 0);
            const ancho = Math.max(wbody - welm, 0);

            $elm.css({
                top: alto,
                left: ancho
            });

        } else {
            let info = this.isJson(storage.getItem(id));
            if (info) {
                const ventanaWidth = parseInt(info.width, 10);
                const ventanaHeight = parseInt(info.height, 10);

                // Asegurarse de que las coordenadas no se desborden
                let left = parseInt(info.x, 10);
                let top = parseInt(info.y, 10);

                // Evitar desbordamiento a la derecha
                left = Math.min(left, windowWidth - ventanaWidth);

                // Evitar desbordamiento hacia abajo
                top = Math.min(top, windowHeight - ventanaHeight);

                // Asegurarse de que las coordenadas no sean negativas
                left = Math.max(0, left);
                top = Math.max(0, top);

                $elm.css({
                    left,
                    top,
                    width: ventanaWidth,
                    height: ventanaHeight
                });

            }
        }

    }

    draggable(windowElement) {
        let isDragging = false;
        let offsetX, offsetY;

        let $barraTop = windowElement.find('.browser_barra');

        $barraTop.on('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offset().left;
            offsetY = e.clientY - windowElement.offset().top;
        });

        $(document).on('mousemove', (e) => {
            if (isDragging) {
                let left = e.clientX - offsetX;
                let top = e.clientY - offsetY;

                windowElement.css({
                    left: left + 'px',
                    top: top + 'px'
                });

                let width = windowElement.width();
                let height = windowElement.height();

                // code.trigger("move", id, { left, top, width, height });
            }
        });

        $(document).on('mouseup', () => {
            isDragging = false;
        });
    }

    normalizeFileName(fileName) {
        let normalized = fileName.replace(/[.\s]/g, '_');
        normalized = normalized.replace(/[^a-zA-Z0-9_]/g, '');
        return normalized;
    }

    isJson(cadena) {
        if (
            /^[\],:{}\s]*$/.test(
                cadena
                    .replace(/\\["\\\/bfnrtu]/g, "@")
                    .replace(
                        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                        "]"
                    )
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
            )
        ) {
            return JSON.parse(cadena);
        } else {
            return false;
        }
    }
}



class BrowserWin extends NewBrowserWin {
    constructor(options) {
        super(options);
    }

    static getAll() {
        // Devolver datos o realizar operaciones globales aquí
        return NewBrowserWin.saves.getAllData();
    }

    static normalizeFileName(fileName) {
        let normalized = fileName.replace(/[.\s]/g, '_');
        normalized = normalized.replace(/[^a-zA-Z0-9_]/g, '');
        return normalized;
    }
}