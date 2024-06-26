/**
 * graph.js creates a Chart.js object and manages selection of parameters
 * and discrete calculation.
 * 
 * Created by Elliot Topper, 06/24
 */

// Global variables
let xVar = '';
let shortXVar = false;
const scale = [];
let anim = true;
let meanMode = false;
let plated = false;
let formattedLOD = 0;

// LOD function, as defined in Sharp, Parker, and Hamilton (2024) (https://www.sciencedirect.com/science/article/pii/S016770122300057X?via%3Dihub)
const lod = (params) => {
    const { beta, n, k } = params;
    let cv;
    if (!meanMode) cv = params.cv;
    else cv = params.sd / params.mean;
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
            mean: {
                ctr: $('#mean-ctr'),
            },
            sd: {
                ctr: $('#sd-ctr'),
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
                        let formattedVal = Math.round(t[0].raw.y * 100) / 100;
                        if (Math.abs(formattedVal) > 99_999) formattedVal = Number(formattedVal).toExponential(1);
                        return `${$(`#btn-param-${xVar}`).text()}: ${t[0].raw.x}\nLOD: ${formattedVal}`;
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
    if (!['cv', 'beta', 'n', 'k', 'mean', 'sd'].includes(newX)) return;
    xVar = newX;
    
    // toggle active button
    $('[id^="btn-param-"].active').toggleClass('active', false);
    $(`#btn-param-${newX}`).toggleClass('active', true);
    
    // hide slider container for var on x-axis
    $('[id$="-ctr"]').toggleClass('hidden', false);
    const ctr = $(`#${newX}-ctr`);
    ctr.toggleClass('hidden', true);

    // update x scale
    setScale(+ctr[0].dataset.min || 0, +ctr[0].dataset.max || 100, +ctr[0].dataset.step);

    // set label text accordingly
    if (shortXVar) chart.options.scales.x.title.text = $(`#btn-param-${ctr.find('input').attr('id').split('-slider')[0]}`).text();
    else chart.options.scales.x.title.text = ctr.find('label').text();

    // set y axis label
    chart.options.scales.y.title.text = plated ? "LOD per plated volume" : "LOD per mL";

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
    formattedLOD = new Intl.NumberFormat('en-US').format(lodVal);
    // formats LOD and inserts into text box
    $('#lod-text').val(formattedLOD);
}

// listener for any value change
$(`[id$="-text"], [id$="-slider"]`).change(function () {
    // save parameter values to localStorage for data persistence
    localStorage.setItem(`lod-param-${$(this).attr('id').split('-')[0]}`, $(this).val());
    // recalculate LOD
    calcVal();
});
calcVal();

// called whenever the address hash changes; sets X parameter based on hash
const checkPath = () => {
    if (window.location.pathname == '/calc') return;
    const hash = window.location.hash;
    if (['#beta', '#n', '#k', '#cv', '#mean', '#sd'].includes(hash)) {
        setX(hash.split('#')[1]);
    } else if (!hash) {
        setX(meanMode ? 'mean' : 'cv');
    }
}

checkPath();

// listener for setting the calculated LOD to return sample data, instead of population data,
// or vice versa
const setPlated = (p) => {
    // disable k parameter
    $('#k-ctr, #btn-param-k').toggleClass('disabled', p);
    $('#btn-param-k').attr('tabindex', +p * -1);
    // set k to 1 (for sample calculation)
    chart.data.params.k.value = p ? 1 : $('#k-slider').val();
    // save plated value to localStorage for data persistence
    localStorage.setItem('lod-plated', p);
    calcVal();
    plated = p;
    setX(xVar);

    // if k was the current view, reset to default
    if (p && xVar === 'k') {
        window.location.hash = '';
    }
}

// listener for switching between mean/sd and cv (mean/sd)
const setMeanMode = (mm) => {
    // save switch value to localStorage for data persistence
    localStorage.setItem('lod-mean-mode', mm);
    meanMode = mm;
    // disable unused parameters
    $('#cv-ctr, #btn-param-cv').toggleClass('disabled', meanMode);
    $('#btn-param-cv').attr('tabindex', +mm * -1);
    $('#mean-sd-ctr, #mean-sd-ctr>div, #btn-param-mean, #btn-param-sd').toggleClass('disabled', !meanMode);
    $('#btn-param-mean, #btn-param-sd').attr('tabindex', +!mm * -1);
    
    calcVal();
    setX(xVar);

    // change the current graph view if it is disabled
    if (xVar === 'cv' && mm) window.location.hash = '#mean';
    if ((xVar === 'mean' || xVar === 'sd') && !mm) window.location.hash = '#cv';
}

// defines fonts for use in PDF output
const fonts = {
    'Roboto Mono': {
        normal: `${window.location.protocol}//${window.location.host}/static/fonts/RobotoMono-Regular.ttf`,
        bold: `${window.location.protocol}//${window.location.host}/static/fonts/RobotoMono-Bold.ttf`,
    }
};

// generates and downloads a PDF report reflecting the inputs and output at the time of generation
const genReport = () => {
    // first, define pdfMake objects for each visible parameter
    params = $('[id$="-ctr"]:not(.disabled):not(.hidden)>[id$="-label"]').map((i, label) => {
        const p = label.id.split('-label')[0];
        return {
            text: [
                {
                    text: `${label.textContent}: `,
                    bold: true,
                }, chart.data.params[p].value
            ]
        }
    });
    // pdfMake uses a document definition object to specify PDF contents
    // each line is present with appropriate styling
    const docDefinition = {
        content: [
            {
                text: 'LOD Calculator', style: 'header', margin: [0, 5]
            },
            {
                text: 'Parameter Values', style: 'subheading',
            },
            ...params,
            {
                text: [
                    {
                        text: 'Limit of Detection (LOD) per mL: ', bold: true,
                    }, formattedLOD,
                ], style: 'larger', margin: [0, 5, 0, 0],
            },
            {
                text: plated ? 'Calculated for a diluted sample (k=1)' : `Calculated for a ${plated ? 'diluted sample (k=1)' : 'population pre-dilution'}`,
                fontSize: 12,
            }
        ],
        defaultStyle: {
            font: 'Roboto Mono',
            lineHeight: 1.25,
        },
        styles: {
            header: {
                fontSize: 35,
                bold: true,
                alignment: 'center',
            },
            subheading: {
                fontSize: 24,
                bold: true,
            },
            larger: {
                fontSize: 20
            },
            link: {
                color: 'blue',
                decoration: 'underline'
            },
        },
        info: {
            title: `LOD Calulator Output - ${new Date().toLocaleDateString()}`,
            keywords: 'LOD, limits of detection',
        },
        footer: {
            text: [
                'Generated on ',
                new Date() .toLocaleString(),
                ' using ',
                {
                    text: 'pdfMake',
                    link: 'http://pdfmake.org/',
                    style: 'link'
                },
            ],
            fontSize: 10,
            margin: 10
        }
    };
    // the docDefinition and fonts are passed to createPdf() to generate a PDF
    const pdf = pdfMake.createPdf(docDefinition, null, fonts);
    // generated PDF is automatically downloaded
    pdf.download('lod-output.pdf');
}

// set switches based on persistent values
if (localStorage.getItem('lod-plated') === "true") $('#platedSwitch').attr('checked', true).change();
$('#cvSwitch').attr('checked', localStorage.getItem('lod-mean-mode') === "true").change();