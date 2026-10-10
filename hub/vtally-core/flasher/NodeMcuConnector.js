"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemcu_tool_1 = __importDefault(require("nodemcu-tool"));
const TallyDevice_1 = __importDefault(require("./TallyDevice"));
const TallySettingsIni_1 = __importDefault(require("./TallySettingsIni"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const fs_1 = require("fs");
const baudRate = 115200;
const fileName = "tally-settings.ini";
let mutex = false;
const tryToAquireMutex = () => {
    if (!mutex) {
        mutex = true;
        return true;
    }
    else {
        return false;
    }
};
class NodeMcuConnector {
    // injectable for easier testing
    constructor(nodemcu = nodemcu_tool_1.default) {
        this.nodemcu = nodemcu;
        this.nodemcu.onError((error) => {
            console.error(error);
        });
    }
    withMutex(fn) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const mutexAquired = tryToAquireMutex();
                if (mutexAquired) {
                    clearInterval(interval);
                    if (this.nodemcu.isConnected()) {
                        console.warn("Serial terminal was not closed by previous process.");
                        this.nodemcu.disconnect();
                    }
                    resolve(true);
                }
            }, 100);
        })
            .then(() => {
            return fn();
        })
            .finally(() => {
            mutex = false;
        });
    }
    static async getLocalFiles() {
        let dirName = __dirname + "/../../esp8266"; // path in release package
        const files = await fs_1.promises.readdir(dirName).catch(e => {
            dirName = __dirname + "/../../../tally/out"; // path during development
            return fs_1.promises.readdir(dirName);
        });
        console.debug(`Files from ${dirName} will be flashed.`);
        const filteredFiles = files.filter(file => file.endsWith(".lc") || file.endsWith(".lua"));
        return Promise.all(filteredFiles.map(async (file) => {
            const stats = await fs_1.promises.stat(dirName + "/" + file);
            return {
                fileName: file,
                filePath: `${dirName}/${file}`,
                fileSize: stats.size,
            };
        }));
    }
    static async doFilesNeedUpdate(filesOnNodemcu) {
        const localFiles = await NodeMcuConnector.getLocalFiles();
        return localFiles.some(localFile => {
            return filesOnNodemcu.every(nodeMcuFile => nodeMcuFile.name !== localFile.fileName || nodeMcuFile.size !== localFile.fileSize);
        });
    }
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    // gracefull connection that retries a few times
    async connect(path) {
        await this.nodemcu.connect(path, baudRate, false);
        // check connection does not always work the first time, so we try it multiple times if necessary
        let retries = 3;
        while (true) {
            try {
                return await this.nodemcu.checkConnection();
            }
            catch (e) {
                if (retries === 0) {
                    throw e;
                }
                await this.sleep(100);
            }
            retries--;
        }
    }
    async execute(idempotentCommand) {
        let retries = 3;
        while (true) {
            try {
                const foo = await this.nodemcu.execute(`${idempotentCommand}; print("ok")`);
                if (foo === null || !foo.response) {
                    throw new Error("Did not get a response for executing the command.");
                }
                if (foo.response.toString().includes("error")) {
                    throw new Error(foo.response.toString());
                }
                if (!foo.response.toString().includes("ok")) {
                    throw new Error(`response did not include an "ok": ${foo.response.toString()}`);
                }
                return foo;
            }
            catch (e) {
                if (retries === 0) {
                    throw e;
                }
                await this.sleep(100);
            }
            retries--;
        }
    }
    async getDevice() {
        const tallyDevice = new TallyDevice_1.default();
        const localFiles = await NodeMcuConnector.getLocalFiles();
        const updatePossible = localFiles.length > 0;
        if (!updatePossible) {
            tallyDevice.update = "not-available";
        }
        try {
            return await this.withMutex(async () => {
                const list = await this.nodemcu.listDevices();
                const device = list[0];
                if (device) {
                    tallyDevice.path = device.path;
                    tallyDevice.vendorId = device.vendorId;
                    tallyDevice.productId = device.productId;
                    await this.connect(device.path);
                    const deviceInfo = await this.nodemcu.deviceInfo();
                    tallyDevice.chipId = deviceInfo.chipID;
                    tallyDevice.flashId = deviceInfo.flashID;
                    tallyDevice.nodeMcuVersion = deviceInfo.version;
                    tallyDevice.nodeMcuModules = deviceInfo.modules;
                    const fsinfo = await this.nodemcu.fsinfo();
                    if (updatePossible) {
                        tallyDevice.update = await NodeMcuConnector.doFilesNeedUpdate(fsinfo.files) ? "updateable" : "up-to-date";
                    }
                    const settingsFileExists = fsinfo.files.some(file => file.name === fileName);
                    if (settingsFileExists) {
                        const res = await this.nodemcu.download(fileName);
                        tallyDevice.tallySettings = new TallySettingsIni_1.default(res.toString());
                    }
                }
                return tallyDevice;
            });
        }
        catch (e) {
            tallyDevice.errorMessage = e;
            return tallyDevice;
        }
        finally {
            if (this.nodemcu && this.nodemcu.isConnected()) {
                await this.nodemcu.disconnect();
            }
        }
    }
    async program(path, onProgress) {
        const files = await NodeMcuConnector.getLocalFiles();
        const progress = {
            inititalizeDone: false,
            connectionDone: false,
            filesUploaded: 0,
            filesTotal: files.length,
            rebootDone: false,
            allDone: false,
            error: false,
        };
        onProgress(progress);
        try {
            await this.withMutex(async () => {
                progress.inititalizeDone = true;
                onProgress(progress);
                await this.connect(path);
                progress.connectionDone = true;
                onProgress(progress);
                for (const file of files) {
                    await this.saveFileUpload(file.fileName, file.filePath);
                    progress.filesUploaded = progress.filesUploaded + 1;
                    onProgress(progress);
                }
                await this.hardReset(path);
                progress.rebootDone = true;
                onProgress(progress);
                progress.allDone = true;
                onProgress(progress);
            });
        }
        catch (e) {
            console.error(`programming failed because of: ${e}`);
            progress.error = true;
            onProgress(progress);
            return false;
        }
        finally {
            if (this.nodemcu && this.nodemcu.isConnected()) {
                this.nodemcu.disconnect();
            }
        }
    }
    async writeTallySettingsIni(path, settingsIniString, onProgress) {
        const settingsIni = new TallySettingsIni_1.default(settingsIniString);
        const progress = {
            tallyName: settingsIni.getTallyName(),
            inititalizeDone: false,
            connectionDone: false,
            uploadDone: false,
            rebootDone: false,
            allDone: false,
            error: false,
        };
        onProgress(progress);
        try {
            if (!settingsIni.getTallyName()) {
                throw new Error(`Exeptected ${fileName} to contain a tally.name, but it was empty.`);
            }
            if (!settingsIni.getStationSsid()) {
                throw new Error(`Exeptected ${fileName} to contain a station ssid, but it was empty.`);
            }
            if (!settingsIni.getHubIp()) {
                throw new Error(`Exeptected ${fileName} to contain a hub.ip name, but it was empty.`);
            }
            await this.withMutex(async () => {
                progress.inititalizeDone = true;
                onProgress(progress);
                await this.connect(path);
                progress.connectionDone = true;
                onProgress(progress);
                await this.saveContentUpload(fileName, settingsIniString);
                progress.uploadDone = true;
                onProgress(progress);
                await this.hardReset(path);
                progress.rebootDone = true;
                onProgress(progress);
                progress.allDone = true;
                onProgress(progress);
            });
            return true;
        }
        catch (e) {
            console.error(`${fileName} upload failed because of:`, e);
            progress.error = true;
            onProgress(progress);
            return false;
        }
        finally {
            if (this.nodemcu && this.nodemcu.isConnected()) {
                this.nodemcu.disconnect();
            }
        }
    }
    async hardReset(path) {
        await this.nodemcu.hardreset();
        await this.nodemcu.disconnect();
        await new Promise(resolve => { setTimeout(resolve, 1000); }); // sleep
        await this.connect(path);
        await new Promise(resolve => { setTimeout(resolve, 3000); }); // sleep
        const failTimeout = setTimeout(() => {
            throw new Error("Could not connect to NodeMCU after hardreset.");
        }, 10000);
        let rebootSuccess = false;
        while (!rebootSuccess) {
            try {
                await this.nodemcu.checkConnection();
                rebootSuccess = true;
            }
            catch (e) {
                rebootSuccess = false;
            }
        }
        clearTimeout(failTimeout);
    }
    /**
     * uploads content via nodemcu-tool
     *
     * @param filePath the file path on nodemcu
     * @param content the file content
     */
    async saveContentUpload(filePath, content) {
        const { path: tmpPath, cleanup: tmpCleanup } = await tmp_promise_1.default.file({});
        try {
            await fs_1.promises.writeFile(tmpPath, content);
            await this.saveFileUpload(filePath, tmpPath);
        }
        finally {
            tmpCleanup();
        }
    }
    /**
     * uploads a file via nodemcu-tool and does some verification
     *
     * @param remoteFilePath the file path on nodemcu
     * @param localFilePath the local file path
     */
    async saveFileUpload(remoteFilePath, localFilePath) {
        if (!this.nodemcu.isConnected()) {
            throw new Error("Expected to have an already established connection to NodeMCU, but did not.");
        }
        const copyFileName = remoteFilePath + ".swp";
        try {
            await this.nodemcu.upload(localFilePath, copyFileName, {}, () => { });
            await this.sleep(1000);
            const gotContent = await this.nodemcu.download(copyFileName);
            const localContent = await fs_1.promises.readFile(localFilePath).then(buffer => buffer.toString());
            if (gotContent.toString() !== localContent) {
                throw new Error(`Uploaded file does not match downloaded file. Expected file size of ${localContent.length}, but got ${gotContent.length}`);
            }
            // rename file
            await this.removeFileIfExists(remoteFilePath);
            await this.execute(`file.rename("${copyFileName}", "${remoteFilePath}")`);
        }
        finally {
            await this.removeFileIfExists(copyFileName);
        }
    }
    async removeFileIfExists(filePath) {
        return this.execute(`if file.exists("${filePath}") then file.remove("${filePath}") end`);
    }
}
exports.default = NodeMcuConnector;
