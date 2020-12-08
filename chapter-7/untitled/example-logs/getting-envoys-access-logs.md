# Getting Envoy's Access Logs

ref : [https://istio.io/v1.7/docs/tasks/observability/logs/access-log/](https://istio.io/v1.7/docs/tasks/observability/logs/access-log/)

## Getting Envoy's Access Logs <a id="title"></a>

The simplest kind of Istio logging is [Envoy’s access logging](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage). Envoy proxies print access information to their standard output. The standard output of Envoy’s containers can then be printed by the `kubectl logs` command.

### Before you begin <a id="before-you-begin"></a>

* Setup Istio by following the instructions in the [Installation guide](https://istio.io/v1.7/docs/setup/).The egress gateway and access logging will be enabled if you install the `demo` [configuration profile](https://istio.io/v1.7/docs/setup/additional-setup/config-profiles/).
* Deploy the [sleep](https://github.com/istio/istio/tree/release-1.7/samples/sleep) sample app to use as a test source for sending requests. If you have [automatic sidecar injection](https://istio.io/v1.7/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection) enabled, run the following command to deploy the sample app:

  ```text
  $ kubectl apply -f samples/sleep/sleep.yaml
  ```

  Otherwise, manually inject the sidecar before deploying the `sleep` application with the following command:

  ```text
  $ kubectl apply -f <(istioctl kube-inject -f samples/sleep/sleep.yaml)
  ```

  You can use any pod with `curl` installed as a test source.

* Set the `SOURCE_POD` environment variable to the name of your source pod:

  ```text
  $ export SOURCE_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
  ```

* Start the [httpbin](https://github.com/istio/istio/tree/release-1.7/samples/httpbin) sample.

  If you have enabled [automatic sidecar injection](https://istio.io/v1.7/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection), deploy the `httpbin` service:

  ```text
  $ kubectl apply -f samples/httpbin/httpbin.yaml
  ```

  Otherwise, you have to manually inject the sidecar before deploying the `httpbin` application:

  ```text
  $ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/httpbin.yaml)
  ```

### Enable Envoy’s access logging <a id="enable-envoy-s-access-logging"></a>

If you used an `IstioOperator` CR to install Istio, add the following field to your configuration:

```text
spec:
  meshConfig:
    accessLogFile: /dev/stdout
```

Otherwise, add the equivalent setting to your original `istioctl install` command, for example:

```text
$ istioctl install <flags-you-used-to-install-Istio> --set meshConfig.accessLogFile=/dev/stdout
```

You can also choose between JSON and text by setting `accessLogEncoding` to `JSON` or `TEXT`.

You may also want to customize the [format](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules) of the access log by editing `accessLogFormat`.

Refer to [global mesh options](https://istio.io/v1.7/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig) for more information on all three of these settings:

* `meshConfig.accessLogFile`
* `meshConfig.accessLogEncoding`
* `meshConfig.accessLogFormat`

### Test the access log <a id="test-the-access-log"></a>

1. Send a request from `sleep` to `httpbin`:

   ```text
   $ kubectl exec "$SOURCE_POD" -c sleep -- curl -v httpbin:8000/status/418
   ...
   < HTTP/1.1 418 Unknown
   < server: envoy
   ...
       -=[ teapot ]=-

          _...._
        .'  _ _ `.
       | ."` ^ `". _,
       \_;`"---"`|//
         |       ;/
         \_     _/
           `"""`
   ```

2. Check `sleep`’s log:

   ```text
   $ kubectl logs -l app=sleep -c istio-proxy
   [2019-03-06T09:31:27.354Z] "GET /status/418 HTTP/1.1" 418 - "-" 0 135 11 10 "-" "curl/7.60.0" "d209e46f-9ed5-9b61-bbdd-43e22662702a" "httpbin:8000" "172.30.146.73:80" outbound|8000||httpbin.default.svc.cluster.local - 172.21.13.94:8000 172.30.146.82:60290 -
   ```

3. Check `httpbin`’s log:

   ```text
   $ kubectl logs -l app=httpbin -c istio-proxy
   [2019-03-06T09:31:27.360Z] "GET /status/418 HTTP/1.1" 418 - "-" 0 135 5 2 "-" "curl/7.60.0" "d209e46f-9ed5-9b61-bbdd-43e22662702a" "httpbin:8000" "127.0.0.1:80" inbound|8000|http|httpbin.default.svc.cluster.local - 172.30.146.73:80 172.30.146.82:38618 outbound_.8000_._.httpbin.default.svc.cluster.local
   ```

Note that the messages corresponding to the request appear in logs of the Istio proxies of both the source and the destination, `sleep` and `httpbin`, respectively. You can see in the log the HTTP verb \(`GET`\), the HTTP path \(`/status/418`\), the response code \(`418`\) and other [request-related information](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules).

### Cleanup <a id="cleanup"></a>

Shutdown the [sleep](https://github.com/istio/istio/tree/release-1.7/samples/sleep) and [httpbin](https://github.com/istio/istio/tree/release-1.7/samples/httpbin) services:

```text
$ kubectl delete -f samples/sleep/sleep.yaml
$ kubectl delete -f samples/httpbin/httpbin.yaml
```

#### Disable Envoy’s access logging <a id="disable-envoy-s-access-logging"></a>

Remove, or set to `""`, the `meshConfig.accessLogFile` setting in your Istio install configuration.In the example below, replace `default` with the name of the profile you used when you installed Istio.

```text
$ istioctl install --set profile=default
✔ Istio core installed
✔ Istiod installed
✔ Ingress gateways installed
✔ Installation complete
```



