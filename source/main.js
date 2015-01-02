Math.clamp = function(value, min, max)
{
    return Math.min(Math.max(value, min), max);
};

var window = require('nw.gui').Window.get();

var gui = new function()
{
    this.draggingPlaybackBar = false;
};

var audio = new function()
{
    this.sound = null;

    this.load = function(file)
    {
        // Validate arguments.
        if(file == null)
            return;
        
        // Load the sound file.
        var sound = new buzz.sound(file.path);
        
        if(sound == null)
            return;

        // Play the new sound track.
        this.stop();
        this.sound = sound;
        this.play();
        
        // Set playback name.
        var name = file.name.replace(/\.[^/.]+$/, "");
        $('#playback-name').text(name);
        
        // Set playback event handlers.
        this.sound.bind("playing", function(event)
        {
            // Change progress bar style.
            var bar = $('#playback-progress').find('.progress-bar');
            bar.addClass('progress-bar-striped active');
            bar.removeClass('progress-bar-default');
        });
        
        this.sound.bind("pause", function(event)
        {
            // Change progress bar style.
            var bar = $('#playback-progress').find('.progress-bar');
            bar.removeClass('progress-bar-striped active');
            bar.addClass('progress-bar-default');
        });
        
        this.sound.bind("timeupdate", function(event)
        {
            // Don't update if dragging the playback bar.
            if(gui.draggingPlaybackBar)
                return;
            
            // Get sound track time and duration.
            var time = this.getTime();
            var duration = this.getDuration();
            
            // Update time text.
            $('#playback-time').text(buzz.toTimer(time) + " / " + buzz.toTimer(duration));
            
            // Update progress bar.
            $('#playback-progress').find('.progress-bar').css('width', time / duration * 100 + '%');
        });
    };
    
    this.stop = function()
    {
        if(this.sound)
        {
            this.sound.stop();
        }
    };
    
    this.pause = function()
    {
        if(this.sound)
        {
            this.sound.pause();
        }
    };
    
    this.play = function()
    {
        if(this.sound)
        {
            this.sound.play();
        }
    };
    
    this.setTime = function(seconds)
    {
        if(this.sound)
        {
            this.sound.setTime(seconds);
        }
    };
    
    this.setPercent = function(percent)
    {
        if(this.sound)
        {
            this.sound.setPercent(percent);
        }
    };
    
    this.getDuration = function()
    {
        if(this.sound)
        {
            return this.sound.getDuration();
        }
        else
        {
            return 0;
        }
    }
};

var main = function()
{
    // Window behavior.
    window.ondragover = function(event)
    {
        event.preventDefault();
        return false;
    };
    
    window.ondrop = function(event)
    {
        event.preventDefault();

        audio.load(event.dataTransfer.files[0]);
        
        return false;
    };

    // Application control.
    $('#application-close').click(function()
    {
        window.close();
    });
    
    // Playback control.
    $('#playback-stop').click(function()
    {
        audio.stop();
    });
    
    $('#playback-pause').click(function()
    {
        audio.pause();
    });
    
    $('#playback-play').click(function()
    {
        audio.play();
    });
    
    // Progress bar.
    $('#playback-progress').children('.progress').mousedown(function(event)
    {
        // Set interface state.
        gui.draggingPlaybackBar = true;
        
        // Disable transition effect.
        $('#playback-progress').find('.progress-bar').addClass('no-transition');

        // Prevent selection.
        return false;
    });
    
    $(document).mouseup(function(event)
    {
        if(gui.draggingPlaybackBar)
        {
            // Set interface state.
            gui.draggingPlaybackBar = false;
            
            // Restore transition effect.
            $('#playback-progress').find('.progress-bar').removeClass('no-transition');
            
            // Reset if there's no sound track.
            if(!audio.sound)
            {
                $('#playback-progress').find('.progress-bar').css('width', '0%');
            }
        }
    });
    
    $(document).mousemove(function(event)
    {
        if(gui.draggingPlaybackBar)
        {
            // Calculate mouse position on the progress bar.
            var x = event.pageX - $('#playback-progress').offset().left;
            var alpha = x / $('#playback-progress').width();
            alpha = Math.clamp(alpha, 0.0, 1.0);
            
            // Update progress time.
            var duration = audio.getDuration();
            $('#playback-time').text(buzz.toTimer(duration * alpha) + " / " + buzz.toTimer(duration));
            
            // Update progress bar.
            $('#playback-progress').find('.progress-bar').css('width', alpha * 100 + '%');
        }
    });
    
    $('#playback-progress').children('.progress').click(function(event)
    {
        // Calculate mouse position on the progress bar.
        var x = event.pageX - $(this).offset().left;
        var alpha = x / $(this).width();
        alpha = Math.clamp(alpha, 0.0, 1.0);

        // Change playback position.
        audio.setPercent(alpha * 100);
        audio.play();
    });
};

$(document).ready(main);
