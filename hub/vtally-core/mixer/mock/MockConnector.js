"use strict";
// a mock connector that generates random programs and previews
Object.defineProperty(exports, "__esModule", { value: true });
class MockConnector {
    constructor(configuration, communicator) {
        this.configuration = configuration;
        this.communicator = communicator;
        this.isActive = false;
    }
    connect() {
        console.log(`Simulating a mock video mixer with ${this.configuration.getChannelCount()} channels that changes programs every ${this.configuration.getTickTime()}ms`);
        this.isActive = true;
        this.communicator.notifyMixerIsConnected();
        this.communicator.notifyChannels(this.configuration.getChannels());
        const fn = () => {
            const mockCurrentPrograms = [Math.floor(Math.random() * (this.configuration.getChannelCount() + 1)).toString()];
            const mockCurrentPreviews = [Math.floor(Math.random() * (this.configuration.getChannelCount() + 1)).toString()];
            this.communicator.notifyProgramPreviewChanged(mockCurrentPrograms, mockCurrentPreviews);
        };
        this.intervalHandle = setInterval(fn, this.configuration.getTickTime());
        fn();
    }
    disconnect() {
        console.log("Stopping mock video mixer");
        this.isActive = false;
        this.communicator.notifyMixerIsDisconnected();
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
    isConnected() {
        return this.isActive;
    }
}
MockConnector.ID = "mock";
exports.default = MockConnector;
