Chart.register({
    id: 'function-params',
    beforeInit: (chart) => {
        const params = chart.data.params;
        for (const param in params) {
            paramInfo = params[param];

            // get components via DOM manipulation
            paramInfo.picker = paramInfo.ctr.find('.slider');
            paramInfo.text = paramInfo.ctr.find('.text');
            const picker = paramInfo.picker;
            const text = paramInfo.text;

            // set values and listeners based on data attributes
            const value = paramInfo.ctr[0].dataset.value;
            const min = paramInfo.ctr[0].dataset.min;
            const max = paramInfo.ctr[0].dataset.max;
            const step = paramInfo.ctr[0].dataset.step;

            // picker attrs
            picker.val(value);
            picker.attr('min', min);
            picker.attr('max', max);
            picker.attr('step', step);
            
            // text attrs
            text.val(value);
            
            // set initial values
            paramInfo.value = value;
            paramInfo.mousedown = false;

            // listeners
            picker.mousedown(function () {
                paramInfo.mousedown = true;
            });
            picker.mouseup(function () {
                paramInfo.mousedown = false;
            });
            picker.mousemove(function () {
                if (!paramInfo.mousedown) return;
                paramInfo.value = $(this).val();
                text.val($(this).val());
                chart.update();
            });
            picker.change(function () {
                paramInfo.value = $(this).val();
                text.val($(this).val());
                chart.update();
            });
            paramInfo.text.change(function () {
                paramInfo.value = $(this).val();
                picker.val($(this).val());
                chart.update();
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