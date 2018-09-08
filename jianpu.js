async function jianpu(text, duration) {
    duration |= 220;

    var ctx, xml, data, frequencyRatioTempered, map;
    var list = [];

    // 初始化AudioContext
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContext();
    
    // 获取指定音源文件的二进制数据
    xml = new XMLHttpRequest();
    xml.responseType = 'arraybuffer';
    xml.open('GET', 'media/piano.wav', true);
    xml.onload = function() {
        // 获取二进制数据并解码
        ctx.decodeAudioData(
            xml.response,
            function(_data) {
                data = _data;
            },
            function(e) {
                alert(e.err);
            }
        );
    };
    xml.send();
    
    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    
    // 根据平均律得出的相邻音调之间的频率比(近似値)
    frequencyRatioTempered = 1.059463;
    
    map = {
        '((1))' : '36', '((#1))': '35', '((2))' : '34', '((#2))': '33', '((3))' : '32', '((4))': '31',
        '((#4))': '30', '((5))' : '29', '((#5))': '28', '((6))' : '27', '((#6))': '26', '((7))': '25',
        '(1)' : '24', '(#1)': '23', '(2)' : '22', '(#2)': '21', '(3)' : '20', '(4)': '19',
        '(#4)': '18', '(5)' : '17', '(#5)': '16', '(6)' : '15', '(#6)': '14', '(7)': '13',
        '1' : '12', '#1': '11', '2' : '10', '#2': '9', '3' : '8', '4': '7',
        '#4': '6',  '5' : '5',  '#5': '4',  '6' : '3', '#6': '2', '7': '1',
        '[1]' : '0',  '[#1]': '-1', '[2]' : '-2', '[#2]': '-3', '[3]' : '-4',  '[4]': '-5',
        '[#4]': '-6', '[5]' : '-7', '[#5]': '-8', '[6]' : '-9', '[#6]': '-10', '[7]': '-11',
        '[[1]]' : '-12', '[[#1]]': '-13', '[[2]]' : '-14', '[[#2]]': '-15', '[[3]]' : '-16', '[[4]]': '-17',
        '[[#4]]': '-18', '[[5]]' : '-19', '[[#5]]': '-20', '[[6]]' : '-21', '[[#6]]': '-22', '[[7]]': '-23',
    }
    
    function play(k){
        var i, v, frequencyRatio;
    
        v = map[k];
    
        // 根据基准音C求得其他音调相对于它的频率比例
        frequencyRatio = 1;
        if(v > 0){
            for (i = 0; i < v; i++) {
                frequencyRatio /= frequencyRatioTempered;
            }
        }else{
            for (i = 0; i > v; i--) {
                frequencyRatio *= frequencyRatioTempered;
            }
        }
    
        var bufferSource = ctx.createBufferSource();
        bufferSource.buffer = data;
        // 通过改变音源播放速度的比率，调整音高
        bufferSource.playbackRate.value = frequencyRatio;
        bufferSource.connect(ctx.destination);
        bufferSource.start(0);
    }    

    list.push(' ');
    for (var i = 0; i < text.length; i++) {
        switch(text[i]){
            case ' ':
            case '-':
            case '\n':
                list.push(' ');
                break;
            case '(':
            case '[':
                if(text[i+1] === '(' || text[i+1] === '['){
                    if(text[i+2] === '#'){
                        list.push(text[i] + text.substr(i+1, 5));
                        i+=5;
                    }else{
                        list.push(text[i] + text.substr(i+1, 4));
                        i+=4;
                    }
                }else if(text[i+1] === '#'){
                    list.push(text[i] + text.substr(i+1, 3));
                    i+=3;
                }else{
                    list.push(text[i] + text.substr(i+1, 2));
                    i+=2;
                }
                break;
            case '#':
                list.push(text[i] + text.substr(i+1, 1));
                i+=1;
                break;
            default:
                list.push(text[i]);
        }
    }

    for (var i = 0; i < list.length; i++) {
        if(list[i] === ' '){
            await sleep(duration);
        }else{
            // console.log(list[i]);
            play(list[i]);
            await sleep(duration);
        }
    }
}
