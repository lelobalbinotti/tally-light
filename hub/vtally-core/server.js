"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// set NODE_ENV from argument to enable portability to windows
const yargs_1 = __importDefault(require("yargs"));
const TallyContainer_1 = __importDefault(require("./tally/TallyContainer"));
const UdpTallyDriver_1 = __importDefault(require("./tally/UdpTallyDriver"));
const AppConfiguration_1 = require("./lib/AppConfiguration");
const MixerDriver_1 = require("./lib/MixerDriver");
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const SocketAwareEvent_1 = require("./lib/SocketAwareEvent");
const ServerEventEmitter_1 = __importDefault(require("./lib/ServerEventEmitter"));
const AppConfigurationPersistence_1 = __importDefault(require("./lib/AppConfigurationPersistence"));
const AtemConfiguration_1 = __importDefault(require("./mixer/atem/AtemConfiguration"));
const VmixConfiguration_1 = __importDefault(require("./mixer/vmix/VmixConfiguration"));
const ObsConfiguration_1 = __importDefault(require("./mixer/obs/ObsConfiguration"));
const RolandV8HDConfiguration_1 = __importDefault(require("./mixer/rolandV8HD/RolandV8HDConfiguration"));
const RolandV60HDConfiguration_1 = __importDefault(require("./mixer/rolandV60HD/RolandV60HDConfiguration"));
const MockConfiguration_1 = __importDefault(require("./mixer/mock/MockConfiguration"));
const TestConnector_1 = __importDefault(require("./mixer/test/TestConnector"));
const TestConfiguration_1 = __importDefault(require("./mixer/test/TestConfiguration"));
const WebTallyDriver_1 = __importDefault(require("./tally/WebTallyDriver"));
const TallyConfiguration_1 = require("./tally/TallyConfiguration");
const NodeMcuConnector_1 = __importDefault(require("./flasher/NodeMcuConnector"));
const argv = yargs_1.default.argv;
if (argv.env !== undefined) {
    // @ts-ignore @TODO: setting the env is not nice, but the easiest way to be cross-platform compatible
    // @see https://github.com/wifi-tally/wifi-tally/issues/18
    process.env.NODE_ENV = argv.env;
}
if (argv['with-test'] !== undefined) {
    process.env.HUB_WITH_TEST = "true";
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const server = new http_1.Server(app);
const io = (0, socket_io_1.default)(server);
const myEmitter = new ServerEventEmitter_1.default();
myEmitter.setMaxListeners(99);
const myConfiguration = new AppConfiguration_1.AppConfiguration(myEmitter);
if (myConfiguration.isTest()) {
    console.log("Starting test environment");
    myConfiguration.setMixerSelection(TestConnector_1.default.ID);
    myConfiguration.setTallyTimeoutMissing(1000);
    myConfiguration.setTallyTimeoutDisconnected(3000);
}
else {
    new AppConfigurationPersistence_1.default(myConfiguration, myEmitter);
}
const myTallyContainer = new TallyContainer_1.default(myConfiguration, myEmitter);
new UdpTallyDriver_1.default(myConfiguration, myTallyContainer);
const myWebTallyDriver = new WebTallyDriver_1.default(myConfiguration, myTallyContainer);
const myMixerDriver = new MixerDriver_1.MixerDriver(myConfiguration, myEmitter);
const myNodeMcuConnector = new NodeMcuConnector_1.default();
// log stuff
myEmitter.on('tally.logged', ({ tally, log }) => {
    let fn = console.info;
    if (log.isError()) {
        fn = console.error;
    }
    else if (log.isWarning()) {
        fn = console.warn;
    }
    const localTimestamp = new Date().toLocaleString('pt-BR');
    const logLine = `[${localTimestamp}] [${tally.name}] ${log.message}`;
    fn(logLine);
    try {
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join('c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally', 'vtally-events.log');
        fs.appendFileSync(logFile, logLine + '\r\n', 'utf-8');
    } catch (e) {}
});
myEmitter.on('program.changed', ({ programs, previews }) => {
    console.info("Program/Preview was changed to ", programs, previews);
});
// socket.io server
io.on('connection', (socket) => {
    socket.setMaxListeners(99);
    const mixerEvents = [
        // @TODO: use event objects instead of repeating the same structure again and again
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'mixer.connected', socket, (socket) => {
            socket.emit('mixer.state', {
                isConnected: true
            });
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'mixer.disconnected', socket, (socket) => {
            socket.emit('mixer.state', {
                isConnected: false
            });
        }),
    ];
    socket.on('events.mixer.subscribe', () => {
        mixerEvents.forEach(pipe => pipe.register());
        socket.emit('mixer.state', {
            isConnected: myMixerDriver.isConnected()
        });
    });
    socket.on('events.mixer.unsubscribe', () => {
        // @TODO: not used yet
        mixerEvents.forEach(pipe => pipe.unregister());
    });
    const programEvents = [
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'program.changed', socket, (socket, { programs, previews }) => {
            socket.emit('program.state', {
                programs: programs,
                previews: previews,
            });
        })
    ];
    socket.on('events.program.subscribe', () => {
        programEvents.forEach(pipe => pipe.register());
        socket.emit('program.state', {
            programs: myMixerDriver.getCurrentPrograms(),
            previews: myMixerDriver.getCurrentPreviews(),
        });
    });
    socket.on('events.program.unsubscribe', () => {
        // @TODO: not used yet
        programEvents.forEach(pipe => pipe.unregister());
    });
    const configEvents = [
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.atem', socket, (socket, atemConfiguration) => {
            socket.emit('config.state.atem', atemConfiguration.toJson());
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.mock', socket, (socket, mockConfiguration) => {
            socket.emit('config.state.mock', mockConfiguration.toJson());
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.obs', socket, (socket, obsConfiguration) => {
            socket.emit('config.state.obs', obsConfiguration.toJson());
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.vmix', socket, (socket, vmixConfiguration) => {
            socket.emit('config.state.vmix', vmixConfiguration.toJson());
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.tallyconfig', socket, (socket, tallyConfiguration) => {
            socket.emit('config.state.tallyconfig', tallyConfiguration.toJson());
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.mixer', socket, (socket, mixerName) => {
            socket.emit('config.state.mixer', { mixerName, allowedMixers: MixerDriver_1.MixerDriver.getAllowedMixers(myConfiguration.isDev(), myConfiguration.isTest()) });
        }),
    ];
    socket.on('events.config.subscribe', () => {
        configEvents.forEach(pipe => pipe.register());
        socket.emit('config.state.atem', myConfiguration.getAtemConfiguration().toJson());
        socket.emit('config.state.mixer', { mixerName: myConfiguration.getMixerSelection() || "", allowedMixers: MixerDriver_1.MixerDriver.getAllowedMixers(myConfiguration.isDev(), myConfiguration.isTest()) });
        socket.emit('config.state.mock', myConfiguration.getMockConfiguration().toJson());
        socket.emit('config.state.obs', myConfiguration.getObsConfiguration().toJson());
        socket.emit('config.state.rolandV8HD', myConfiguration.getRolandV8HDConfiguration().toJson());
        socket.emit('config.state.rolandV60HD', myConfiguration.getRolandV60HDConfiguration().toJson());
        socket.emit('config.state.vmix', myConfiguration.getVmixConfiguration().toJson());
        socket.emit('config.state.tallyconfig', myConfiguration.getTallyConfiguration().toJson());
    });
    socket.on('events.program.unsubscribe', () => {
        // @TODO: not used yet
        configEvents.forEach(pipe => pipe.unregister());
    });
    const tallyEvents = [
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'tally.changed', socket, (socket) => {
            socket.emit('tally.state', { tallies: myTallyContainer.getTalliesAsJson() });
        }),
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'tally.removed', socket, (socket) => {
            socket.emit('tally.state', { tallies: myTallyContainer.getTalliesAsJson() });
        }),
    ];
    socket.on('events.tally.subscribe', () => {
        tallyEvents.forEach(pipe => pipe.register());
        socket.emit('tally.state', { tallies: myTallyContainer.getTalliesAsJson() });
    });
    socket.on('events.tally.unsubscribe', () => {
        // @TODO: not used yet
        tallyEvents.forEach(pipe => pipe.unregister());
    });
    socket.on('tally.patch', (tallyName, tallyType, channelId) => {
        myTallyContainer.patch(tallyName, tallyType, channelId);
    });
    socket.on('tally.highlight', (tallyName, tallyType) => {
        myTallyContainer.highlight(tallyName, tallyType);
    });
    socket.on('tally.remove', (tallyName, tallyType) => {
        myTallyContainer.remove(tallyName, tallyType);
    });
    socket.on('tally.create', (tallyName, channelId) => {
        myWebTallyDriver.create(tallyName, channelId);
    });
    socket.on('tally.settings', (tallyName, tallyType, settings) => {
        const configuration = new TallyConfiguration_1.TallyConfiguration();
        configuration.fromJson(settings);
        myTallyContainer.updateSettings(tallyName, tallyType, configuration);
    });
    socket.on('events.webTally.subscribe', tallyName => myWebTallyDriver.subscribe(tallyName, socket));
    socket.on('events.webTally.unsubscribe', tallyName => myWebTallyDriver.unsubscribe(tallyName, socket));
    const tallyLogEvents = [
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'tally.logged', socket, (socket, { tally, log }) => {
            socket.emit('tally.log', { tallyId: tally.getId(), log: log.toJson() });
        }),
    ];
    socket.on('events.tallyLog.subscribe', () => {
        tallyLogEvents.forEach(pipe => pipe.register());
        const logs = myTallyContainer.getTallies().map(tally => {
            return {
                tallyId: tally.getId(),
                logs: tally.getLogs().map(log => log.toJson())
            };
        });
        socket.emit('tally.log.state', logs);
    });
    socket.on('events.tallyLog.unsubscribe', () => {
        // @TODO: not used yet
        tallyLogEvents.forEach(pipe => pipe.unregister());
    });
    const channelEvents = [
        new SocketAwareEvent_1.SocketAwareEvent(myEmitter, 'config.changed.channels', socket, (socket, channels) => {
            socket.emit('channel.state', { channels: channels.map(channel => channel.toJson()) });
        }),
    ];
    socket.on('events.channel.subscribe', () => {
        channelEvents.forEach(pipe => pipe.register());
        socket.emit('channel.state', { channels: myConfiguration.getChannelsAsJson() });
    });
    socket.on('events.channel.unsubscribe', () => {
        // @TODO: not used yet
        channelEvents.forEach(pipe => pipe.unregister());
    });
    socket.on('config.change.atem', (newAtemConfiguration, newMixerName) => {
        const atem = new AtemConfiguration_1.default();
        atem.fromJson(newAtemConfiguration);
        myConfiguration.setAtemConfiguration(atem);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.mock', (newMockConfiguration, newMixerName) => {
        const mock = new MockConfiguration_1.default();
        mock.fromJson(newMockConfiguration);
        myConfiguration.setMockConfiguration(mock);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.null', newMixerName => {
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.obs', (newObsConfiguration, newMixerName) => {
        const obs = new ObsConfiguration_1.default();
        obs.fromJson(newObsConfiguration);
        myConfiguration.setObsConfiguration(obs);
        try {
            const obsBridge = require('../../../src/obs_bridge');
            obsBridge.setTarget(obs.getIp().toString(), obs.getPort().toNumber());
        } catch (e) {}
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.rolandV8HD', (newRolandV8HDConfiguration, newMixerName) => {
        const rolandV8HD = new RolandV8HDConfiguration_1.default();
        rolandV8HD.fromJson(newRolandV8HDConfiguration);
        myConfiguration.setRolandV8HDConfiguration(rolandV8HD);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.rolandV60HD', (newRolandV60HDConfiguration, newMixerName) => {
        const rolandV60HD = new RolandV60HDConfiguration_1.default();
        rolandV60HD.fromJson(newRolandV60HDConfiguration);
        myConfiguration.setRolandV60HDConfiguration(rolandV60HD);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.test', (newTestConfiguration, newMixerName) => {
        const test = new TestConfiguration_1.default();
        test.fromJson(newTestConfiguration);
        myConfiguration.setTestConfiguration(test);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.vmix', (newVmixConfiguration, newMixerName) => {
        const vmix = new VmixConfiguration_1.default();
        vmix.fromJson(newVmixConfiguration);
        myConfiguration.setVmixConfiguration(vmix);
        if (newMixerName) {
            myConfiguration.setMixerSelection(newMixerName);
        }
    });
    socket.on('config.change.tallyconfig', (conf) => {
        const configuration = new TallyConfiguration_1.DefaultTallyConfiguration();
        configuration.fromJson(conf);
        myConfiguration.setTallyConfiguration(configuration);
    });
    socket.on('flasher.device.get', () => {
        myNodeMcuConnector.getDevice().then(device => {
            socket.emit('flasher.device', device.toJson());
        });
    });
    socket.on('flasher.settingsIni', (path, settingsIniString) => {
        myNodeMcuConnector.writeTallySettingsIni(path, settingsIniString, (state) => {
            socket.emit('flasher.settingsIni.progress', state);
        });
    });
    socket.on('flasher.program', (path) => {
        myNodeMcuConnector.program(path, (state) => {
            socket.emit('flasher.program.progress', state);
        });
    });
});
if (myConfiguration.isDev()) {
    const proxyPort = process.env.DEV_PROXY_PORT || 3001;
    console.info(`Serving frontend via proxy. The React dev server is expected to run on port ${proxyPort}.`);
    app.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: `http://localhost:${proxyPort}`,
        changeOrigin: true,
        ws: true,
        onError: (err, req, res) => {
            if (typeof res.writeHead === "function") {
                res.writeHead(500, {
                    'Content-Type': 'text/plain',
                });
                if (err && err.code === "ECONNREFUSED") {
                    res.end(`Could not connect to server on http://localhost:${proxyPort}. Is the react dev server running?\nTo fix it run:\n    npm run start:frontend`);
                }
                else {
                    res.end("The proxy reported an error: \n" + err.toString());
                }
            }
        },
    }));
}
else {
    const publicDirName = "frontend";
    console.info(`Serving frontend from directory ${publicDirName}`);

    // Rotas da Interface de Configuração e API Tally
    try {
        const tallyApi = require('../../../src/tally_api');
        const obsBridge = require('../../../src/obs_bridge');
        try {
            const currentObs = myConfiguration.getObsConfiguration();
            if (currentObs) {
                obsBridge.setTarget(currentObs.getIp().toString(), currentObs.getPort().toNumber());
            }
        } catch (e) {}
        tallyApi.setupRoutes(app, obsBridge, myTallyContainer);
    } catch (e) {
        console.error('Erro ao registrar rotas do Tally API:', e);
    }

    app.use('/', express_1.default.static(`${__dirname}/${publicDirName}/`));
    // fetch all route to allow deep-links into the application
    app.get('*', function (req, res) {
        res.sendFile(`${__dirname}/${publicDirName}/index.html`);
    });
}
server.listen(myConfiguration.getHttpPort(), () => {
    console.log(`Web Server available on http://localhost:${myConfiguration.getHttpPort()}`);
});
