const CACHE_NAME = 'academia-v2';

const urlsToCache = [
    './index.html',
    './bateria-vip.html',
    './painel-admin.html',
    './manifest.json'
];


/* =========================================
   INSTALAÇÃO
   ========================================= */

self.addEventListener('install', event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(urlsToCache);

            })

    );

});


/* =========================================
   ATIVAR NOVA VERSÃO
   ========================================= */

self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (
                            cacheName !== CACHE_NAME
                        ) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================
   REQUISIÇÕES
   ========================================= */

self.addEventListener('fetch', event => {

    /*
     * HTML SEMPRE TENTA BUSCAR A VERSÃO
     * MAIS NOVA NO SERVIDOR.
     *
     * Isso é importante para que o F5
     * não entregue um index.html antigo.
     */

    if (
        event.request.method === 'GET' &&
        (
            event.request.destination === 'document' ||
            event.request.url.endsWith('.html')
        )
    ) {

        event.respondWith(

            fetch(event.request)
                .then(response => {

                    return response;

                })
                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

        return;

    }


    /*
     * Para os demais arquivos:
     * tenta cache primeiro.
     */

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                return (
                    response ||
                    fetch(event.request)
                );

            })

    );

});
