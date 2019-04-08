'use strict';

var queryUrl = 'http://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=ru&jsonp=appendCanvas'; // API цитат

var unsplashApi = 'https://api.unsplash.com/photos/random/?client_id=1dd92dce5a102a35ad7b85e043d8e70747d8a3cf5bbb7348808a387947edd080&count=9'; // API изобрражений

var testQuote = ''; // переменная для цитат
const imgN = 9;

var getQuote = document.createElement('script');  // создаём скрипт-элемент и помещаем его в head
getQuote.src = queryUrl;
document.getElementsByTagName("head")[0].appendChild(getQuote);


var getCanvas = document.createElement('canvas'); //создаём холст
getCanvas.id = 'collageCanvas';
getCanvas.style.display = 'block';
getCanvas.style.margin = '0 auto';
document.body.appendChild(getCanvas);

var downloadContent = document.createElement('a'); // создаём кнопку
downloadContent.id = 'downloadButton';
downloadContent.style.display = 'block';
downloadContent.style.cursor = 'pointer';
downloadContent.style.width = '200px';
downloadContent.style.padding = '20px';
downloadContent.style.margin = '20px auto';
downloadContent.style.border = '2px solid black';
downloadContent.style.fontFamily = 'Comic Sans MS';
downloadContent.innerHTML = 'Télécharger le collage';
downloadContent.textDecoration = 'none';

var appendCanvas = function renderQuote(response) {
    testQuote = response.quoteText; // в json файле, который присылается скриптом берём поле quoteText

    var collageCanvas = document.getElementById("collageCanvas");
    var ctx = collageCanvas.getContext('2d'); // Контекст
    collageCanvas.height = 1200; //задаём размеры и стили
    collageCanvas.width = 1200;
    ctx.font = "31px Comic Sans MS";
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    var lineHeight = 45; //высота строки для цитат

    var images = new Array();   // Создаём изображения
    for (var i = 0; i < imgN; ++i) {
        images[i] = new Image();
        images[i].crossOrigin = 'Anonymous';
    }

    var slicedQuote = testQuote.split(" "); //Делим цитату на слова
    var counter = 9; //Счётчик для переноса строки
    var loaded = 0;

    $.ajax({ //jQuery AJAX-запрос, он на выдаёт json, в котором по ключу urls.regular лежат ссылки на пикчи
        type: 'GET',
        url: unsplashApi,
        dataType: 'json',
        success: function (data) {
            var img = data;
            for (var i = 0; i < images.length; i++) {
                images[i].src = img[i].urls.raw + "&w=400&h=400&fit=crop&crop=left";
            }
        }
    });

    //Смысл прослушек в том, чтобы ловить момент, когда прогрузятся все изображения и только потом их рисовать вместе с текстом. Для этого есть счётчик
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('load', function () {
            var line = 0;
            var quoteLine = ""; //создаём новую строку
            loaded++;
            ctx.filter = 'brightness(40%) blur(2px)';   //фильтр, уменьшающий яркость холста на 40%
            if (loaded === counter) { //если все изображения загружены
                ctx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);
                for (var i = 0; i < images.length; ++i) {
                    ctx.drawImage(images[i], (i % 3) * 400, Math.floor(i / 3) * 400); // ровно рисуем картинки
                }
                ctx.filter = 'brightness(100%)'; //чтобы текст не терялся на фоне, возвращаем ему былую яркость, перед тем, как напечатать
                for (var j = 0; j < slicedQuote.length; j += 5) {
                    quoteLine = "";
                    for (var k = j; k < j + 5; k++) {
                        if (slicedQuote[k] !== undefined) { //чтобы не печатать undefined, когда перепрыгиваем через конец массива
                            quoteLine = quoteLine + " " + slicedQuote[k];
                        }
                    }
                    ctx.fillText(quoteLine, collageCanvas.width / 2, collageCanvas.height * 3 / 7 + lineHeight * line); //сложная математика для печатания строк
                    line++;
                }
                document.body.appendChild(downloadContent); //прикрепляем кнопку снизу, когда всё прорисовалось
                getCanvas.style.border = '5px groovy white';
            }
        }, false);
    }

    downloadContent.addEventListener('click', function (event) {
        downloadContent.href = collageCanvas.toDataURL('image/jpeg', 1.0);
        downloadContent.download = "le collage.jpg";
    }, false);
};