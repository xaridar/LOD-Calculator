# Limits of Detection (LOD) Calculator

This application provides functionality to calculate limits of detection for microbes in a sample, based off of the work described in [Sharp, Parker, and Hamilton (2023)](https://www.sciencedirect.com/science/article/pii/S016770122300057X?via%3Dihub). It is built in Flask with Jinja2, Bootstrap, and jQuery.


More details can be found in the [User Manual](static/usermanual.pdf).
## Parameters
The LOD Calculator uses 4 (or 5) parameters to calculate LOD:
- **Coefficient of Variation ($CV$)** - Calculated as $&sigma;/&mu;$ of the sample; defines the relative variability of the distribution
- **Mean ($&mu;$)** - Mean of the distribution of CFUs; calculated from sample data
- **Standard Deviation ($&sigma;$)** - Standard Deviation of the distribution of CFUs; calculated from sample data
- **Type II Error Rate ($&beta;$)** - Rate of false negatives desired, provided as a proportion between 0 and 1; increasing $&beta;$ allows a higher chance of error in the resulting LOD
- **Number of Independent Experiments ($n$)** - Number of experiments conducted, provided as a counting number
- **Dilution Factor ($k$)** - Dilution factor used for creating the sample, provided as a percentage from 0 to 1

Each of these parameters affects the LOD calculation:

$$d = \frac{1}{CV^2}$$

$$L_{plate} = k\times L_{original} \geq \left(\frac{d}{\sqrt[nd]{\beta}}\right)-d$$

Or, if $CV = 0$:

$$L_{plate} = k\times L_{original} \geq -\frac{\ln{\beta}}{n}$$
## Options
There are two options for operating the calculator:
- **Population / Sample calculation ($L_{original} / L_{plate}$)** - Toggles calculation between LOD per mL (default) and LOD per plated volume ($k=1$)
- **CV / Mean mode** - Toggles control of $CV$ vs $&sigma;/&mu;$ for calculations

## Operation
The calculator supports two modes: Graph Mode and Discrete Calculation Mode.
### Graph Mode

Graph Mode can be accessed by selecting any of the listed parameters to be displayed as the independent variable on the graph.

&nbsp;

All other available parameters will become visibly accessible to be modified as desired, within a given range.

Altering the value of any variable will dynamically update the graphical view, allowing for live updates to the graph.

Variables can be changed via sliders with discrete values, or by entering values in the corresponding boxes.

The resulting graph will graph the chosen x variable against the calculated LOD, with all other parameter values being statically set to those chosen values.

### Discrete Calculation Mode

Discrete Calculation Mode can be accessed by selecting "Calculate Discrete Value".

&nbsp;

In this mode, any values can be input for the 4 previously mentioned parameters for an experiment.

The last box will show the LOD value given these parameter values.

#### PDF Output

Discrete Calculation Mode provides the option to export a calculated LOD as a PDF file.

Selecting "Download Report" in this mode will generate and download a PDF containing the current input and output values.

###### App developed by Elliot Topper, in collaboration with David Newton and Julia Sharp at NIST Boulder.

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/en/3.0.x/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Chart.js](https://www.chartjs.org/)
- [MathJax](https://www.mathjax.org/)
- [pdfmake](http://pdfmake.org/#/)