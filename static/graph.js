/**
 * graph.js creates a Chart.js object and manages selection of parameters
 * and discrete calculation.
 * 
 * Created by Elliot Topper, 06/24
 */

// Global variables
let xVar = '';
let shortXVar = false;
let maxEnabled = true;
const scale = [];
let anim = true;

// LOD function, as defined in Sharp, Parker, and Hamilton (2024) (https://www.sciencedirect.com/science/article/pii/S016770122300057X?via%3Dihub)
const lod = ({cv, beta, n, k}) => {
    if (cv === 0) return -Math.log(beta) / (n * k);
    else {
        const d = 1 / Math.pow(cv, 2);
        return ((d / Math.pow(beta, 1 / (n * d))) - d) / k;
    }
}

// Create Chart.js chart
// Defines use of LOD function for graphing and parameters for use with 'function-params' plugin (defined in chartplugin.js)
// Additionally, options are specified to style graph properly
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
            tooltip: {
                callbacks: {
                    title: t => {
                        return `${$(`#btn-param-${xVar}`).text()}: ${t[0].label}\nLOD: ${t[0].formattedValue}`;
                    },
                    label: () => {
                        return null;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'LOD per mL',
                },
                ticks: {
                    callback: (tick) => {
                        if (tick > 9_999_999) return Number(tick).toExponential(1);
                        return tick;
                    }
                },
            },
            x: {
                title: {
                    display: true,
                },
            },
        },
        animation: anim,
    },
});
// deafult options to specify text font
Chart.defaults.font.size = 16;
Chart.defaults.font.family = 'monospace';

// sets the independent variable on the graph when selected by the user
const setX = (newX) => {
    // only allows valid parameter names
    if (!['cv', 'beta', 'n', 'k'].includes(newX)) return;
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
    if (anim) chart.options.animation = true;
}

// turns on or off animation for accessibility
const toggleAnim = (newAnim = !anim) => {
    if (anim != newAnim) {
        localStorage.setItem('lod-animation', newAnim);
        chart.options.animation = newAnim;
        $('html')[0].dataset.prefersAnimation = newAnim;
        $('#animBtn').toggleClass('btn-success', newAnim);
        $('#animBtn').toggleClass('btn-danger', !newAnim);
        $('#animPause').toggleClass('hidden', newAnim);
        $('#animPlay').toggleClass('hidden', !newAnim);
        $('#animBtn').attr('data-bs-original-title', `Animations: ${newAnim ? 'On' : 'Off'}`);
    }
    anim = newAnim;
}
$(document).ready(() => {
    if (window.matchMedia(`(prefers-reduced-motion: reduce)`).matches) localStorage.setItem('lod-animation', 'false');
    if (localStorage.getItem('lod-animation') === "false") toggleAnim(false);
});

// if the window is small enough, replace the label on the X axis with a shortned version
const resize = () => {
    shortXVar = (window.innerWidth < 375);
    setX(xVar);
}
$(window).on('resize', resize);
resize();

// sets the X scale for chart recalculation
const setScale = (min, max, step) => {
    // clears scale
    scale.length = 0;

    // add x values between min and max
    for (let x = min; x <= max; x += step) {
        scale.push(Math.round(x * 100) / 100);
    }
}

// calculates the LOD value based on the current paramters
const calcVal = () => {
    const params = JSON.parse(JSON.stringify(chart.data.params));
    for (const x in params) params[x] = +params[x].value;
    const lodVal = lod(params);
    // formats LOD and inserts into text box
    $('#lod-text').val(new Intl.NumberFormat('en-US').format(
        lodVal,
    ));
}

// listener for any value change
$(`[id$="-text"], [id$="-slider"]`).change(function () {
    // save parameter values to localStorage for data persistence
    localStorage.setItem(`lod-param-${$(this).attr('id').split('-')[0]}`, $(this).val());
    // recalculte LOD
    calcVal();
});
calcVal();

// called whenever the address hash changes; sets X parameter based on hash
const checkPath = () => {
    if (window.location.pathname == '/calc') return;
    const hash = window.location.hash;
    if (['#cv', '#beta', '#n', '#k'].includes(hash)) {
        setX(hash.split('#')[1]);
    } else if (!hash) {
        setX('cv');
    }
}

checkPath();