local fileName = "tally-settings.ini"
if not file.exists(fileName) and file.exists("/FLASH/tally-settings.ini") then
    fileName = "/FLASH/tally-settings.ini"
end

_G.LightTypes = { COMMON_ANODE = "grb+", COMMON_CATHODE = "grb-" }
_G.Ws2812Types = { RGB = "rgb", GRB = "grb" }

local staSsid, staPw, hubIp = nil, nil, nil
local hubPort = 7411
local name = string.format("%x", node.chipid())
local staIp, staGateway, staNetmask = nil, "192.168.3.1", "255.255.255.0"
local operatorType = LightTypes.COMMON_ANODE
local operatorWs2812Type = Ws2812Types.GRB
local operatorWs2812Lights = 25
local stageType = LightTypes.COMMON_ANODE
local stageWs2812Type = Ws2812Types.GRB
local stageWs2812Lights = 0
local ws2812Brightness = 5

local trim = function(s) return s:match("^%s*(.-)%s*$") end
local isVal = function(v, t) for _, x in pairs(t) do if v == x then return true end end return false end
local makeHostName = function(s) return "Tally-" .. s:gsub("[^%w]+", "-"):gsub("^%-+", ""):gsub("%-+$", "") end

_G.MySettings = {
    staSsid = function() return staSsid end,
    staPw = function() return staPw end,
    staIp = function() return staIp end,
    staGateway = function() return staGateway end,
    staNetmask = function() return staNetmask end,
    hubIp = function() return hubIp end,
    hubPort = function() return hubPort end,
    name = function() return name end,
    hostName = function() return makeHostName(name) end,
    operatorType = function() return operatorType end,
    operatorNumberOfWs2812Lights = function() return operatorWs2812Lights end,
    operatorWs2812Type = function() return operatorWs2812Type end,
    stageType = function() return stageType end,
    stageNumberOfWs2812Lights = function() return stageWs2812Lights end,
    stageWs2812Type = function() return stageWs2812Type end,
    ws2812Brightness = function() return ws2812Brightness end,
    isValid = function() return staSsid ~= nil and hubIp ~= nil end,
}

if file.exists(fileName) then
    local f = file.open(fileName, "r")
    if f then
        while true do
            local line = f:readline()
            if not line then break end
            local k, v = line:match("^%s*([^=]+)%s*=%s*([^=]+)%s*$")
            if k and v and line:sub(1,1) ~= ";" then
                k, v = trim(k), trim(v)
                if k == "station.ssid" then staSsid = v
                elseif k == "station.password" then staPw = v
                elseif k == "station.ip" then staIp = v
                elseif k == "station.gateway" then staGateway = v
                elseif k == "station.netmask" then staNetmask = v
                elseif k == "hub.ip" then hubIp = v
                elseif k == "hub.port" then hubPort = tonumber(v)
                elseif k == "tally.name" then name = v:sub(0, 26)
                elseif k == "operator.type" and isVal(v:lower(), LightTypes) then operatorType = v:lower()
                elseif k == "stage.type" and isVal(v:lower(), LightTypes) then stageType = v:lower()
                elseif k == "operator.ws2812" then
                    local p = v:find(" ", 1, true)
                    local cnt = p and tonumber(v:sub(1, p-1)) or tonumber(v)
                    local typ = p and v:sub(p+1) or nil
                    if cnt then operatorWs2812Lights = cnt end
                    if typ and isVal(typ, Ws2812Types) then operatorWs2812Type = typ end
                elseif k == "stage.ws2812" then
                    local p = v:find(" ", 1, true)
                    local cnt = p and tonumber(v:sub(1, p-1)) or tonumber(v)
                    local typ = p and v:sub(p+1) or nil
                    if cnt then stageWs2812Lights = cnt end
                    if typ and isVal(typ, Ws2812Types) then stageWs2812Type = typ end
                elseif k == "brightness" or k == "ws2812.brightness" then
                    local b = tonumber(v)
                    if b and b >= 1 and b <= 100 then ws2812Brightness = b end
                end
            end
        end
        f:close()
    end
end
