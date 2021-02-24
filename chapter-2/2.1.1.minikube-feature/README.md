---
layout: splash
title: 2. Kubernetes & Istio 설치 및 시작해보기 (2.1 Kubernetes 설치 가이드))
date: '2019-03-03 08:26:28 -0400'
categories: istio
tags:
  - istio
  - install
---

# 2.3 Istio 설치

Istio 의 Service Mesh를 위한 다양한 기능을 테스트 하기 위해서는 기본적으로 Kubernetes, Kubectl, Helm와 같은 다양한 개발, 테스트 환경이 필요합니다.

Kubernetes는 **sidecar-deployment** 와 같은 배포 개념을 기본으로하는 Istio를 적용하기에 최적의 공간입니다. Kubernetes 를 어떠한 방식으로 설치하고 실행할지는 현재 보유하고 있는 인프라 자원의 상황에 따라 유연성을 가지고 선택할 수 있습니다. 개발자가 가지고 있는 노트북에서부터 퍼블릭 클라우드 사업자가 제공하는 Managed Service \(AWS\(EKS\), Azure\(AKS\), GCP\(Kubernetes Engine\) 를 이용할 수도 있고, 베어메탈 서버에 나만의 Kubernetes 클러스터 환경을 구축할 수 있습니다.

이번 장에서는 Kubernetes 클러스터 테스트/개발 환경 구축을 위해 [Minikube](https://kubernetes.io/ko/docs/tasks/xtools/install-minikube/) 와 [Kubectl](./) 설치 방법과 Kubernetes 클러스터에 마이크로서비스 예제 애플리케이션 Bookinfo를 배포하여 Istio를 통해 서비스 간 트래픽 컨트롤, 서비스 제어, 보안, 정책, 모니터링 등 주요 기능을 테스트하기 위한 환경 구축 방벙에 대해 자세히 소개하겠습니다.

