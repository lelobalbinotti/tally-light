"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const obs_websocket_js_1 = __importDefault(require("obs-websocket-js"));
const Channel_1 = __importDefault(require("../../domain/Channel"));
const reconnectTimeoutMs = 1000;
// uses obs-websockets
// @see https://github.com/Palakis/obs-websocket
class ObsConnector {
    constructor(configuration, communicator) {
        // tracks which scenes are embedded into other scenes
        this.embeddedScenes = {};
        this.reconnectTimeout = null;
        this.connected = false;
        this.previewScenes = [];
        this.programScenes = [];
        this.isStreaming = false;
        this.isRecording = false;
        this.configuration = configuration;
        this.communicator = communicator;
    }
    connect() {
        this.obs = new obs_websocket_js_1.default();
        // @ts-ignore https://github.com/haganbmj/obs-websocket-js/issues/203
        this.obs.on('error', err => {
            console.error("obs socket error:", err);
        });
        this.obs.on('SwitchScenes', data => {
            // console.debug('SwitchScenes', data)
            this.notifyProgramChanged([data["scene-name"]]);
        });
        this.obs.on('ScenesChanged', data => {
            // console.debug('ScenesChanged', data)
            this.updateScenes();
        });
        this.obs.on('SceneItemRemoved', data => {
            // console.debug('ScenesChanged', data)
            this.updateScenes();
        });
        this.obs.on('SceneItemAdded', data => {
            // console.debug('ScenesChanged', data)
            this.updateScenes();
        });
        this.obs.on('SceneItemVisibilityChanged', data => {
            // console.debug('ScenesChanged', data)
            this.updateScenes();
        });
        this.obs.on('SceneCollectionChanged', data => {
            // console.debug('SceneCollectionChanged', data)
            this.updateScenes();
        });
        this.obs.on('SceneCollectionListChanged', data => {
            // console.debug('SceneCollectionListChanged', data)
            this.updateScenes();
        });
        this.obs.on('TransitionBegin', data => {
            // console.debug('TransitionBegin', data)
            this.notifyProgramChanged([data["from-scene"], data["to-scene"]].filter(scene => scene /* remove non-truthy values */));
        });
        this.obs.on('TransitionEnd', data => {
            // console.debug('TransitionEnd', data)
            this.notifyProgramChanged([data["to-scene"]]);
        });
        this.obs.on('PreviewSceneChanged', data => {
            // console.debug('PreviewSceneChanged', data)
            this.notifyPreviewChanged([data["scene-name"]]);
        });
        this.obs.on('StudioModeSwitched', data => {
            // console.debug('StudioModeSwitched', data)
            if (data["new-state"]) {
                // if: switched INTO studio mode
                this.updatePreviewScene();
            }
            else {
                // if: switched OUT OF studio mode
                this.previewScenes = [];
                this.notifyChanged();
            }
        });
        this.obs.on('StreamStarting', data => {
            // console.debug('StreamStarted', data)
            this.isStreaming = true;
            this.notifyChanged();
        });
        this.obs.on('StreamStopped', data => {
            // console.debug('StreamStopped', data)
            this.isStreaming = false;
            this.notifyChanged();
        });
        this.obs.on('RecordingStarting', data => {
            // console.debug('RecordingStarting', data)
            this.isRecording = true;
            this.notifyChanged();
        });
        this.obs.on('RecordingStopped', data => {
            // console.debug('RecordingStopped', data)
            this.isRecording = false;
            this.notifyChanged();
        });
        this.obs.on('RecordingPaused', data => {
            // console.debug('RecordingPaused', data)
            this.isRecording = false;
            this.notifyChanged();
        });
        this.obs.on('RecordingResumed', data => {
            // console.debug('RecordingResumed', data)
            this.isRecording = true;
            this.notifyChanged();
        });
        this.obs.on('StreamStatus', data => {
            this.isStreaming = data.streaming;
            this.isRecording = data.recording;
            this.notifyChanged();
        });
        const connect = () => {
            if (!this.obs) {
                return;
            }
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }
            const targetIp = this.configuration.getIp().toString();
            const targetPort = this.configuration.getPort().toNumber();
            try {
                const obsBridge = require('../../../../../src/obs_bridge');
                obsBridge.setTarget(targetIp, targetPort);
                if (obsBridge && typeof obsBridge.isObsConnected === 'function' && !obsBridge.isObsConnected()) {
                    if (this.connected !== false) {
                        this.connected = false;
                        this.previewScenes = [];
                        this.programScenes = [];
                        this.communicator.notifyMixerIsDisconnected();
                    }
                    this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs);
                    return;
                }
            } catch (e) {}

