document.addEventListener('deviceready', function () {
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    //Add path to pdf.worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';


//Check if speechSynthesis is in window
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
                    let file = document.querySelector("#file").files[0];

                    if (file.type == "application/pdf") {
                        let arr = [];
                        var itemsProcessed = 0;

                        //Convert file to buffer
                        var bufferPromise = file.arrayBuffer();
                        bufferPromise.then((buffer) => {

                            // pdfjsLib.getDocument only accepts .data == buffer
                            var loadingTask = pdfjsLib.getDocument(buffer);

                            loadingTask.promise.then(function (pdf) {
                                var numPages = pdf.numPages;

                                for (let i = 1; i <= numPages; i++) {
                                    itemsProcessed++;
                                    pdf.getPage(i).then(function (page) {
                                        page.getTextContent().then(function (textContent) {
                                            arr.push(textContent.items)
                                            if (i >= numPages) {
                                                read_out_pdf(arr)
                                            }
                                        });
                                    });
                                }
                            });
                        })
                    } else {

                        var fr = new FileReader();
                        fr.onload = function () {

                            var text = fr.result;

                            //initialize SpeechSynthesisUtterance
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
                }

                if (window.speechSynthesis.paused) {
                    speechSynthesis.resume();
                }
            }
        })

        let arr = [];
        function read_out_pdf(items) {
            arr = [];

            //flatten array
            let flattenArr = items.flat()

            //map out str from array and join to string
            var text = flattenArr.map(o => o.str).join('');

            //initialize SpeechSynthesisUtterance
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

            //Invoke speech function
            speechSynthesis.speak(msg);

            //check if no sound
            let r = setInterval(() => {
                console.log(speechSynthesis.speaking);
                if (!speechSynthesis.speaking) {
                    clearInterval(r);
                } else {
                    speechSynthesis.resume();
                }
            }, 14000);

        }


        $('#pause').click(() => {
            if (speechSynthesis.speaking && !speechSynthesis.paused) { /* pause narration */
                speechSynthesis.pause();
            }
        })


        $('#cancel').click(() => {
            if (speechSynthesis.speaking) {
                /* for safari */
                flag = false;
                speechSynthesis.cancel();
            }
        })

        //import text file
        $('#import').click(() => {
            $('#file').click();
        })

        $('#rate').on('input', () => {
            $('#rate_label').html(`Speed: ${$('#rate').val()}`)
        })
        $('#pitch').on('input', () => {
            $('#pitch_label').html(`Pitch: ${$('#pitch').val()}`)
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

