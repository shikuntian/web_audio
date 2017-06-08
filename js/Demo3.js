(function () {
    console.log('录音开始');
    var URL, //本地存储下载url;
        audioContext,//音频上下文环境
        audioLevel,
        audio,
        getAudioCallBack//获取录取设备;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mzGetUserMedia || navigator.msGetUserMedia;
    URL = window.URL || window.webkitURL;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.createScriptProcessor == null) {
        audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
    }
    audioLevel = audioContext.createGain();
    audioLevel.gain.value = 1;
    audio = void 0;
    getAudioCallBack = function (e) {
        if (audio != null) {
            audio.disconnect();
        }
        audio = audioContext.createMediaStreamSource(e);
        audio.connect(audioLevel);
    };
    if (navigator.mediaDevices != null && navigator.mediaDevices.getUserMedia != null) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(getAudioCallBack)["catch"](function (err) {
            console.log('the audio not use');
        });
    } else {
        navigator.getUserMedia({audio:true},getAudioCallBack,function (err) {
            console.log('the audio is can not use ');
        });
    }
    console.log(navigator.mediaDevices);
    console.log(navigator.mediaDevices.getUserMedia);
})();
