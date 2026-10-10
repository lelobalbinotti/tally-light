"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultTallyConfiguration = exports.useVmixConfiguration = exports.useRolandV60HDConfiguration = exports.useRolandV8HDConfiguration = exports.useObsConfiguration = exports.useMockConfiguration = exports.useAtemConfiguration = exports.useAllowedMixersConfiguration = exports.useMixerNameConfiguration = void 0;
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const config_1 = __importDefault(require("./tracker/config"));
const configTracker = new config_1.default(useSocket_1.socket);
function useMixerNameConfiguration() {
    const [mixerName, setMixerName] = (0, react_1.useState)(configTracker.mixerName);
    const onChange = newMixerName => {
        setMixerName(newMixerName);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("mixer", onChange);
        return () => {
            // cleanup
            configTracker.off("mixer", onChange);
        };
    }, []);
    return mixerName;
}
exports.useMixerNameConfiguration = useMixerNameConfiguration;
function useAllowedMixersConfiguration() {
    const [allowedMixers, setAllowedMixers] = (0, react_1.useState)(configTracker.allowedMixers);
    const onChange = newAllowedMixers => {
        setAllowedMixers(newAllowedMixers);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("allowedMixers", onChange);
        return () => {
            // cleanup
            configTracker.off("allowedMixers", onChange);
        };
    }, []);
    return allowedMixers;
}
exports.useAllowedMixersConfiguration = useAllowedMixersConfiguration;
function useAtemConfiguration() {
    const [atemConfiguration, setAtemConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setAtemConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("atem", onChange);
        setAtemConfiguration(configTracker.atemConfiguration);
        return () => {
            // cleanup
            configTracker.off("atem", onChange);
        };
    }, []);
    return atemConfiguration;
}
exports.useAtemConfiguration = useAtemConfiguration;
function useMockConfiguration() {
    const [mockConfiguration, setMockConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setMockConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("mock", onChange);
        setMockConfiguration(configTracker.mockConfiguration);
        return () => {
            // cleanup
            configTracker.off("mock", onChange);
        };
    }, []);
    return mockConfiguration;
}
exports.useMockConfiguration = useMockConfiguration;
function useObsConfiguration() {
    const [obsConfiguration, setObsConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setObsConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("obs", onChange);
        setObsConfiguration(configTracker.obsConfiguration);
        return () => {
            // cleanup
            configTracker.off("obs", onChange);
        };
    }, []);
    return obsConfiguration;
}
exports.useObsConfiguration = useObsConfiguration;
function useRolandV8HDConfiguration() {
    const [rolandV8HDConfiguration, setRolandV8HDConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setRolandV8HDConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("rolandV8HD", onChange);
        setRolandV8HDConfiguration(configTracker.rolandV8HDConfiguration);
        return () => {
            // cleanup
            configTracker.off("rolandV8HD", onChange);
        };
    }, []);
    return rolandV8HDConfiguration;
}
exports.useRolandV8HDConfiguration = useRolandV8HDConfiguration;
function useRolandV60HDConfiguration() {
    const [rolandV60HDConfiguration, setRolandV60HDConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setRolandV60HDConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("rolandV60HD", onChange);
        setRolandV60HDConfiguration(configTracker.rolandV60HDConfiguration);
        return () => {
            // cleanup
            configTracker.off("rolandV60HD", onChange);
        };
    }, []);
    return rolandV60HDConfiguration;
}
exports.useRolandV60HDConfiguration = useRolandV60HDConfiguration;
function useVmixConfiguration() {
    const [vmixConfiguration, setVmixConfiguration] = (0, react_1.useState)(undefined);
    const onChange = newConf => {
        setVmixConfiguration(newConf);
    };
    (0, react_1.useEffect)(() => {
        configTracker.on("vmix", onChange);
        setVmixConfiguration(configTracker.vmixConfiguration);
        return () => {
            // cleanup
            configTracker.off("vmix", onChange);
        };
    }, []);
    return vmixConfiguration;
}
exports.useVmixConfiguration = useVmixConfiguration;
function useDefaultTallyConfiguration() {
    const [configuration, setConfiguration] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        const onChange = newConf => {
            setConfiguration(newConf);
        };
        configTracker.on("tally", onChange);
        setConfiguration(configTracker.defaultTallyConfiguration);
        return () => {
            // cleanup
            configTracker.off("tally", onChange);
        };
    }, []);
    return configuration;
}
exports.useDefaultTallyConfiguration = useDefaultTallyConfiguration;
