(function () {
    var URL, //本地保存的url
        audioContext,//音频上下文环境
        onGotAudioIn,//获取音频权限之后的回调方法
        audioIn,//MediaStreamAudioSourceNode 对象
        audioInLevel,//音频的益曾值
        audioRecorder,//初始化录音环境
        setProgress,//进度条处理函数
        $modalProgress,//进度条展示dom
        startRecording,//定义开始录音方法
        stopRecording,//定义停止录音方法
        saveRecording,//保存录音方法
        updateDateTime,//更新录音时间方法
        $recordingList,//录音列表id对象
        $record,//录音按钮id对象
        $cancel,//取消录音按钮id对象
        $recording,//录音中id对象
        $timeDisplay,//录音时间
        $dateTime,//当前时间
        minSecStr,
        partitionSecond = 60//默认分割时间
        ;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    URL = window.URL || window.webkitURL;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.createScriptProcessor == null) {
        audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
    }
    audioInLevel = audioContext.createGain();//创建一个益增节点
    audioInLevel.gain.value = 1;
    audioIn = void 0;
    $modalProgress = $('#modal-progress');
    $record = $('#record');
    $recording = $('#recording');
    $cancel = $('#cancel');
    $recordingList = $('#recording-list');
    $dateTime = $('#date-time');
    $timeDisplay = $('#time-display');
    onGotAudioIn = function (stream) {
        if (audioIn != null) {
            audioIn.disconnect();
        }
        audioIn = audioContext.createMediaStreamSource(stream);
        audioIn.connect(audioInLevel);
    };
    if ((navigator.mediaDevices != null) && (navigator.mediaDevices.getUserMedia != null)) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(onGotAudioIn)["catch"](function (err) {
            return onError("Could not get audio media device: " + err);
        });
    } else {
        navigator.getUserMedia({audio: true}, onGotAudioIn, function () {
            return onError("Could not get audio media device: " + err);
        });
    }
    audioRecorder = new WebAudioRecorder(audioInLevel, {
        workerDir: 'web-audio-recorder-js/lib-minified/'
    });
    audioRecorder.setEncoding('mp3');
    startRecording = function () {
        $recording.removeClass('hidden');
        $record.html('STOP');
        $cancel.removeClass('hidden');
        audioRecorder.startRecording();
        setProgress(0);
    };
    stopRecording = function (finish) {
        $recording.addClass('hidden');
        $record.html('RECORD');
        $cancel.addClass('hidden');
        if (finish) {
            audioRecorder.finishRecording();
            if (audioRecorder.options.encodeAfterRecord) {
                $modalProgress.find('.modal-title').html("Encoding " + (audioRecorder.encoding.toUpperCase()));
                $modalProgress.modal('show');
            }
        } else {
            audioRecorder.cancelRecording();
        }
    };
    $record.on('click', function () {
        if (audioRecorder.isRecording()) {
            stopRecording(true);
        } else {
            startRecording();
        }
    });

    setProgress = function (progress) {
        var percent;
        percent = "" + ((progress * 100).toFixed(1)) + "%";
        $modalProgress.find('.progress-bar').attr('style', "width: " + percent + ";");
        $modalProgress.find('.text-center').html(percent);
        progressComplete = progress === 1;
    };
    saveRecording = function (blob, enc) {
        var html, time, url;
        time = new Date();
        url = URL.createObjectURL(blob);
        html = ("<p recording='" + url + "'>") + ("<audio controls src='" + url + "'></audio> ") + ("(" + enc + ") " + (time.toString()) + " ") + ("<a class='btn btn-default' href='" + url + "' download='recording." + enc + "'>") + "Save..." + "</a> " + ("<button class='btn btn-danger' recording='" + url + "'>Delete</button>");
        "</p>";
        $recordingList.prepend($(html));
    };
    audioRecorder.onComplete = function (recorder, blob) {
        if (recorder.options.encodeAfterRecord) {
            $modalProgress.modal('hide');
        }
        saveRecording(blob, recorder.encoding);
    };
    minSecStr = function (n) {
        return (n < 10 ? "0" : "") + n;
    };
    updateDateTime = function () {
        var sec;
        $dateTime.html((new Date).toString());
        sec = audioRecorder.recordingTime() | 0;
        $timeDisplay.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));
        //根据时间切割
        if (sec == partitionSecond) {
            stopRecording(true);
            startRecording();
        }
    };

    window.setInterval(updateDateTime, 200);

    var uploadRecorder = function (blob) {
        var fd = new FormData();
        fd.append('file',blob);
        $http({
            method:'POST',
            url:"/upload",
            data: fd,
            headers: {'Content-Type':undefined},
            transformRequest: angular.identity
        }).success( function ( response ) {
            //上传成功的操作
            alert("uplaod success");
        });

    };
})();