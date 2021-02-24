# Plugging in existing CA Certificates

이 작업은 관리자가 기존 루트 인증서, 서명 인증서 및 키를 사용하여 Istio 인증 기관을 구성하는 방법을 보여줍니다.

기본적으로 Istio의 CA는 자체 서명 된 루트 인증서 및 키를 생성하고이를 사용하여 작업 부하 인증서에 서명합니다. Istio의 CA는 관리자가 지정한 인증서 및 키와 관리자가 지정한 루트 인증서를 사용하여 작업 부하 인증서에 서명 할 수도 있습니다. 이 작업은 이러한 인증서와 키를 Istio의 CA에 연결하는 방법을 보여줍니다.



## Plugging in existing certificates and key

Istio의 CA에서 기존 서명 \(CA\) 인증서 ca-cert.pem 및 키 ca-key.pem을 사용한다고 가정합니다. 또한 인증서 ca-cert.pem은 루트 인증서 root-cert.pem에 의해 서명됩니다. Istio 워크로드의 루트 인증서로 root-cert.pem을 사용하려고합니다.

다음 예에서 Istio CA의 서명 \(CA\) 인증서 \(ca-cert.pem\)는 루트 인증서 \(root-cert.pem\)와 다르므로 작업 부하가 루트 인증서에서 직접 작업 부하 인증서의 유효성을 검사 할 수 없습니다. 워크로드에는 신뢰 체인을 지정하기 위해 cert-chain.pem 파일이 필요합니다. 여기에는 워크로드와 루트 CA 사이의 모든 중간 CA 인증서가 포함되어야합니다. 이 예에서는 Istio CA의 서명 인증서가 포함되어 있으므로 cert-chain.pem은 ca-cert.pem과 동일합니다. ca-cert.pem이 root-cert.pem과 같으면 cert-chain.pem 파일이 비어 있어야합니다.

이러한 파일은 samples / certs / 디렉토리에서 사용할 수 있습니다.

```text
The default Istio CA installation configures the location of certificates and keys based on the predefined secret and file names used in the command below (i.e., secret named cacerts, root certificate in a file named root-cert.pem, Istio CA’s key in ca-key.pem, etc.). You must use these specific secret and file names, or reconfigure Istio’s CA when you deploy Istio.
```

다음 단계는 인증서와 키를 Istio의 CA에서 읽을 Kubernetes 보안 비밀에 연결합니다.

* 모든 입력 파일 ca-cert.pem, ca-key.pem, root-cert.pem 및 cert-chain.pem을 포함하는 비밀 cacert를 만듭니다.

```text
kubectl create namespace istio-system
kubectl create secret generic cacerts -n istio-system --from-file=samples/certs/ca-cert.pem \
    --from-file=samples/certs/ca-key.pem --from-file=samples/certs/root-cert.pem \
    --from-file=samples/certs/cert-chain.pem
```

* 데모 프로필을 사용하여 Istio를 배포합니다. Istio의 CA는 비밀 마운트 파일에서 인증서와 키를 읽습니다.

```text
istioctl install --set profile=demo
```

## Verifying the certificate

이 섹션에서는 CA에 연결 한 인증서로 워크로드 인증서가 서명되었는지 확인합니다. 이를 위해서는 컴퓨터에 openssl이 설치되어 있어야합니다.

* httpbin의 인증서 체인을 검색하기 전에 mTLS 정책이 적용되도록 20 초 동안 대기하십시오. 이 예제에 사용 된 CA 인증서가 자체 서명되었으므로 openssl 명령에서 반환 된 인증서 체인 오류에서 확인 오류 : num = 19 : 자체 서명 된 인증서가 예상됩니다.

```text
sleep 20; kubectl exec "$(kubectl get pod -l app=sleep -n foo -o jsonpath={.items..metadata.name})" -c istio-proxy -n foo -- openssl s_client -showcerts -connect httpbin.foo:8000 > httpbin-proxy-cert.txt
```

* 인증서 체인에서 인증서를 구문 분석합니다.

```text
sed -n '/-----BEGIN CERTIFICATE-----/{:start /-----END CERTIFICATE-----/!{N;b start};/.*/p}' httpbin-proxy-cert.txt > certs.pem
awk 'BEGIN {counter=0;} /BEGIN CERT/{counter++} { print > "proxy-cert-" counter ".pem"}' < certs.pem
```

* 루트 인증서가 관리자가 지정한 인증서와 동일한 지 확인합니다.

```text
openssl x509 -in samples/certs/root-cert.pem -text -noout > /tmp/root-cert.crt.txt
openssl x509 -in ./proxy-cert-3.pem -text -noout > /tmp/pod-root-cert.crt.txt
diff -s /tmp/root-cert.crt.txt /tmp/pod-root-cert.crt.txt
```

* CA 인증서가 관리자가 지정한 것과 동일한 지 확인합니다.

```text
openssl x509 -in samples/certs/ca-cert.pem -text -noout > /tmp/ca-cert.crt.txt
openssl x509 -in ./proxy-cert-2.pem -text -noout > /tmp/pod-cert-chain-ca.crt.txt
diff -s /tmp/ca-cert.crt.txt /tmp/pod-cert-chain-ca.crt.txt
```

* 루트 인증서에서 워크로드 인증서로의 인증서 체인을 확인하십시오.

```text
openssl verify -CAfile <(cat samples/certs/ca-cert.pem samples/certs/root-cert.pem) ./proxy-cert-1.pem
```

## Cleanup

* 비밀 cacerts, foo 및 istio-system 네임 스페이스를 제거하려면

```text
kubectl delete secret cacerts -n istio-system
kubectl delete ns foo istio-system
```



