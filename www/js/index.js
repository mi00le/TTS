document.addEventListener('deviceready', function () {
    if ('speechSynthesis' in window) {

        speechSynthesis.onvoiceschanged = function () {
            var $voicelist = $('#voices');

            if ($voicelist.find('option').length == 0) {
                speechSynthesis.getVoices().forEach(function (voice, index) {
                    var $option = $('<option>')
                        .val(index)
                        .html(voice.name + (voice.default ? ' (default)' : ''));

                    $voicelist.append($option);
                });

                $voicelist.select();
            }
        }
        let flag = false;

        $('#speak').click(function () {


            if ($('#file').val() == "") {
                alert("No File Selected!")
            } else {
                if (!flag) {
                    flag = true;
                    let file = document.querySelector("#file");

                    var fr = new FileReader();
                    fr.onload = function () {

                        var text = fr.result;
                        
                        
                        
                        var msg = new SpeechSynthesisUtterance();
                        var voices = window.speechSynthesis.getVoices();
                        msg.voice = voices[$('#voices').val()];
                        msg.rate = $('#rate').val() / 10;
                        msg.pitch = $('#pitch').val();
                        msg.text = text;
                        
                        $('.output').html(text)


                        msg.onend = function (e) {
                            console.log('Finished in ' + event.elapsedTime + ' seconds.');
                            flag = false;
                        };
                        speechSynthesis.speak(msg);

                        let r = setInterval(() => {
                            console.log(speechSynthesis.speaking);
                            if (!speechSynthesis.speaking) {
                                clearInterval(r);
                            } else {
                                speechSynthesis.resume();
                            }
                        }, 14000);
                    }
                    fr.readAsText(file.files[0]);
                }

                if (window.speechSynthesis.paused) {
                    speechSynthesis.resume();
                }
            }
        })

        $('#pause').click(() => {
            if (speechSynthesis.speaking && !speechSynthesis.paused) { /* pause narration */
                speechSynthesis.pause();
            }
            // flag = true;
        })


        $('#cancel').click(() => {
            if (speechSynthesis.speaking) { /* stop narration */
                /* for safari */
                flag = false;
                speechSynthesis.cancel();
            }
        })

        //import text file
        $('#import').click(() => {
            $('#file').click();
        })

        $('#rate').on('input',()=>{
            $('#rate_label').html($('#rate').val())
        })
        $('#pitch').on('input',()=>{
            $('#pitch_label').html($('#pitch').val())
        })
    }
    else {
        msg = document.createElement('h5');
        msg.textContent = "Detected no support for Speech Synthesis";
        msg.style.textAlign = 'center';
        msg.style.backgroundColor = 'red';
        msg.style.color = 'white';
        msg.style.marginTop = msg.style.marginBottom = 0;
        document.body.insertBefore(msg, document.querySelector('.container'));
    }
}, false)

