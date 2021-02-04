# HTTP Abort

탐색하는 시스템에 장애라고 응답하며, 전체 시스템의 반응을 살펴보는 간단한 개념이다. HTTP 오류코드를 응답하는 것은 istio의 RouteRule 을 이용하면 매우 간단하게 구현할 수 있다.

Based on previous exercises earlier in this book, recommendation v1 and v2 are both deployed and being randomly load balanced because that is the default behavior in Kubernetes/ OpenShift. Make sure to comment out the “timeout” line if that was used in a previous exercise. Now, you will be injecting errors and timeouts via Istio instead of using Java code:

```bash
oc get pods -l app=recommendation -n tutorial 
NAME READY STATUS RESTARTS AGE 
recommendation-v1-3719512284-7mlzw 2/2 Running 6 18h 
recommendation-v2-2815683430-vn77w 2/2 Running 0 3h
```

We use the Istio RouteRule to inject a percentage of faults, in this case, returning 50% HTTP 503’s:

```yaml
apiVersion: config.istio.io/v1alpha2
kind: RouteRule
metadata:
name: recommendation-503
spec:
  destination:
    namespace: tutorial
    name: recommendation
  precedence: 2
  route:
  - labels:
    app: recommendation
  httpFault:
    abort:
      percent: 50
      httpStatus: 503
```

And you apply the RouteRule with the istioctl command-line tool:

```bash
istioctl create -f istiofiles/route-rule-recommendation-503.yml -n tutorial
```

Testing the change is as simple as issuing a few curl commands at the customer end point. Make sure to test it a few times, looking for the resulting 503 approxi‐ mately 50% of the time.

```bash
curl customer-tutorial.$(minishift ip).nip.io
customer => preference => recommendation v1 from '99634814-sf4cl': 88

curl customer-tutorial.$(minishift ip).nip.io
customer => 503 preference => 503 fault filter abort
```

Clean up:

```bash
istioctl delete -f istiofiles/route-rule-recommendation-503.yml -n tutorial
```

