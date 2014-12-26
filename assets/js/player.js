var audio = new Audio();
audio.preload = 'none';
$().ready(function()
{
    // загрузка плейлиста
    $.ajax({
        url: '../../php/get_tracks.php',
        async: false,
        success: function(answer)
        {
            tracks = answer;
        }
    });

    if (localStorage['volume'] != undefined)
        audio.volume = localStorage['volume'];

    // очистка плейлиста (на будущее)
    $('#playlist').empty();

    // парсинг трегов из джисона и вывод в плейлист
    var tracks = JSON.parse(tracks);
    for (var track in tracks)
    {
        preLoad(tracks[track].file, tracks[track].duration);
    }

    // клик по кнопке плей
    $('.play-btn').click(function()
    {
        if ($(this).hasClass('glyphicon-play'))
        {
            $(this).removeClass('glyphicon-play');
            $(this).addClass('glyphicon-pause');
            if (audio.src == '')
            {
                audio.src = $('.list-group-item').first().attr('data-file');
                $('.list-group-item').first().addClass('active');
            }
            audio.play();
        }
        else
        {
            $(this).addClass('glyphicon-play');
            $(this).removeClass('glyphicon-pause');
            audio.pause();
        }
    });

    // клик по кнопке вперед
    $('.glyphicon-forward').click(function()
    {
        if (audio.src == '')
        {
            audio.src = $('.list-group-item').first().attr('data-file');
            $('.list-group-item').removeClass('active');
            $('.list-group-item').first().addClass('active');
        }
        else
        {
            current = $('.list-group-item.active');
            current.removeClass('active');
            if (current.next().attr('data-file') == undefined)
            {
                audio.src = $('.list-group-item').first().attr('data-file');
                $('.list-group-item').removeClass('active');
                $('.list-group-item').first().addClass('active');
            }
            else
            {
                audio.src = current.next().attr('data-file');
                current.next().addClass('active');
            }

        }
        $('.play-btn').removeClass('glyphicon-play').removeClass('glyphicon-pause').addClass('glyphicon-pause');
        audio.play();
    });

    //клик по кнопке назад
    $('.glyphicon-backward').click(function()
    {
        if (audio.src == '')
        {
            audio.src = $('.list-group-item').last().attr('data-file');
            $('.list-group-item').removeClass('active');
            $('.list-group-item').last().addClass('active');
        }
        else
        {
            current = $('.list-group-item.active');
            current.removeClass('active');
            if (current.prev().attr('data-file') == undefined)
            {
                audio.src = $('.list-group-item').last().attr('data-file');
                $('.list-group-item').removeClass('active');
                $('.list-group-item').last().addClass('active');
            }
            else
            {
                audio.src = current.prev().attr('data-file');
                current.prev().addClass('active');
            }

        }
        $('.play-btn').removeClass('glyphicon-play').removeClass('glyphicon-pause').addClass('glyphicon-pause');
        audio.play();
    });

    // показ/скрытие регулятора громкости
    $('.sound-volume').hover(
        function()
        {
            $('.volume').show();
        },
        function()
        {
            $('.volume').hide();
        }
    );

    // клик по элементу в плейлисте
    $('.list-group-item').click(function()
    {
        audio.src = $(this).attr('data-file');
        $('.list-group-item').removeClass('active');
        $(this).addClass('active');
        $('.play-btn').removeClass('glyphicon-play').removeClass('glyphicon-pause').addClass('glyphicon-pause');
        audio.play();
    });

    // вывод времени трека и прогресса загрузки
    audio.addEventListener('playing', function()
    {
        mins = parseInt(this.duration / 60);
        secs = parseInt(this.duration - mins * 60);
        if (mins < 10)
            mins = '0' + String(mins);
        if (secs < 10)
            secs = '0' + String(secs);
        $('.length-time').html(mins + ':' + secs);
        $('.list-group-item.active').find('.song-time').html(mins + ':' + secs);
        loadProgress();
    });

    // обновление времени и прогресса воспроизведенной части
    audio.addEventListener('timeupdate', function()
    {
        //console.log(this.currentTime);
        if (this.currentTime < 60)
        {
            mins = '00';
        }
        else
        {
            mins = parseInt(this.currentTime / 60);
        }
        secs = parseInt(this.currentTime);
        if (secs > 59)
        {
            secs = parseInt(this.currentTime - parseInt(mins) * 60)
        }
        secs =String(secs);
        mins =String(mins);
        if (secs.length < 2)
            secs = '0' + secs;
        if (mins.length < 2)
            mins = '0' + mins;
        $('.start-time').html(mins + ':' + secs);
        timePercent = parseInt((this.currentTime / this.duration) * 100);
        $('#current-position').css('width', timePercent + '%');
    });

    // обновление прогресса загрузки по мере загрузки
    audio.addEventListener('progress', loadProgress);
    audio.addEventListener('loadeddata', loadProgress);
    audio.addEventListener('canplaythrough', loadProgress);

    // при окончании воспроизведения переход к следующему треку
    audio.addEventListener('ended', function()
    {
        $('.glyphicon-forward').trigger('click');
    });

    // переход к новой точке воспроизведения
    $('#slider').click(function(e)
    {
        if (audio.src != '')
        {
            left = $(this).position().left;
            width = $(this).width();
            x = e.clientX - left;

            width_percent = width / 100;
            x_percent = x / width_percent;

            duration_percent = audio.duration / 100;
            audio.currentTime = duration_percent * x_percent;
        }
    });

    // изменение громкости
    $('#volume').click(function(e)
    {
        left = $(this).position().left;
        width = $(this).width();
        x = e.clientX - left;

        width_percent = width / 100;
        x_percent = x / width_percent;
        audio.volume = x_percent / 100;
        localStorage['volume'] = audio.volume;
    });

    audio.addEventListener('volumechange', function()
    {
        $('#volume-position').css('width', (audio.volume * 100) + '%');
    });
});

function preLoad(track, duration)
{
    src = '../../music/' + track;
    append_str = '<li class="list-group-item" data-file="'+ src +'">'+ track + '<span class="small song-time">' + duration + '</span></li>';
    $('#playlist').append(append_str);
}

function loadProgress()
{
    percent = parseInt(100 / audio.duration * audio.buffered.end(audio.buffered.length-1));
    $('#load-position').css('width', percent + '%');
}