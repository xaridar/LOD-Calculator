Chart.register({
    id: 'functions',
    beforeInit: (chart) => {
        const data = chart.config.data;
        for (let i = 0; i < data.datasets.length; i++) {
            for (let j = 0; j < data.labels.length; j++) {
                if (data.datasets[i].function == null) continue;
                const f = data.datasets[i].function,
                    x = data.labels[j],
                    y = f(x);
                if (y || y === 0) data.datasets[i].data.push({x, y});
            }
        }
    },
})