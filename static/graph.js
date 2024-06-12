let xVar = '';
let shortXVar = false;
let maxEnabled = true;


const resize = () => {
    shortXVar = (window.innerWidth < 375);
    setX(xVar);
}

$(window).resize(resize);

const scale = [];

const lod = ({cv, beta, n, k}) => {
    if (cv === 0) return -Math.log(beta) / (n * k);
    else {
        d = 1 / Math.pow(cv, 2);
        return ((d / Math.pow(beta, 1 / (n * d))) - d) / k;
    }
}

const ctx = $('#chart')[0].getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: scale,
        params: {
            cv: {
                ctr: $('#cv-ctr'),
            },
            beta: {
                ctr: $('#beta-ctr'),
            },
            n: {
                ctr: $('#n-ctr'),
            },
            k: {
                ctr: $('#k-ctr'),
            },
        },
        datasets: [
            {
                label: 'Limit of Detection',
                function: (params, x) => {
                    params[xVar] = x;
                    return lod(params)
                },
                data: [],
                fill: false,
                lineTension: 0.35,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'LOD per mL',
                },
            },
            x: {
                title: {
                    display: true,
                },
            },
        },
        animation: true,
    },
});

Chart.defaults.font.size = 16;
Chart.defaults.font.family = 'monospace';

const setX = (newX) => {
    if (!['cv', 'beta', 'n', 'k'].includes(newX) || !maxEnabled) return;
    xVar = newX;
    
    // toggle active button
    $('[id^="btn-param-"].active').toggleClass('active', false);
    $(`#btn-param-${newX}`).toggleClass('active', true);
    
    // hide slider container for var on x-axis
    $('[id$="-ctr"]').toggleClass('hidden', false);
    const ctr = $(`#${newX}-ctr`);
    ctr.toggleClass('hidden', true);

    // update x scale
    setScale(+ctr[0].dataset.min, +ctr[0].dataset.max, +ctr[0].dataset.step);

    // set label text accordingly
    if (shortXVar) chart.options.scales.x.title.text = $(`#btn-param-${ctr.find('input').attr('id').split('-slider')[0]}`).text();
    else chart.options.scales.x.title.text = ctr.find('label').text();

    // update chart
    chart.options.animation = false;
    chart.update();
    chart.options.animation = true;
}

const setScale = (min, max, step) => {
    // clears scale
    scale.length = 0;

    // add x values between min and max
    for (let x = min; x <= max; x += step) {
        scale.push(Math.round(x * 100) / 100);
    }
}

resize();

const showCalc = () => {
    // select calc button
    $('[id^="btn-param-"]').toggleClass('active', false);
    $(`#btn-param-calc`).toggleClass('active', true);

    $($('#chart')[0].parentElement).toggleClass('hidden', true);
    $('[id$="-slider"]').toggleClass('hidden', true);
    $('[id$="-ctr"]').toggleClass('hidden', false);
    $('#lod-results').toggleClass('hidden', false);
    maxEnabled = false;

    // reset labels accordingly
    $('[id$="-ctr"] label').each(function() {
        $(this).attr('for', `${$(this).attr('for').split('-')[0]}-text`);
    });
}

const showChart = () => {
    $($('#chart')[0].parentElement).toggleClass('hidden', false);
    $('[id$="-slider"]').toggleClass('hidden', false);
    $('#lod-results').toggleClass('hidden', true);
    maxEnabled = true;

    // reset labels accordingly
    $('[id$="-ctr"] label').each(function() {
        $(this).attr('for', `${$(this).attr('for').split('-')[0]}-text`);
    });
}

$('[name="xVar"]').change(function() {
    $('[id^="btn-param-"].active').toggleClass('active', false);
    const x = $(this).attr('id').split('Select')[0];
    $(`[for="${x}Select"]`).toggleClass('active', true);
    window.location.hash = x;
    if (x !== 'calc') {
        showChart();
        setX(x);
    } else {
        showCalc();
    }
});

$('#darkModeCheck').focus(function () {
    $(this).parent().toggleClass('focus', true);
});

$('#darkModeCheck').focusout(function () {
    $(this).parent().toggleClass('focus', false);
});

const calcVal = () => {
    const params = JSON.parse(JSON.stringify(chart.data.params));
    for (const x in params) params[x] = +params[x].value;
    $('#lod-text').val(lod(params));
}

$(`[id$="-text"]`).change(() => {
    calcVal();
});
calcVal();

$('.number-input').focus(function() {
    $(this).select();
});

if (['#calc', '#cv', '#beta', '#n', '#k'].includes(window.location.hash)) {
    $(`#btn-param-${window.location.hash.split('#')[1]}`).click();
} else if (!window.location.hash) {
    $('#btn-param-n').attr('checked', true).change();
}