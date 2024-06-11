const _setDarkMode = () => {
    $('#darkModeCheck').attr('checked', darkMode);
    $('html')[0].dataset.bsTheme = darkMode ? 'dark' : 'light';
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

$('#darkModeCheck').change((e) => {
    setDarkMode($(e.target)[0].checked);
});

let darkMode = localStorage.getItem('lod-theme') === 'dark';
_setDarkMode();

const setDarkMode = (bool) => {
    if (darkMode === bool) return;
    localStorage.setItem('lod-theme', bool ? 'dark' : 'light');
    $('#darkModeCheck')[0].checked = !darkMode;
    darkMode = bool;
    _setDarkMode();
}