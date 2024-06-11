let xVar = '';
let shortXVar = false;

const resize = () => {
    shortXVar = (window.innerWidth < 500);
    setX(xVar);
}

$(window).resize(resize);

const scale = [];

const lod = (cv, beta, n, k) => {
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
                    return lod(params.cv, params.beta, params.n, params.k)
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
    if (!['cv', 'beta', 'n', 'k'].includes(newX)) return;
    xVar = newX;
    
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
    chart.update();
}

const setScale = (min, max, step) => {
    // clears scale
    scale.length = 0;

    // add x values between min and max
    for (let x = min; x <= max; x += step) {
        scale.push(Math.round(x * 100) / 100);
    }
}

setX('n');
resize();

$('[name="xVar"]').change((e) => {
    $('[id^="btn-param-"].active').toggleClass('active', false);
    $(e.target.parentElement).toggleClass('active', true);
    setX($(e.target.parentElement).attr('id').split('btn-param-')[1].toLowerCase());
})