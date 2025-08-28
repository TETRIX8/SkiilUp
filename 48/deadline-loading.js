// Init
var $ = jQuery;

// Helper: pluralize English day(s)
function getDaysLabel(num) {
    return Math.abs(num) === 1 ? 'day' : 'days';
}

// Helper: compute days between now and a target date (UTC midnight difference)
function computeDaysRemainingFromDate(deadlineDateStr) {
    var now = new Date();
    var target = new Date(deadlineDateStr);
    if (isNaN(target.getTime())) return null;
    var diffMs = target.getTime() - now.getTime();
    var daysLeft = Math.ceil(diffMs / 86400000); // 1000*60*60*24
    return daysLeft < 0 ? 0 : daysLeft;
}

// Encapsulate widget initialization to allow reuse on any page
function initDeadlineWidget($root) {
    // Defaults match the original demo
    var animationTime = Number($root.data('duration')) || 20; // seconds for a full cycle
    var daysAttr = $root.data('days');
    var deadlineAttr = $root.data('deadline'); // ISO date, e.g. 2025-12-31

    var days = 7;
    if (typeof daysAttr !== 'undefined') {
        days = Number(daysAttr) || 0;
    } else if (typeof deadlineAttr !== 'undefined') {
        var computed = computeDaysRemainingFromDate(deadlineAttr);
        if (computed !== null) days = computed;
    }
    if (days < 1) days = 1; // guard to avoid divide-by-zero in timer

    // Set initial labels
    var $dayNum = $root.find('.deadline-days .day');
    var $daysWord = $root.find('.deadline-days .days');
    if ($dayNum.length) $dayNum.text(days);
    if ($daysWord.length) $daysWord.text(getDaysLabel(days));

    // Sync CSS animation durations
    $root.find('#progress-time-fill, #death-group').css({'animation-duration': animationTime + 's'});

    var deadlineAnimation = function () {
        setTimeout(function(){
            $('#designer-arm-grop').css({'animation-duration': '1.5s'});
        },0);

        setTimeout(function(){
            $('#designer-arm-grop').css({'animation-duration': '1s'});
        },4000);

        setTimeout(function(){
            $('#designer-arm-grop').css({'animation-duration': '0.7s'});
        },8000);

        setTimeout(function(){
            $('#designer-arm-grop').css({'animation-duration': '0.3s'});
        },12000);

        setTimeout(function(){
            $('#designer-arm-grop').css({'animation-duration': '0.2s'});
        },15000);
    };

    function timer(totalTime, deadline) {
        var time = totalTime * 1000;
        var dayDuration = time / deadline;
        var actualDay = deadline;
        var intervalId = setInterval(countTime, dayDuration);
        function countTime() {
            --actualDay;
            $dayNum.text(actualDay);
            $daysWord.text(getDaysLabel(actualDay));
            if (actualDay === 0) {
                clearInterval(intervalId);
                $dayNum.text(deadline);
                $daysWord.text(getDaysLabel(deadline));
            }
        }
        return intervalId;
    }

    // Build masked text once per widget
    (function wrapDeadlineText(){
        var $el = $root.find('.deadline-days').first();
        if ($el.data('wrapped')) return; // avoid double-wrapping on re-init
        var html = '<div class="mask-red"><div class="inner">' + $el.html() + '</div></div><div class="mask-white"><div class="inner">' + $el.html() + '</div></div>';
        $el.html(html).data('wrapped', true);
    })();

    deadlineAnimation();
    timer(animationTime, days);

    // Restart every full cycle to keep everything in sync
    setInterval(function(){
        timer(animationTime, days);
        deadlineAnimation();
    }, animationTime * 1000);
}

$(document).ready(function(){
    // Initialize for the demo root or any element with id="deadline"
    var $root = $('#deadline');
    if ($root.length) {
        initDeadlineWidget($root);
    }
});