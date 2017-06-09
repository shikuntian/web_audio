(function () {
    console.log('录音开始');
    var URL, //本地存储下载url;
        defaultEncoding = 'mp3',//设置默认录音格式
        audioContext,//音频上下文环境
        audioLevel,
        audio,
        getAudioCallBack, //获取录取设备
        $record,//record dom对象
        $recording,//录音中 dom对象
        $cancel,//取消录音dom 对象
        $recordingList,//录音列表dom对象
        audioRecorder,//音频对象
        cancelRecord,//取消录音方法
        startRecord,//开始录音方法
        stopRecord//停止录音方法
        ;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mzGetUserMedia || navigator.msGetUserMedia;
    URL = window.URL || window.webkitURL;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.createScriptProcessor == null) {
        audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
    }
    audioLevel = audioContext.createGain();
    audioLevel.gain.value = 1;
    audio = void 0;
    $record = $('#record');
    $recording = $('#recording');
    $cancel = $('#cancel');
    $recordingList = $('#recording-list');
    audioRecorder = new WebAudioRecorder(audioLevel, {
        workerDir: 'web-audio-recorder-js/lib-minified/',
        timeLimit: 1200
    });
    audioRecorder.setEncoding(defaultEncoding);
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
        navigator.getUserMedia({audio: true}, getAudioCallBack, function (err) {
            console.log('the audio is can not use ');
        });
    }

    startRecord = function () {
        $recording.removeClass('hidden');
        $record.html('停止');
        $cancel.removeClass('hidden');
        audioRecorder.startRecording();
    };

    audioRecorder.onComplete = function (recorder, blob) {
        console.log(blob);
        var html, time, url, title, date;
        var enc = recorder.encoding;
        time = new Date();
        title = '录音' + time.getDay() + time.getHours();
        date = time.getYear() + time.getMonth() + time.getDay();
        console.log(date);
        url = URL.createObjectURL(blob);
        html = ("<p recording='" + url + "'>") + ("<span>" + title + "</span>") + ("<audio controls src='" + url + "'></audio> ") + ("(" + '类型' + enc + ") " + ('录制时间' + date) + " ") + ("<a class='btn btn-default' href='" + url + "' download='recording." + enc + "'>") + "Save..." + "</a> " + ("<button class='btn btn-danger' recording='" + url + "'>Delete</button>");
        "</p>";
        $recordingList.prepend($(html));
    };

    stopRecord = function () {
        $record.html('录音')
        $recording.addClass('hidden');
        $cancel.addClass('hidden');
        audioRecorder.finishRecording();
    };

    cancelRecord = function () {
        $record.html('录音');
        $recording.addClass('hidden');
        $cancel.addClass('hidden');
    };

    $record.on('click', function () {
        if (audioRecorder.isRecording()) {
            stopRecord();
        } else {
            startRecord();
        }
    });

    $cancel.on('click', function () {
        cancelRecord();
    });
})();
