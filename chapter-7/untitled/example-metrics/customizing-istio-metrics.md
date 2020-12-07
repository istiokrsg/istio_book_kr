# Customizing Istio Metrics

ref : https://istio.io/v1.7/docs/tasks/observability/metrics/customize-metrics/

## Customizing Istio Metrics <a id="title"></a>

This task shows you how to customize the metrics that Istio generates.

Istio generates telemetry that various dashboards consume to help you visualize your mesh. For example, dashboards that support Istio include:

* Grafana\[[https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/)\]
* Kiali\[[https://istio.io/v1.7/docs/tasks/observability/kiali/](https://istio.io/v1.7/docs/tasks/observability/kiali/)\]
* Prometheus\[[https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/)\]

By default, Istio defines and generates a set of standard metrics \(e.g. requests\_total\), but you can also customize them and create new metrics.



### Custom statistics configuration

Istio uses the Envoy proxy to generate metrics and provides its configuration in the EnvoyFilter at manifests/charts/istio-control/istio-discovery/templates/telemetryv2\_1.7.yaml.

Configuring custom statistics involves two sections of the EnvoyFilter: definitions and metrics. The definitions section supports creating new metrics by name, the expected value expression, and the metric type \(counter, gauge, and histogram\). The metrics section provides values for the metric dimensions as expressions, and allows you to remove or override the existing metric dimensions. You can modify the standard metric definitions using tags\_to\_remove or by re-defining a dimension. These configuration settings are also exposed as istioctl installation options, which allow you to customize different metrics for gateways and sidecars as well as for the inbound or outbound direction.

For more information, see Stats Config reference.\[[https://istio.io/v1.7/docs/reference/config/proxy\_extensions/stats/](https://istio.io/v1.7/docs/reference/config/proxy_extensions/stats/)\]

### Before you begin

Install Istio\[[https://istio.io/v1.7/docs/setup/](https://istio.io/v1.7/docs/setup/)\] in your cluster and deploy an application. Alternatively, you can set up custom statistics as part of the Istio installation.

The Bookinfo\[[https://istio.io/v1.7/docs/examples/bookinfo/](https://istio.io/v1.7/docs/examples/bookinfo/)\] sample application is used as the example application throughout this task.



### Enable custom metrics

1. The default telemetry v2 EnvoyFilter configuration is equivalent to the following installation options: `bash`  To customize telemetry v2 metrics, for example, to add request\_host and destination\_port dimensions to the requests\_total metric emitted by both gateways and sidecars in the inbound and outbound direction, change the installation options as follows:    
2. Apply the following annotation to all injected pods with the list of the dimensions to extract into a Prometheus time series using the following command:  
  




   This step is needed only if your dimensions are not already in [DefaultStatTags list](https://github.com/istio/istio/blob/release-1.7/pkg/bootstrap/config.go)

### Verify the results



1. 2. 












