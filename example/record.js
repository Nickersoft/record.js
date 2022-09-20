"use strict";
var RecordJS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    AudioRecorder: () => AudioRecorder
  });

  // src/recorder.ts
  var AudioRecorder = class {
    constructor(options) {
      this.options = options;
      __publicField(this, "context");
      __publicField(this, "listeners", {});
      __publicField(this, "buffer", []);
      __publicField(this, "recorder");
      __publicField(this, "stream");
    }
    async start(deviceId) {
      await this.setupAudioMeter();
    }
    stop() {
      return new Promise((resolve) => {
        var _a, _b, _c, _d;
        (_a = this.recorder) == null ? void 0 : _a.addEventListener("stop", () => resolve(this.flush()));
        (_b = this.recorder) == null ? void 0 : _b.stop();
        (_c = this.context) == null ? void 0 : _c.suspend();
        (_d = this.stream) == null ? void 0 : _d.getTracks().forEach((track) => track.stop());
      });
    }
    static listDevices() {
      return navigator.mediaDevices.enumerateDevices().then((list) => list.filter((d) => d.kind === "audioinput"));
    }
    on(eventName, callback) {
      var _a;
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      (_a = this.listeners[eventName]) == null ? void 0 : _a.push(callback);
    }
    setStream(deviceId) {
      return navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId } : true,
        video: false
      });
    }
    flush() {
      const blob = new Blob(this.buffer);
      this.buffer = [];
      return blob;
    }
    async createAudioRecorder() {
      const stream = await this.getAudioStream();
      const recorder = new MediaRecorder(stream, this.options);
      recorder.addEventListener("dataavailable", (e) => {
        var _a;
        if (e.data.size > 0) {
          (_a = this.buffer) == null ? void 0 : _a.push(e.data);
        }
      });
      return recorder;
    }
    fireEvent(name, event) {
      var _a;
      (_a = this.listeners[name]) == null ? void 0 : _a.forEach((listener) => listener(event));
    }
    async getAudioStream() {
      if (!this.stream) {
        this.stream = await this.setStream();
      }
      return this.stream;
    }
    getAudioContext() {
      if (!this.context) {
        this.context = new AudioContext();
      }
      return this.context;
    }
    async setupAudioMeter() {
      const context = this.getAudioContext();
      const stream = await this.getAudioStream();
      await context.audioWorklet.addModule(
        "/volume-meter-processor.js"
      );
      const name = "volume-meter";
      const micNode = context.createMediaStreamSource(stream);
      const volumeMeterNode = new AudioWorkletNode(context, name);
      volumeMeterNode.port.onmessage = ({ data: volume }) => this.fireEvent("volumechange", { volume });
      micNode.connect(volumeMeterNode).connect(context.destination);
    }
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=record.js.map
