/**
 * global.js handles all logic required for site-wide controls, including
 * dark mode, site info, and service worker registration.
 * 
 * Created by Elliot Topper, 06/24
 */

// internally sets dark mode on HTML elements; called by setDarkMode() after setting localStorage variable
const _setDarkMode = () => {
    // sets slider to its proper state
    $('#darkModeCheck').attr('checked', darkMode);
    // sets the general Bootstrap 5 color theme
    $('html')[0].dataset.bsTheme = darkMode ? 'dark' : 'light';

    // updates chart colors
    if (darkMode) {
        chart.options.scales.x.title.color = 'white';
        chart.options.scales.y.title.color = 'white';
        chart.options.scales.x.ticks.color = 'white';
        chart.options.scales.y.ticks.color = 'white';
        chart.options.scales.x.grid.color = '#3d3d3d';
        chart.options.scales.y.grid.color = '#3d3d3d';
    } else {
        chart.options.scales.x.title.color = undefined;
        chart.options.scales.y.title.color = undefined;
        chart.options.scales.x.ticks.color = undefined;
        chart.options.scales.y.ticks.color = undefined;
        chart.options.scales.x.grid.color = undefined;
        chart.options.scales.y.grid.color = undefined;
    }
    chart.update();
}

// register listener for dark mode toggle
$('#darkModeCheck').change((e) => {
    setDarkMode($(e.target)[0].checked);
});

// register listeners for focusing dark mode toggle
$('#darkModeCheck').focus(function () {
    $(this).parent().toggleClass('focus', true);
});

$('#darkModeCheck').focusout(function () {
    $(this).parent().toggleClass('focus', false);
});

// initial value on site load
let darkMode = localStorage.getItem('lod-theme') === 'dark';
_setDarkMode();

// sets localStorage variable and calls internal function
const setDarkMode = (bool) => {
    if (darkMode === bool) return;
    localStorage.setItem('lod-theme', bool ? 'dark' : 'light');
    darkMode = bool;
    _setDarkMode();
}

/* Info controls */

const toggleInfo = () => {
    $(document.body).toggleClass('info-hidden');
    localStorage.setItem('lod-infoClosed', true);
    $('#infoBtn>div').toggleClass('transform-left-25', !$(document.body).hasClass('info-hidden'));
    $('#buttonPopup').toggleClass('transform-none');
    $('#buttonPopup p').toggleClass('hidden');
}

// shows info page on load if site has not been loaded before
if (!localStorage.getItem('lod-infoClosed')) toggleInfo();

// registers escape key to toggle info page
$(document).keydown((e) => {
    if (e.code == 'Escape') {
        toggleInfo();
    }
});

// initializes tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

/* Service worker */

// registers service worker
if ("serviceWorker" in navigator) {
    $(document).ready(() => {
        navigator.serviceWorker
            .register("/static/serviceWorker.js")
            .then(() => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}