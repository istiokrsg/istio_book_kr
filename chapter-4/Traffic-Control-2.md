## 1. Traffic Shifting
이번 장에서는 Istio에서 Traffic을 Old version에서 New version으로 점진적으로 전환하는 방법을 살펴볼 것이다. Istio에서 route rules에 있는 traffic의 percent 설정을 조절하여 Traffic Shifting 기능을 가능하게 해준다. 이번 장에서 우리는 `reviews:v1`에서 `reviews:v3`로 Traffic의 50%만 보내다가, 100%로 변경하여 `reviews:v3`로 traffic을 완전히 전환하는 방법을 살펴보도록 하자.

### 준비
- [Istio 설치]()
- [Bookinfo Sample Application 배포]()
- [Traffic Management 컨셉 확인]()

### Weight-based routing
```
Bookinfo에서의 destination rule을 설정하지 않았다면, [Apply Default Destination Rules]()에 나와있는데로 실행해보자.
```

1. 우선 아래 커맨드를 통해서 모든 트래픽을 `v1`으로 향하게 하자.
```console
$ kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml
```

2. 브라우저에서 `http://$GATEWAY_URL/productpage` 페이지를 열어보자.
  - 이때 `$GATEWAY_URL` 환경변수는 [Bookinfo Sample]()에서 먼저 설명했듯이, ingress를 이용해서 외부에서 접근가능한 External IP(혹은 Host Name)이다.
  - 위 URL로 접근하게되면, `reviews:v1`버전인 review service로 트래픽이 전달되기 때문에, rating starts는 아무리 새로고침해도 보이지 않을 것이다. 
  
3. 이제 `reviews:v1`에서 `reviews:v3`fh 50%의 트래픽을 전환해보자.
```console
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-50-v3.yaml
```
  - 새로운 rule들이 전파되는데 몇초 정도 기다리자. 

4. 위에서 적용한 virtualservice 내용을 확인해보자.
```console
$ kubectl get virtualservice reviews -o yaml
```
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
  ...
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 50
    - destination:
        host: reviews
        subset: v3
      weight: 50
```
  - spec.http.route.desitination.weight의 값을 조정한것을 볼 수 있다. 위에서는 destination인 `v1`, `v3`의 weight값을 각각 50으로 설정한다.

5. `/productpage`를 브라우저에서 새로고침해보면, 약 50%의 확률로 red star가 보이게 될 것이다. 왜냐하면 `v3` 버전에서는 start rating에 접근하지만, `v1` 버전은 그렇지 않기 때문이다.
```
주의 : 최신 Envoy side의 구현에 따르면, /product 페이지를 많이 새로고침(15번 이상)해야 배포된 설정이 적용된것을 확인할 수 있을것이다. 또한 v3로의 weight를 90%로 설정을 한다면, red stars를 더 자주 보게 될것이다.
```

6. 만약 `reviews:v3`에 대해서 안정된 버전이라는 것이 검증되었다면, 이제 트래픽을 100%로 변경해야할 차례이다.
```console
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-v3.yaml
```
  - 이제 부터는 `/productpage`로 새로고침해보면, red start만이 보이게 될 것이다.

### 정리
이번장에서는 `reviews` 서비스에 대해서 `old` version에서 `new` version으로 트래픽을 전환하기 위해서 istio의 weighted routing 기능을 사용해보았다.
이렇게 istio에서 트래픽을 전환하는 방법은 Container ochestration platform에서의 사용하는 feature(instance의 scaling을 조정하는 방법)와는 다른 방법이다. 
istio를 이용하면 두 버전의 service를 트래픽 분산에 영향없이 각각을 독립적으로 scaling up/down 가능하다. 
istio를 이용한 Autoscaling에 관심이 있다면, [Canary Deployments using Istio](https://istio.io/blog/2017/0.1-canary/)를 살펴보자.



## 2. Mirroring
"shadowing"이라고도 불리는 Traffic mirroring은 아주 적은 risk로 어떤 변경사항을 production으로 배포할 수 있게 해준다. 
Mirroring은 live traffic을 복사해서 mirroed serivce로 똑같이 보내준다. 이러한 mirrored traffic은 특정 service의 path에 대해 실제로는 처리되지 않는 다른 영역(out of band)에서 발생하게된다.
이번 장에서는, 우선 모든 트래픽을 테스트를 위해`v1`으로 모두 보낸 상태에서 `v2`로 미러링을 적용해보자.

### 준비
- [Istio 설치]()
- [httpbin](https://github.com/istio/istio/tree/release-1.1/samples/httpbin)을 로깅이 가능한 두개의 버전으로 배포하자. 
  - httpbin-v1:
```console
$ cat <<EOF | istioctl kube-inject -f - | kubectl create -f -
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: httpbin-v1
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      containers:
      - image: docker.io/kennethreitz/httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        command: ["gunicorn", "--access-logfile", "-", "-b", "0.0.0.0:80", "httpbin:app"]
        ports:
        - containerPort: 80
EOF
```
  - httpbin-v2:
```console
$ cat <<EOF | istioctl kube-inject -f - | kubectl create -f -
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: httpbin-v2
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: httpbin
        version: v2
    spec:
      containers:
      - image: docker.io/kennethreitz/httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        command: ["gunicorn", "--access-logfile", "-", "-b", "0.0.0.0:80", "httpbin:app"]
        ports:
        - containerPort: 80
EOF
```
  - httpbin Kubernetes service:
```console
$ kubectl create -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
spec:
  ports:
  - name: http
    port: 8000
    targetPort: 80
  selector:
    app: httpbin
EOF
```

- `sleep` 서비스를 생성하고 그 서비스 안에서 `curl`을 이용해서 위두 버전의 페이지를 load 해보자.
  - sleep service: 
```console
$ cat <<EOF | istioctl kube-inject -f - | kubectl create -f -
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: sleep
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: sleep
    spec:
      containers:
      - name: sleep
        image: tutum/curl
        command: ["/bin/sleep","infinity"]
        imagePullPolicy: IfNotPresent
