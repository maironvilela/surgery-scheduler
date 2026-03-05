// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'surgery-scheduler',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3000', // Porta onde o app vai rodar
            instances: '2',      // Usa todos os núcleos da CPU (modo cluster)
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};