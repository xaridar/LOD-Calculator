import math
import numpy as np

def calc_lod(beta, k, u_micro, samples):
    n_exp = np.size(samples, 0)
    n_samples = np.size(samples, 1)
    
    lambda_hat = samples[:, 0]

    mu_hat = lambda_hat.mean()
    sd_hat = lambda_hat.std(ddof=1)

    cv_hat = sd_hat / mu_hat
    d = 1 / cv_hat**2
    x_vals = np.arange(0, 15, 1)
    
    print(n_exp, n_samples, cv_hat, mu_hat, d)

    l_plate = (d / beta ** (1 / d)) - d
    l_original = l_plate / k
    graph = np.zeros((2,15))
    graph[0,:] = x_vals
    graph[1,:] = np.array([lod_function(x, d, l_plate) for x in x_vals])
    print(graph)

    return graph

def lod_function(x, d, mu):
    gamma_term = gamma_function(x + d) / (gamma_function(d) * math.factorial(x))
    mu_term = (mu / (mu + d)) ** x
    d_term = (d / (mu + d)) ** d
    return gamma_term * mu_term * d_term

def gamma_function(x):
    return math.factorial(int(x) - 1)