EOF
```

### default routing policy 설정
기본적으로 Kunernetes 두 버전의 `httpbin` 서비스에 대해서 균등하게 라우팅할 수 있게 해준다. 
우선 모든 트래픽을 `v1`으로 향하게 해보자.

1. 모든 트래픽을 `v1`으로 향하게 하기위한 route rule을 설정하자.
```
주의 : `mutual TLS Authentication enabled` 환경이라면, DestinationRule을 적용하기전에 TLS traffic policy에 `mode: ISTIO_MUTUAL`와 같은 설정을 추가해야한다.
그렇지 않으면 503 에러가 발생할 것이다. 자세한 내용은 [여기](https://istio.io/help/ops/traffic-management/troubleshooting/#503-errors-after-setting-destination-rule)를 살펴보자.
```

```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
    - httpbin
  http:
  - route:
    - destination:
        host: httpbin
        subset: v1
      weight: 100
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: httpbin
spec:
  host: httpbin
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
EOF
```
  - 이제 `httpbin:v1`으로 모든 트래픽을 전송될 것이다.

2. 일부 트래픽을 해당 서비스로 보내보자.
```console
$ export SLEEP_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
$ kubectl exec -it $SLEEP_POD -c sleep -- sh -c 'curl  http://httpbin:8000/headers' | python -m json.tool
{
  "headers": {
    "Accept": "*/*",
    "Content-Length": "0",
    "Host": "httpbin:8000",
    "User-Agent": "curl/7.35.0",
    "X-B3-Sampled": "1",
    "X-B3-Spanid": "eca3d7ed8f2e6a0a",
    "X-B3-Traceid": "eca3d7ed8f2e6a0a",
    "X-Ot-Span-Context": "eca3d7ed8f2e6a0a;eca3d7ed8f2e6a0a;0000000000000000"
  }
}
```

3. `httpbin` pod에 있는 `v1`과 `v2`의 로그를 확인해보자.
```console
$ export V1_POD=$(kubectl get pod -l app=httpbin,version=v1 -o jsonpath={.items..metadata.name})
$ kubectl logs -f $V1_POD -c httpbin

127.0.0.1 - - [07/Mar/2018:19:02:43 +0000] "GET /headers HTTP/1.1" 200 321 "-" "curl/7.35.0"
```
  - `v1`은 로그를 확인할 수 있지만,
```console
export V2_POD=$(kubectl get pod -l app=httpbin,version=v2 -o jsonpath={.items..metadata.name})
kubectl logs -f $V2_POD -c httpbin

<none>
```
  - `v2`에서는 로그를 확인할 수 없다.
  

### `v2`로 미러링
1. `v2`로 미러링 트래픽을 보내게 설정해보자.
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
    - httpbin
  http:
  - route:
    - destination:
        host: httpbin
        subset: v1
      weight: 100
    mirror:
      host: httpbin
      subset: v2
EOF
```
  - 위 처럼 spec.http.route.mirror 설정을 통해서, `httpbin` 서비스의 `v2`라는 pod으로 미러링 트래픽을 전송할 수 있게 된다.
  - 이러한 미러링 트래픽의 경우에는, `Host`/`Authority` header에 `-shodow`라는 접미(postfix)가 추가된다.
    - 예를 들면, `cluster-1`라는 값은 `cluster-1-shadow`처럼 되는 것이다.
    - 또한 _"fire and forget"_ 라는 전략에 따라서 미러링 요청에 대한 response는 무시된다.

2. 트래픽을 전송하자.
```console
$ kubectl exec -it $SLEEP_POD -c sleep -- sh -c 'curl  http://httpbin:8000/headers' | python -m json.tool
```
  - 위처럼 실행하게되면, 이번에는 `v1`과 `v2` 모두에서 access log를 확인할 수 있을 것이다.
```console
$ kubectl logs -f $V1_POD -c httpbin
127.0.0.1 - - [07/Mar/2018:19:02:43 +0000] "GET /headers HTTP/1.1" 200 321 "-" "curl/7.35.0"
127.0.0.1 - - [07/Mar/2018:19:26:44 +0000] "GET /headers HTTP/1.1" 200 321 "-" "curl/7.35.0"
```
```console
$ kubectl logs -f $V2_POD -c httpbin
127.0.0.1 - - [07/Mar/2018:19:26:44 +0000] "GET /headers HTTP/1.1" 200 361 "-" "curl/7.35.0"
```

3. 만약 트래픽 내부에 대해서 살펴보려면, 아래와 같은 커맨드를 실행시켜보자.
```console
$ export SLEEP_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
$ export V1_POD_IP=$(kubectl get pod -l app=httpbin -l version=v1 -o jsonpath={.items..status.podIP})
$ export V2_POD_IP=$(kubectl get pod -l app=httpbin -l version=v2 -o jsonpath={.items..status.podIP})
$ kubectl exec -it $SLEEP_POD -c istio-proxy -- sudo tcpdump -A -s 0 host $V1_POD_IP or host $V2_POD_IP
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
05:47:50.159513 IP sleep-7b9f8bfcd-2djx5.38836 > 10-233-75-11.httpbin.default.svc.cluster.local.80: Flags [P.], seq 4039989036:4039989832, ack 3139734980, win 254, options [nop,nop,TS val 77427918 ecr 76730809], length 796: HTTP: GET /headers HTTP/1.1
E..P2.X.X.X.
.K.
.K....P..W,.$.......+.....
..t.....GET /headers HTTP/1.1
host: httpbin:8000
user-agent: curl/7.35.0
accept: */*
x-forwarded-proto: http
x-request-id: 571c0fd6-98d4-4c93-af79-6a2fe2945847
x-envoy-decorator-operation: httpbin.default.svc.cluster.local:8000/*
x-b3-traceid: 82f3e0a76dcebca2
x-b3-spanid: 82f3e0a76dcebca2
x-b3-sampled: 0
x-istio-attributes: Cj8KGGRlc3RpbmF0aW9uLnNlcnZpY2UuaG9zdBIjEiFodHRwYmluLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwKPQoXZGVzdGluYXRpb24uc2VydmljZS51aWQSIhIgaXN0aW86Ly9kZWZhdWx0L3NlcnZpY2VzL2h0dHBiaW4KKgodZGVzdGluYXRpb24uc2VydmljZS5uYW1lc3BhY2USCRIHZGVmYXVsdAolChhkZXN0aW5hdGlvbi5zZXJ2aWNlLm5hbWUSCRIHaHR0cGJpbgo6Cgpzb3VyY2UudWlkEiwSKmt1YmVybmV0ZXM6Ly9zbGVlcC03YjlmOGJmY2QtMmRqeDUuZGVmYXVsdAo6ChNkZXN0aW5hdGlvbi5zZXJ2aWNlEiMSIWh0dHBiaW4uZGVmYXVsdC5zdmMuY2x1c3Rlci5sb2NhbA==
content-length: 0


05:47:50.159609 IP sleep-7b9f8bfcd-2djx5.49560 > 10-233-71-7.httpbin.default.svc.cluster.local.80: Flags [P.], seq 296287713:296288571, ack 4029574162, win 254, options [nop,nop,TS val 77427918 ecr 76732809], length 858: HTTP: GET /headers HTTP/1.1
E.....X.X...
.K.
.G....P......l......e.....
..t.....GET /headers HTTP/1.1
host: httpbin-shadow:8000
user-agent: curl/7.35.0
accept: */*
x-forwarded-proto: http
x-request-id: 571c0fd6-98d4-4c93-af79-6a2fe2945847
x-envoy-decorator-operation: httpbin.default.svc.cluster.local:8000/*
x-b3-traceid: 82f3e0a76dcebca2
x-b3-spanid: 82f3e0a76dcebca2
x-b3-sampled: 0
x-istio-attributes: Cj8KGGRlc3RpbmF0aW9uLnNlcnZpY2UuaG9zdBIjEiFodHRwYmluLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwKPQoXZGVzdGluYXRpb24uc2VydmljZS51aWQSIhIgaXN0aW86Ly9kZWZhdWx0L3NlcnZpY2VzL2h0dHBiaW4KKgodZGVzdGluYXRpb24uc2VydmljZS5uYW1lc3BhY2USCRIHZGVmYXVsdAolChhkZXN0aW5hdGlvbi5zZXJ2aWNlLm5hbWUSCRIHaHR0cGJpbgo6Cgpzb3VyY2UudWlkEiwSKmt1YmVybmV0ZXM6Ly9zbGVlcC03YjlmOGJmY2QtMmRqeDUuZGVmYXVsdAo6ChNkZXN0aW5hdGlvbi5zZXJ2aWNlEiMSIWh0dHBiaW4uZGVmYXVsdC5zdmMuY2x1c3Rlci5sb2NhbA==
x-envoy-internal: true
x-forwarded-for: 10.233.75.12
content-length: 0


05:47:50.166734 IP 10-233-75-11.httpbin.default.svc.cluster.local.80 > sleep-7b9f8bfcd-2djx5.38836: Flags [P.], seq 1:472, ack 796, win 276, options [nop,nop,TS val 77427925 ecr 77427918], length 471: HTTP: HTTP/1.1 200 OK
E....3X.?...
.K.
.K..P...$....ZH...........
..t...t.HTTP/1.1 200 OK
server: envoy
date: Fri, 15 Feb 2019 05:47:50 GMT
content-type: application/json
content-length: 241
access-control-allow-origin: *
access-control-allow-credentials: true
x-envoy-upstream-service-time: 3

{
  "headers": {
    "Accept": "*/*",
    "Content-Length": "0",
    "Host": "httpbin:8000",
    "User-Agent": "curl/7.35.0",
    "X-B3-Sampled": "0",
    "X-B3-Spanid": "82f3e0a76dcebca2",
    "X-B3-Traceid": "82f3e0a76dcebca2"
  }
}

05:47:50.166789 IP sleep-7b9f8bfcd-2djx5.38836 > 10-233-75-11.httpbin.default.svc.cluster.local.80: Flags [.], ack 472, win 262, options [nop,nop,TS val 77427925 ecr 77427925], length 0
E..42.X.X.\.
.K.
.K....P..ZH.$.............
..t...t.
05:47:50.167234 IP 10-233-71-7.httpbin.default.svc.cluster.local.80 > sleep-7b9f8bfcd-2djx5.49560: Flags [P.], seq 1:512, ack 858, win 280, options [nop,nop,TS val 77429926 ecr 77427918], length 511: HTTP: HTTP/1.1 200 OK
E..3..X.>...
.G.
.K..P....l....;...........
..|...t.HTTP/1.1 200 OK
server: envoy
date: Fri, 15 Feb 2019 05:47:49 GMT
content-type: application/json
content-length: 281
access-control-allow-origin: *
access-control-allow-credentials: true
x-envoy-upstream-service-time: 3

{
  "headers": {
    "Accept": "*/*",
    "Content-Length": "0",
    "Host": "httpbin-shadow:8000",
    "User-Agent": "curl/7.35.0",
    "X-B3-Sampled": "0",
    "X-B3-Spanid": "82f3e0a76dcebca2",
    "X-B3-Traceid": "82f3e0a76dcebca2",
    "X-Envoy-Internal": "true"
  }
}

05:47:50.167253 IP sleep-7b9f8bfcd-2djx5.49560 > 10-233-71-7.httpbin.default.svc.cluster.local.80: Flags [.], ack 512, win 262, options [nop,nop,TS val 77427926 ecr 77429926], length 0
E..4..X.X...
.K.
.G....P...;..n............
..t...|.
```
  - 실행된 내용을 살펴보면, `istio-proxy` 컨테이너에서 tcpdump를 이용해서 `v1`, `v2`의 패킷을 찍어본 것이다.
  



## 3. Ingress
Kubernetes환경에서 [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)라는 리소스는 cluster 외부에서 노출할 서비스를 지정하는데 사용한다. Istio에서는 좀더 낳은 접근(Kubernetes나 다른 환경 모두에서 동작하는) 방법을 사용할 수 있다. 그것이 바로 [Istio Gateway](https://istio.io/docs/reference/config/networking/v1alpha3/gateway/)라는 것이다. `Gateway`라는 것을 통해서 cluster로 들어오는 트래픽에 대한 monitoring이나 route rule과 같은 기능을 가능하게 해준다.

여기에서는 istio가 `Gateway`를 이용해서 서비스를 메쉬 바깥쪽에 어떻게 노출시키는지 살펴볼 것이다.

### Ingress Concept
#### Ingress란?
Networking community에서 나온 용어로 외부로부터 내부 네트워크의 외부에서 안쪽으로 들어오는 트래픽을 의미하며, 트래픽이 내부 네트워크 상에서 최초로 통과하는 부분을 Ingress Point라고 한다. 이 Ingress point를 통하지 않는다면, 내부 네트워크로 트래픽이 인입될 수 없다. 또한 Ingress point는 내부 네트워크의 특정 endpoint로 proxy해주는 역할을 한다.

#### Reverse proxy
Ingress는 reverse proxy와 동일한 역할을 수행하며, 외부의 요청에 대해서 Cluster 내부의 service로 proxy해주며, service 단위의 로드밸런싱 기능도 제공해준다.

#### Istio Gateway
Istio에서는 이런 Ingress 역할을 담당하는 것이 Gateway이다. 즉 Ingress point 역할을 수행해서 cluster 외부에서 내부로 트래픽을 전달하고, load balancing, virtual-host routing 등을 수행한다.

또한 Istio Gateway는 Istio의 control plane 중 하나로, ingress proxy를 구현하는데 Envoy를 사용한다. 
Istio를 설치했다면, 초기화 과정에서 이미 ingress의 구현체가 설치되어 있을 것이다.
```console
$ kubectl get pod -n istio-system
NAME                                      READY     STATUS      RESTARTS   AGE
istio-ingressgateway-788c96cd5f-lfxk9     1/1       Running     0          28d

$ kubectl get pod istio-ingressgateway-788c96cd5f-lfxk9 -o json -n istio-system
{
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
        "labels": {
            "app": "istio-ingressgateway",
            "istio": "ingressgateway",
            "release": "istio"
            "chart": "gateways",
            "heritage": "Tiller",
            "pod-template-hash": "3447527819",
        }
        ...
    ...
}

$ kubectl get svc -n istio-system
NAME                     TYPE         CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
istio-ingressgateway   LoadBalancer  10.104.143.79  localhost    80:31380/TCP...   28d

$ kubectl get svc istio-ingressgateway -o json -n istio-system
{
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
        "selector": {
            "app": "istio-ingressgateway",
            "istio": "ingressgateway",
            "release": "istio"
        },
        ...
    ...
}
```

#### Gateway, VirtualService
- Gateway : 클러스터 외부에 내부로 트래픽을 허용하는 설정
- VirtualService : 클러스터 내부로 들어온 트래픽을 특정 서비스로 라우팅하는 설정

#### Istio는 왜 Kubernetes의 Ingress를 사용하지 않은 것인가?
Istio도 초기에는 Kubernetes의 Ingerss를 사용했지만, 아래과 같은 이유로 Gateway를 만들었다고 한다.

1. Kubernetes의 Ingress는 HTTP/S 트래픽만 전달해주는 너무 심플한 spec이기때문이다. Kafka같은 큐를 사용한다면, broker를 TCP connection으로 제공해줄 수 있지만 Kubernetes Ingress에서는 이를 지원하지 않는다.

2. 또한 Kubernetes Ingress가 특정 패키지에 종속적이기 때문이다. 다르게 말해서 정해진 표준이 없고 구현체(Nginx, HAProxy, Traefik, Ambassodor) 마다 설정 방법이 다르다. 복잡한 routing rule, traffic splitting, shadowing등 상세한 설정을 하기 위한 표준화된 방법이 없다. 그렇다고 Istio도 새로운 구현체를 만들어서 추가한다면 더욱 복잡해질 것이다.


### 준비 
- [Istio 설치]()
- [httpbin](https://github.com/istio/istio/tree/release-1.1/samples/httpbin) 샘플 설치
  - autumatic sidecar injection이 설정되어 있다면,
  ```console
  $ kubectl apply -f samples/httpbin/httpbin.yaml
  ```
  - autumatic sidecar injection이 설정되어 있지 않다면,
  ```console
  $ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/httpbin.yaml)
  ```

### ingress의 IP와 ports 가져오기
external load balancer를 지원해주는 kubernetes cluster 환경에서 동작중이라면 아래 커맨드를 실행시켜보자.
```console
$ kubectl get svc istio-ingressgateway -n istio-system
NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                                      AGE
istio-ingressgateway   LoadBalancer   172.21.109.129   130.211.10.121  80:31380/TCP,443:31390/TCP,31400:31400/TCP   17h
```
만약 `EXTERNAL-IP` 값이 설정되어 있다면, 현재 실행 환경이 ingress gateway를 사용할 수 있는 external load balancer를 지원하는 환경이라고 보면된다. 
하지만 `EXTERNAL-IP` 값이 `<none>`이라면 (혹은 `<pending>`이라면) 현재 환경이 external load balancer를 지원하지 않는 것이다. 이 경우에는 서비스의 [node port](https://kubernetes.io/docs/concepts/services-networking/service/#nodeport)를 이용해서 이용해서 gateway에 접근할 수 있다.


#### external load balancer 사용해서 ingress의 IP, ports 가져오기
external load balancer를 지원한다면, 다음 커맨드를 이용해보자.
```console
$ export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
$ export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
$ export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}')
```

특정 환경에서, IP를 사용하지 않고 host name을 이용해서 load balancer가 노출될 수 있다. 이 경우에는 `EXTERNAL-IP` 값이 IP address가 아니라 host name이 보여질 것이다. 
따라서 위의 `INGRESS_HOST` 환경변수값이 아무것도 채워져 있지 않을 것이기 때문에, 아래와 같은 커맨드로 host name을 가져와야한다.
```console
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
```

#### node ports 사용해서 ingress의 IP, ports 가져오기
external load balancer를 가지고 있지 않다면 아래와 같은 커맨드를 사용해보자.
```console
export INGRESS_HOST=$(kubectl get po -l istio=ingressgateway -n istio-system -o jsonpath='{.items[0].status.hostIP}')
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}')
export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].nodePort}')
```

만약 docker for Desktop을 사용한다면, 다음과 같은 커맨드로 host를 설정해도 될 것이다.
```console
export INGRESS_HOST=127.0.0.1
```

### Istio Gateway를 이용해서 Ingress 설정
Ingress에서 [Gateway](https://istio.io/docs/reference/config/networking/v1alpha3/gateway/)는 메쉬의 종단에서 HTTP/TCP connection을 받아주는 load balancer를 나타낸다. 따라서 노출할 ports와 protocol등을 설정해야한다. 하지만 [Kubernetes Ingress Resource](https://kubernetes.io/docs/concepts/services-networking/ingress/)와 다르게 어떠한 routing rules도 포함하지 않는다. Ingress 트래픽에 대한 routing은 Istio의 routing rules를 사용해서 설정하며, 내부 서비스간의 reqeust일때와 동일하게 설정하면 된다.

80번 port와 HTTP 트래픽을 사용하는 `Gateway`에 대한 설정은 다음과 같을 것이다.
1. Istio의 `Gateway`를 생성한다.
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: httpbin-gateway
spec:
  selector:
    istio: ingressgateway # use Istio default gateway implementation
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "httpbin.example.com"
EOF
```

2. `Gateway`를 통해서 인입되는 트래픽에 대한 routing을 설정한다. 
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
  - "httpbin.example.com"
  gateways:
  - httpbin-gateway
  http:
  - match:
    - uri:
        prefix: /status
    - uri:
        prefix: /delay
    route:
    - destination:
        port:
          number: 8000
        host: httpbin
EOF
```
  - 위처럼 `/status`와 `/delay`라는 두개의 path에 대해서 routing rules를 가지는 `httpbin` 서비스에 대해서 `virtual service`를 설정하였다. 
  - 위의 `gateways` 설정에서 `httpbin-gateway`라고 설정하면 해당 `gateway`으로부터 인입되는 트래픽만 허용한다는 의미하며, 그 이외의 트래픽은 모두 404로 응답한다.
  
  - 만약 다른 서비스로부터 `internal 요청`이 들어오게 되면, 위에서 설정한 rules이 적용되지 않는다. 대신에 default round-robin routing이 실행될 것이다. 따라서 위에서 설정한 rules에 대해서 internal 요청에도 적용하려면, special value인 `mesh`라는 값을 `gateways`리스트에 추가해주면 된다. 
  - 만약 `Internal hostname`으로 요청했을 경우에도 (예를 들면, `httpbin.default.svc.cluster.local`), `hosts` 리스트에 요청한 호스트가 추가되어야한다. 더 자세한 사항은 [troubleshooting guid](https://istio.io/help/ops/traffic-management/troubleshooting/#route-rules-have-no-effect-on-ingress-gateway-requests)를 참고하자.
  
3. curl을 이용해서 httpbin 서비스에 접근해보자.
```console
$ curl -I -HHost:httpbin.example.com http://$INGRESS_HOST:$INGRESS_PORT/status/200
HTTP/1.1 200 OK
server: envoy
date: Mon, 29 Jan 2018 04:45:49 GMT
content-type: text/html; charset=utf-8
access-control-allow-origin: *
access-control-allow-credentials: true
content-length: 0
x-envoy-upstream-service-time: 48
```
  - 위에서 `-H` 옵션은 요청시 host를 지정하는 것이다. 이 옵션을 사용하는 이유는 위의 설정한 ingress `Gateway`의 설정을 통해서 "httpbin.example.com"라는 호스트만 허용했기 때문이다. 하지만 test환경에서는 이 host에 대한 DNS 바인딩이 되어있지 않으므로 ingress IP로 요청해도 될 것이다.
  
4. 명시적으로 노출하지 않은 다른 URL에 접근해보자. 이 경우는 당연히 `404`를 수신할 것이다.
```console
$ curl -I -HHost:httpbin.example.com http://$INGRESS_HOST:$INGRESS_PORT/headers
HTTP/1.1 404 Not Found
date: Mon, 29 Jan 2018 04:45:49 GMT
server: envoy
content-length: 0
```

### 브라우저로 ingress service에 접근
브라우저에서 `httpbin`서비스 URL로 접속해보면 동작하지 않을텐데 이건 브라우저가 위의 curl 명령처럼 host가 `httpbin.example.com`인것처럼 동작하지 않기때문이다. 하지만 real world에서는 host를 정확히 입력할뿐만 아니라 DNS에서도 resolve될것이기 때문에 문제가 되지 않을것이다. 그러므로 `https://httpbin.example.com/status/200`처럼 host domain name을 사용하면 된다.
테스트나 데모를 위해서 이 문제를 work around로 처리하려면, `Gateway`와 `VirtualService`설정에 있는 `host`부분에 `*`(wildcard)로 처리하면된다. 
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: httpbin-gateway
spec:
  selector:
    istio: ingressgateway # use Istio default gateway implementation
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
  - "*"
  gateways:
  - httpbin-gateway
  http:
  - match:
    - uri:
        prefix: /headers
    route:
    - destination:
        port:
          number: 8000
        host: httpbin
EOF
```
  - 그리고나서 브라우저에서 `$INGRESS_HOST:$INGRESS_PORT` URL(예를 들어, `http://192.168.99.100:31380/headers`)로 접속해보면 브라우저에서 보내는 header 정보를 확인할 수 있다.

### 정리
`Gateway` 리소스는 external 트패픽에 대해서 Istio 메쉬 내부로 인입할 수 있게 했으며, edge 서비스들이 Istio의 traffic management와 policy와 같은 기능을 사용할 수 있게 한것이다. 
이번 장에서는 메쉬 안쪽에서 서비스르 만들고 external 트래픽을 받을 서비스의 HTTP endpoint를 노출했다.

### Troubleshooting
1. 아래 커맨드를 이용해서 환경 변수 `INGRESS_HOST`, `INGRESS_PORT`값이 정상적인지 확인해본다.
```console
$ kubectl get svc -n istio-system
$ echo INGRESS_HOST=$INGRESS_HOST, INGRESS_PORT=$INGRESS_PORT
```

2. 생성되어 있는 다른 ingress gateway가 같은 port를 사용하고 있는지 확인해본다.
```console
$ kubectl get gateway --all-namespaces
```

3. 같은 IP와 Port로 설정한 kubernetes의 ingress resource가 있는지 확인해본다.
```console
$ kubectl get ingress --all-namespaces
```

4. 만약 external load balancer를 가지고 있지만 사용하지 않는다면, 서비스의 [node port](https://istio.io/docs/tasks/traffic-management/ingress/#determining-the-ingress-ip-and-ports-when-using-a-node-port)를 이용해서 접근해보자.



## 4. Egress
Istio내의 pod으로부터 나가는 모든 outbound 트래픽은 기본적으로 sidecar proxy로 redirecdt된다. cluster 외부로의 접근은 proxy의 설정에 따라 달라질 수 있다. Istio에서는 기본적으로 Envoy proxy가 unknown service에 대한 요청을 그냥 흘려보낸다. 하지만 이런 방법이 편할 수는 있지만, 좀더 strict한 설정이 보통 사용될 것이다.

이번 장에서는 external service에 접근하는 3가지 방법에 대해서 살펴볼 것이다.
1. Envoy proxy가 mesh 내부에 설정하지 않은 service로의 접근을 허용하는 방법
2. [Service entries](https://istio.io/docs/reference/config/networking/v1alpha3/service-entry/)를 설정하여 external service로의 접근을 제어하는 방법
3. 특정 IP 대역에 대해서 Envoy proxy가 bypass하는 방법


### 준비 
- [Istio 설치]
- requests를 전송하기 위한 [sleep](https://github.com/istio/istio/tree/release-1.1/samples/sleep)이라는 앱 배포
  - autumatic sidecar injection이 설정되어 있다면,
  ```console
  $ kubectl apply -f samples/sleep/sleep.yaml
  ```
  - autumatic sidecar injection이 설정되어 있지 않다면,
  ```console
  $ kubectl apply -f <(istioctl kube-inject -f samples/sleep/sleep.yaml)
  ```
  - 위에서 만든 pod에 대한 접근할 수 있게 `SOURCE_POD`이라는 환경변수 설정
  ```console
  $ export SOURCE_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
  ```

### Envoy에서 external services로 바로 전달하는 방법
Istio의 [installation option](https://istio.io/docs/reference/config/installation-options/)을 보면, `global.outboundTrafficPolicy.mode`라는 옵션이 있는데, 이는 sidecar가 external service에 대해서 어떻게 처리할지에 대한 설정이다. 
만약 이 옵션이 
  - `ALLOW_ANY` 라면, Istio proxy는 unknown service에 대해서 passthrough하도록 한다. (이 값이 기본이며 external service에 대한 접근을 따로 제어하지 않는다)
  - `REGISTRY_ONLY`라면, Istio proxy가 HTTP service가 아니거나 메쉬에 정의되어 있지 않은 service entry에 대해서는 block한다.

1. 우선 `global.outboundTrafficPolicy.mode = ALLOW_ANY`로 설정되어 있어야한다. Istio 설치할때 `REGISTRY_ONLY`로 설정되어 있지 않다면, 기본값인 `ALLOW_ANY`로 설정되어 있을것이다.
  - 아래 커맨드를 실행시키고 제대로 실행되었는지 확인해보자.
```console
$ kubectl get configmap istio -n istio-system -o yaml | grep -o "mode: ALLOW_ANY"
mode: ALLOW_ANY
```
  - `mode: ALLOW_ANY`라는 실행 결과가 확인될 것이다.
  - 만약 `REGISTER_ONLY` 모드로 설정되어 있다면, 아래 커맨드로 변경해줘야한다.  
```console
$ kubectl get configmap istio -n istio-system -o yaml | sed 's/mode: REGISTRY_ONLY/mode: ALLOW_ANY/g' | kubectl replace -n istio-system -f -
configmap "istio" replaced
```

2. `$SOURCE_POD`에서 external HTTPS services에 대해서 두번의 request를 날려서 200 OK가 오는지 확인해보자.
```console
$ kubectl exec -it $SOURCE_POD -c sleep -- curl -I https://www.google.com | grep  "HTTP/"; kubectl exec -it $SOURCE_POD -c sleep -- curl -I https://edition.cnn.com | grep "HTTP/"
HTTP/2 200
HTTP/2 200
```

이제 egress traffic이 정상적으로 나가는것을 확인할 수 있을 것이다.

위의 방법은 간단하지만 문제점이 있다. Istio의 모니터링과 external service에 대한 제어를 하지 못한다는 것이다. 예를 들면, external service로의 요청이 Mixer log에 보이지 않을 것이다. 다음 챕터에서는 external service로의 접근에서 어떻게 모니터링하거나 제어하는지 살펴볼 것이다.


### Controlled access to external services
Istio의 `ServiceEntry`설정을 이용해서, Istio cluster 내부에서 어떠한 service로든 접근이 가능하다. 이번에는 어떻게 httpbin.org와 같은 external HTTP service로 접근할 수 있게 설정하는지 살펴볼것이다. www.google.com 같은 HTTPS service도 마찬가지이며, monitoring과 control과 같은 기능도 가능하게 할것이다.

#### blocking-by-default policy 변경
external service로의 접근을 제어하는 방법을 사용하려면, `global.outboundTrafficPolicy.mode` 옵션을 `ALLOW_ANY`에서 `REGISTRY_ONLY`로 변경해야한다.

1. `global.outboundTrafficPolicy.mode` 옵션을 `REGISTRY_ONLY`로 변경하려면 아래와 같은 커맨드를 실행하자.
```console
$ kubectl get configmap istio -n istio-system -o yaml | sed 's/mode: ALLOW_ANY/mode: REGISTRY_ONLY/g' | kubectl replace -n istio-system -f -
configmap "istio" replaced
```

2. `$SOURCE_POD`에서 external HTTPS service로 requests를 2번 전송하여 block되는지 확인해보자.
```console
$ kubectl exec -it $SOURCE_POD -c sleep -- curl -I https://www.google.com | grep  "HTTP/"; kubectl exec -it $SOURCE_POD -c sleep -- curl -I https://edition.cnn.com | grep "HTTP/"
command terminated with exit code 35
command terminated with exit code 35
```
- 위의 설정이 적용되는데까지는 몇초정도 걸릴 수 있다.

#### external HTTP service에 접근
1. `ServiceEntry`를 만들어서 external HTTP service로 접근할 수 있게하자.
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: httpbin-ext
spec:
  hosts:
  - httpbin.org
  ports:
  - number: 80
    name: http
    protocol: HTTP
  resolution: DNS
  location: MESH_EXTERNAL
EOF
```

2. `$SOURCE_POD`에서 external HTTP service로 요청을 보내보자.
```console
$ kubectl exec -it $SOURCE_POD -c sleep -- curl http://httpbin.org/headers
{
  "headers": {
  "Accept": "*/*",
  "Connection": "close",
  "Host": "httpbin.org",
  "User-Agent": "curl/7.60.0",
  ...
  "X-Envoy-Decorator-Operation": "httpbin.org:80/*",
  }
}
```
  - sidecar proxy를 통과하면서 `X-Envoy-Decorator-Operation`라는 헤더를 추가된 것을 확인할 수 있다.
  
3. `$SOURCE_POD`의 sidecar proxy에서의 로그를 확인해보자.
```console
$ kubectl logs $SOURCE_POD -c istio-proxy | tail
[2019-01-24T12:17:11.640Z] "GET /headers HTTP/1.1" 200 - 0 599 214 214 "-" "curl/7.60.0" "17fde8f7-fa62-9b39-8999-302324e6def2" "httpbin.org" "35.173.6.94:80" outbound|80||httpbin.org - 35.173.6.94:80 172.30.109.82:55314
```
  - `destinationServiceHost`라는 attribute는 `httpbin.org`와 동일할 것이다. 또한 HTTP와 관련된 atrribute인 `method`, `url`, `responseCode`와 같은 것들도 마찬가지이다. Istio의 egress 트래픽 제어를 사용한다면, external service에 대한 모니터링이 가능하며, HTTP 관련된 정보들에 대해서도 접근이 가능하다.
  
#### external HTTPS service에 접근
1. `ServiceEntry`를 생성해서 external HTTPS service에 접근해보자.
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: google
spec:
  hosts:
  - www.google.com
  ports:
  - number: 443
    name: https
    protocol: HTTPS
  resolution: DNS
  location: MESH_EXTERNAL
EOF
```

2. `$SOURCE_POD`에서 external HTTPS service로 요청을 보내보자.
```console
$ kubectl exec -it $SOURCE_POD -c sleep -- curl -I https://www.google.com | grep  "HTTP/"
HTTP/2 200
```

3. `$SOURCE_POD`에 있는 sidecar proxy에서 로그를 확인해보자.
```console
$ kubectl logs $SOURCE_POD -c istio-proxy | tail
[2019-01-24T12:48:54.977Z] "- - -" 0 - 601 17766 1289 - "-" "-" "-" "-" "172.217.161.36:443" outbound|443||www.google.com 172.30.109.82:59480 172.217.161.36:443 172.30.109.82:59478 www.google.com
```

4. Mixer 로그를 확인하자. 
```console
$ kubectl -n istio-system logs -l istio-mixer-type=telemetry -c mixer | grep 'www.google.com'
{"level":"info","time":"2019-01-24T12:48:56.266553Z","instance":"tcpaccesslog.logentry.istio-system","connectionDuration":"1.289085134s","connectionEvent":"close","connection_security_policy":"unknown","destinationApp":"","destinationIp":"rNmhJA==","destinationName":"unknown","destinationNamespace":"default","destinationOwner":"unknown","destinationPrincipal":"","destinationServiceHost":"www.google.com","destinationWorkload":"unknown","protocol":"tcp","receivedBytes":601,"reporter":"source","requestedServerName":"www.google.com","sentBytes":17766,"sourceApp":"sleep","sourceIp":"rB5tUg==","sourceName":"sleep-88ddbcfdd-rgk77","sourceNamespace":"default","sourceOwner":"kubernetes://apis/apps/v1/namespaces/default/deployments/sleep","sourcePrincipal":"","sourceWorkload":"sleep","totalReceivedBytes":601,"totalSentBytes":17766}
```
  - `requestedServerName` attribute는 `www.google.com`일 것이다. Istio의 egress 제어를 사용한다면, external HTTPS services에 접근을 모니터링할 수 있는데, 특히 SNI나 보내고 받은 bytes일 것이다.  HTTP와 관련된 atrribute인 `method`, `url`, `responseCode`와 같은 것들은 암호화되어 있어서, Istio가 볼 수 없다. 만약 external HTTPS service로 접근시 HTTP관련 정보들을 모니터링하고 싶다면, application이 HTTP 요청을 만들고 [Istio TLS origination를 할 수 있도록 설정](https://istio.io/docs/examples/advanced-gateways/egress-tls-origination/)하면 된다.


#### external services로의 트래픽을 관리
Cluster간의 요청과 유사하게, Istio의 [routing rules](https://istio.io/docs/concepts/traffic-management/#rule-configuration)은 `ServiceEntry`를 설정해서 external serivces로 접근할 수 있다. 본 예제에서는 `httpbin.org` 서비스를 호출할때 timeout rule을 설정한다. 

1. Pod 내부에서 `sleep` 컨테이너를 이용해서, curl 커맨드를 통해서 `/delay`로 요청을 보낸다.
```console
$ kubectl exec -it $SOURCE_POD -c sleep sh
$ time curl -o /dev/null -s -w "%{http_code}\n" http://httpbin.org/delay/5
200

real    0m5.024s
user    0m0.003s
sys     0m0.003s
```
  - `200 OK`를 받기까지는 약 5초의 시간이 소요된다.
  
2. source pod에서 나와서, `kubectl`을 사용하여 `httpbin.org`라는 external service에 대한 timeout을 `3초`로 설정해보자.
```console
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin-ext
spec:
  hosts:
    - httpbin.org
  http:
  - timeout: 3s
    route:
      - destination:
          host: httpbin.org
        weight: 100
EOF
```

3. 적용되기 위해 몇초정도 기다렸다가, *curl* 커맨드로 다시 요청해본다.
```console
$ kubectl exec -it $SOURCE_POD -c sleep sh
$ time curl -o /dev/null -s -w "%{http_code}\n" http://httpbin.org/delay/5
504

real    0m3.149s
user    0m0.004s
sys     0m0.004s
```
  - 이번에는 3초가 지난후에 `504 Gateway Timeout`을 받게 될 것이다. httpbin.org의 경우 5초를 기다리겠지만, Istio는 3초만에 요청를 끊어버린다.


### External service로 바로 접근하기
특정 IP대역에 대해서는 Istio가 완전히 bypass하길 원한다면, Envoy sidecars가 external 요청에 대해서 [intercepting](https://istio.io/docs/concepts/traffic-management/#communication-between-services)하지 않게해야한다. 이 bypass를 설정하기 위해서는, `global.proxy.includeIPRanges`나 `global.proxy.excludeIPRanges` 설정을 변경하면된다. 그리고 `istio-sidecar-injector` 설정을 `kubectl apply`를 이용해서 update하면 된다. `istio-sidecar-injector` 설정을 업데이트하면 이후의 모든 pod의 deployments에 영향을 미친다.

`ALLOW_ANY`를 사용해서 Istio sidecar proxy가 unknown serivce로의 요청을 바로 전달하는 [Envoy passthrough](https://istio.io/docs/tasks/traffic-management/egress/#envoy-passthrough-to-external-services)와는 다르게, 이 방법은 기본적으로 sidecar로 완전히 bypass하지만 명시된 IPs에 대해서는 Istio의 모든 기능은 비활성화 시킨다. 따라서 `ALLOW_ANY`를 사용한다면 특정 destination에 대해서 service 추가할 수 없게된다. 
그러므로 이러한 설정 방법은 성능상 혹은 다른 이유로 sidecar를 이용해 외부 접속을 설정할 수 없는 경우에 사용할것을 권장한다.

Sidecar proxy로 redirect시킬 외부 IPs를 제외하는 간단한 방법은 `global.proxy.includeIPRanges` 옵션을 IP range나 internal cluster service를 위한 range로 설정하는 것이다. 이러한 IP range 값은 cluster가 실행되는 platform에 종속적이다. 

#### Determine the internal IP ranges for your platform
`global.proxy.includeIPRanges`옵션 값을 cluster provider에 따라서 다르게 설정해야한다.
Minikube, Docker For Desktop, Bare Metal의 경우에는 기본 값이 `10.96.0.0/12`로 설정되어 있지만, 고정된것은 아니다. 아래와 같은 커맨드로 실제 값을 결정할 수 있다. 

```console
$ kubectl describe pod kube-apiserver -n kube-system | grep 'service-cluster-ip-range'
      --service-cluster-ip-range=10.96.0.0/12
```

### Configuring the proxy bypass
```
주의 : 이전 사용했던 service entry와 virtual service를 제거하고 진행하자
```

사용중인 Platform에 맞게 IP range를 명시해서 `istio-sidecar-injector` 설정을 업데이트하자.
```console
helm template install/kubernetes/helm/istio <the flags you used to install Istio> --set global.proxy.includeIPRanges="10.0.0.1/24" -x templates/sidecar-injector-configmap.yaml | kubectl apply -f -
```
Istio 설치할때와 동일한 Helm 커맨드를 사용해야한다. 특히 `--namespace` flag와 `--set global.proxy.includeIPRanges="10.0.0.1/24" -x templates/sidecar-injector-configmap.yaml` flags를 사용하는 것에 유의하자.


#### 외부 서비스에 접근
bypass 설정은 새로운 deployments일 경우에만 영향을 미치기 때문에, 기존의 `sleep` application을 재배포해야한다.

`istio-sidecar-injector` configmap을 업데이트한 후에, `sleep` application을 재배포한다. Istio의 sidecar는 internal request에 대해서만 intercept하거나 제어할 것이다. 그리고 external request에 대해서는 bypass할 것이다. 
```console
$ export SOURCE_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
$ kubectl exec -it $SOURCE_POD -c sleep curl http://httpbin.org/headers
{
  "headers": {
    "Accept": "*/*",
    "Connection": "close",
    "Host": "httpbin.org",
    "User-Agent": "curl/7.60.0"
  }
}
```
위에서 HTTP나 HTTPS를 통해서 external serivce로 접근하는것과 다르게, Istio sidecar와 관련된 어떤 header도 확인할 수 없을 것이다. external service로 전송되는 모든 요청은 sidecar의 로그 혹은 Mixer의 로그에서 확인할 수 없을 것이다. Istio의 sidecar로 Bypassing한다는 것은 external service로 접근하는것에 대해서 더 이상 모니터링하지 않겠다는 의미를 가진다.

### 정리
이번 장에서는 external service에 접근하기 위한 3가지 방법에 대해서 살펴보았다. 
1. Envoy proxy가 mesh 내부에 설정하지 않은 service로의 접근을 허용하는 방법
2. [Service entries](https://istio.io/docs/reference/config/networking/v1alpha3/service-entry/)를 설정하여 external service로의 접근을 제어하는 방법, **이 방법이 추천하는 방법이다.**
3. 특정 IP 대역에 대해서 Envoy proxy가 bypass하는 방법

첫번째 방법은 메쉬 내부에서 unknwon service에 접근하기위해서 Istio sidecar proxy에 바로 트래픽을 전달하는 방법이다. 이 방법을 사용할때는 external serivce로의 접근을 모니터링할 수 없으며, Istio의 트래픽 제어하는 기능을 제대로 사용하지 못하게 된다. 특정 services에 대해서 두번째 방법으로 빠르게 전환하기 위해서 external services에 대해서 service entries를 생성해야한다. 이 과정을 통해 모든 external serivce에 대해서 일단 접근이 가능하게 하고 나중에 접근을 제어할지 결정할 수 있다. 또한 트래픽에 대해서 모니터링이나 제어 기능을 사용할 수 있다.

두번째 방법은 service가 내부에 있건 외부에 있건, Istio service mesh 기능을 동일하게 사용하게 하는 방법이다. 위에서는 external service에 대한 접근을 어떻게 모니터링하거나 timeout 설정을 하는지 알아보았다.

세번째 방법은 external server로 바로 접근할 수 있도록 Istio sidecar proxy로 bypass하는 방법이다. 하지만 이 방법은 cluster provider에 따라서 추가적인 설정 필요로 한다. 첫번째 방법과 비슷하게, 모니터링이나 트래픽제어와 같은 Istio의 기능을 제대로 사용할 수 없게된다.