            console.log(`Connecting to internal OBS bridge at 127.0.0.1:4444 (Target: ${targetIp}:${targetPort})`);
            this.obs.connect({ address: '127.0.0.1:4444' }).then(() => {
                var _a;
                this.connected = true;
                this.communicator.notifyMixerIsConnected();
                this.updateScenes();
                this.updatePreviewScene();
                console.log("Connected to OBS");
                (_a = this.obs) === null || _a === void 0 ? void 0 : _a.on('ConnectionClosed', () => {
                    var _a;
                    this.connected = false;
                    this.previewScenes = [];
                    this.programScenes = [];
                    this.communicator.notifyMixerIsDisconnected();
                    (_a = this.obs) === null || _a === void 0 ? void 0 : _a.removeAllListeners('ConnectionClosed');
                    console.log("[vTally] Conexão com OBS finalizada");
                    this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs);
                });
            }).catch(err => {
                this.connected = false;
                this.previewScenes = [];
                this.programScenes = [];
                this.communicator.notifyMixerIsDisconnected();
                this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs);
            });
        };
        connect();
        this.communicator.notifyProgramPreviewChanged(null, null);
    }
    updatePreviewScene() {
        var _a;
        (_a = this.obs) === null || _a === void 0 ? void 0 : _a.send("GetPreviewScene").then(data => {
            // console.debug("GetPreviewScene", data)
            this.notifyPreviewChanged([data.name]);
        }).catch(err => {
            // if studio mode is disabled we get an error and fail gracefully
        });
    }
    updateScenes() {
        var _a;
        (_a = this.obs) === null || _a === void 0 ? void 0 : _a.send("GetSceneList").then(data => {
            // console.debug("GetSceneList", data)
            this.updateEmbeddedScenes(data.scenes);
            this.communicator.notifyChannels(data.scenes.map(scene => new Channel_1.default(scene.name, scene.name)));
            if (data["current-scene"]) {
                this.notifyProgramChanged([data["current-scene"]]);
            }
        }).catch(err => {
            console.error(err);
            // @TODO
        });
    }
    // update the information which scenes are embedded into other scenes - so they can also get the right state
    updateEmbeddedScenes(scenes) {
        this.embeddedScenes = {};
        scenes.forEach(scene => {
            this.embeddedScenes[scene.name] = scene.sources.filter(source => source.type === "scene" && source.render === true).map(source => source.name);
        });
    }
    notifyProgramChanged(scenes) {
        this.programScenes = scenes;
        this.notifyChanged();
    }
    notifyPreviewChanged(scenes) {
        this.previewScenes = scenes;
        this.notifyChanged();
    }
    shouldProgramBeShownAsPreview() {
        const mode = this.configuration.getLiveMode();
        if (mode === "always") {
            return false;
        }
        else if (mode === "record") {
            return !this.isRecording;
        }
        else if (mode === "stream") {
            return !this.isStreaming;
        }
        else if (mode === "streamOrRecord") {
            return !this.isStreaming && !this.isRecording;
        }
        else {
            ((_) => { })(mode); // if typescript complains about this, we forgot a case
        }
    }
    notifyChanged() {
        let programs = [];
        this.programScenes.forEach(scene => {
            programs.push(scene);
            programs.push(...(this.embeddedScenes[scene] || []));
        });
        let previews = [];
        if (this.shouldProgramBeShownAsPreview()) {
            previews = programs;
            programs = [];
        }
        else {
            this.previewScenes.forEach(scene => {
                previews.push(scene);
                previews.push(...(this.embeddedScenes[scene] || []));
            });
        }
        this.communicator.notifyProgramPreviewChanged(programs, previews);
    }
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.obs) {
            this.obs.removeAllListeners('ConnectionClosed');
            this.obs.disconnect();
        }
    }
    isConnected() {
        return this.obs !== undefined && this.connected;
    }
}
ObsConnector.ID = "obs";
exports.default = ObsConnector;
