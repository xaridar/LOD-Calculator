Chart.register({
    id: 'function-params',
    beforeInit: (chart) => {
        const params = chart.data.params;
        for (const param in params) {

            // get components via DOM manipulation
            chart.data.params[param].picker = chart.data.params[param].ctr.find('.slider');
            chart.data.params[param].text = chart.data.params[param].ctr.find('.text');
            const picker = chart.data.params[param].picker;
            const text = chart.data.params[param].text;

            // set values and listeners based on data attributes
            const value = localStorage.getItem(`lod-param-${param}`) || +chart.data.params[param].ctr[0].dataset.value;
            const min = +chart.data.params[param].ctr[0].dataset.min;
            const max = +(chart.data.params[param].ctr[0].dataset.max || -1);
            const step = +chart.data.params[param].ctr[0].dataset.step;

            // picker attrs
            picker.attr('min', min);
            if (max > -1) picker.attr('max', max);
            picker.attr('step', step);
            
            // set initial values
            chart.data.params[param].mousedown = false;

            const setVal = (val) => {
                if (val < min) setVal(min);
                else if (val > max && max > -1) setVal(max);
                chart.data.params[param].value = val;
                picker.attr('aria-valuenow', val);
                picker.val(val);
                text.val(val);
                chart.update();
            }

            setVal(value);

            // listeners
            picker.mousedown(function () {
                chart.data.params[param].mousedown = true;
            });
            picker.mouseup(function () {
                chart.data.params[param].mousedown = false;
            });
            picker.mousemove(function () {
                if (!chart.data.params[param].mousedown) return;
                setVal($(this).val());
            });
            picker.change(function () {
                setVal($(this).val());
            });
            chart.data.params[param].text.change(function () {
                setVal($(this).val());
            });
        }
    },
    beforeUpdate: (chart) => {
        const data = chart.data;
        const params = JSON.parse(JSON.stringify(data.params));
        for (const x in params) params[x] = +params[x].value;
        for (let i = 0; i < data.datasets.length; i++) {
            data.datasets[i].data = [];
            for (let j = 0; j < data.labels.length; j++) {
                if (data.datasets[i].function == null) continue;
                const f = data.datasets[i].function,
                    x = data.labels[j],
                    y = f(params, x);
                if (y || y === 0) data.datasets[i].data.push({x, y});
            }
        }
    },
});