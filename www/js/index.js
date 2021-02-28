document.addEventListener('deviceready', function () {

    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    //Add path to pdf.worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';


    //Check if speechSynthesis is in window
    // if ('speechSynthesis' in window) {
    //     msg = document.createElement('h5');
    //     msg.textContent = "Speech Synthesis support Detected";
    //     msg.style.textAlign = 'center';
    //     msg.style.backgroundColor = 'green';
    //     msg.style.color = 'white';
    //     msg.style.marginTop = msg.style.marginBottom = 0;
    //     document.body.insertBefore(msg, document.querySelector('.container'));
    // }
    // else {
    //     msg = document.createElement('h5');
    //     msg.textContent = "Detected no support for Speech Synthesis";
    //     msg.style.textAlign = 'center';
    //     msg.style.backgroundColor = 'red';
    //     msg.style.color = 'white';
    //     msg.style.marginTop = msg.style.marginBottom = 0;
    //     document.body.insertBefore(msg, document.querySelector('.container'));
    // }


    var $voicelist = $('#voices');
    TTS
        .getVoices().then(function (voices) {
            voices.forEach((voice, index) => {
                var $option = $('<option>')
                    .val(index)
                    .html(voice.identifier + (voice.default ? ' (default)' : ''));

                $voicelist.append($option);
            });
            $voicelist.select();
        }, function (reason) {
            alert(reason);
        });



    $('#speak').click(function () {



        if ($('#file').val() == "") {
            alert("No File Selected!")
        } else {

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
            } else if (file.type == "text/plain") {

                var fr = new FileReader();
                fr.onload = function () {

                    var text = fr.result;
                    read_out_txt(text)



                }
                fr.readAsText(file.files[0]);
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

        if (text.length > 60000) {
            $('.output').html("Too much text to handle!")
        } else {

            TTS
                .speak({
                    text: text,
                    identifier: $('#voices').val(),
                    rate: $('#rate').val(),
                    pitch: $('#pitch').val(),
                    cancel: true
                }).then(function () {
                    console.log('success');
                }, function (reason) {
                    console.log(reason);
                });

            $('.output').html(text)
        }
    }

    function read_out_txt(text) {
        if (text.length > 60000) {
            $('.output').html("Too much text to handle!")
        } else {

            TTS
                .speak({
                    text: text,
                    identifier: $('#voices').val(),
                    rate: $('#rate').val(),
                    pitch: $('#pitch').val(),
                    cancel: true
                }).then(function () {
                    console.log('success');
                }, function (reason) {
                    console.log(reason);
                });

            $('.output').html(text)
        }
    }

    $('#cancel').click(() => {
        TTS.stop()
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

}, false);