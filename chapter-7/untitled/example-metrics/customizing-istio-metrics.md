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

  1. The default telemetry v2 EnvoyFilter configuration is equivalent to the following installation options:  
`bash`  
  
To customize telemetry v2 metrics, for example, to add request\_host and destination\_port dimensions to the requests\_total metric emitted by both gateways and sidecars in the inbound and outbound direction, change the installation options as follows:  


{% hint style="info" %}

{% endhint %}

  
  2. Apply the following annotation to all injected pods with the list of the dimensions to extract into a Prometheus time series using the following command:  


{% hint style="info" %}
This step is needed only if your dimensions are not already in DefaultStatTags list
{% endhint %}

```bash
apiVersion: apps/v1
kind: Deployment
spec:
  template: # pod template
    metadata:
      annotations:
        sidecar.istio.io/extraStatTags: destination_port,request_host  
```

### Verify the results

Send traffic to the mesh. For the Bookinfo sample, visit http://$GATEWAY\_URL/productpage in your web browser or issue the following command:

```bash
$ curl "http://$GATEWAY_URL/productpage"
```

{% hint style="info" %}
$GATEWAY\_URL is the value set in the Bookinfo example.
{% endhint %}

Use the following command to verify that Istio generates the data for your new or modified dimensions:

```bash
$ kubectl exec "$(kubectl get pod -l app=productpage -o jsonpath='{.items[0].metadata.name}')" -c istio-proxy -- curl 'localhost:15000/stats/prometheus' | grep istio_requests_total

```

For example, in the output, locate the metric istio\_requests\_total and verify it contains your new dimension.



### Use expressions for values

The values in the metric configuration are common expressions, which means you must double-quote strings in JSON, e.g. “‘string value’”. Unlike Mixer expression language, there is no support for the pipe \(\|\) operator, but you can emulate it with the has or in operator, for example:

```bash
has(request.host) ? request.host : "unknown"
```

For more information, see [Common Expression Language](https://opensource.google/projects/cel).  


Istio exposes all standard [Envoy attributes](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/security/rbac_filter#condition). Additionally, you can use the following extra attributes.  


| Attribute | Type | Value |
| :---: | :---: | :---: |
| `listener_direction` | int64 | Enumeration value for [listener direction](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#envoy-api-enum-core-trafficdirection) |
| `listener_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-listener metadata |
| `route_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-route metadata |
| `cluster_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-cluster metadata |
| `node` | [node](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-node) | Node description |
| `cluster_name` | string | Upstream cluster name |
| `route_name` | string | Route name |
| `filter_state` | map\[string, bytes\] | Per-filter state blob |
| `plugin_name` | string | Wasm extension name |
| `plugin_root_id` | string | Wasm root instance ID |
| `plugin_vm_id` | string | Wasm VM ID |



For more information, see [configuration reference](https://istio.io/v1.7/docs/reference/config/proxy_extensions/stats/).  




